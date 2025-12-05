export let downloadedBytes = 0
export let totalBytes = 0
export const files = new Map()

class Defer {
  constructor() {
    this._p = new Promise((res) => (this._res = res))
  }
  resolve(v) {
    this._res(v)
  }
  get promise() {
    return this._p
  }
}

class AsyncQueue {
  constructor() {
    this.q = []
    this.waiters = []
  }
  push(item) {
    if (this.waiters.length) {
      this.waiters.shift().resolve(item)
    } else {
      this.q.push(item)
    }
  }
  async pop() {
    if (this.q.length) return this.q.shift()
    const d = new Defer()
    this.waiters.push(d)
    return d.promise
  }
  get size() {
    return this.q.length
  }
}

async function concatChunks(chunks) {
  const blob = new Blob(chunks)
  const arrayBuffer = await blob.arrayBuffer()
  return new Uint8Array(arrayBuffer)
}

async function downloadUrl(url, { onChunk, onStart } = {}) {
  const resp = await fetch(url, { cache: 'no-store' })
  if (!resp.ok) throw new Error(`HTTP ${resp.status} for ${url}`)
  const contentLength = Number(resp.headers.get('content-length') || 0)

  onStart && onStart({ url, contentLength })

  const reader = resp.body.getReader()
  const chunks = []
  let received = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    received += value.length
    chunks.push(value)
    onChunk && onChunk(value.length, received, contentLength)
  }

  const data = await concatChunks(chunks)
  return { data, size: received, contentLength: contentLength || undefined }
}

async function writeFile(path, data) {
  await window.api.writeFile(path, data)
}

export class DownloadPool {
  constructor(opts) {
    this.concurrency = Math.max(1, opts.concurrency | 0)
    this.onFileProgress = opts.onFileProgress
    this.onAnyProgress = opts.onAnyProgress
    this.onFileDownloaded = opts.onFileDownloaded
    this.onFileWritten = opts.onFileWritten
    this.onDrain = opts.onDrain
    this.onFinish = opts.onFinish

    this.taskQueue = new AsyncQueue()
    this.fileReadyQueue = new AsyncQueue()
    this.running = false
    this.inflight = 0

    this._allWorkersDone = new Defer()
  }

  enqueue(url, path) {
    this.taskQueue.push({ url, path })
  }

  start() {
    if (this.running) return
    this.running = true

    for (let i = 0; i < this.concurrency; i++) {
      this._workerLoop().catch((err) => {
        console.error('[worker] fatal', err)
      })
    }

    this._writerLoop().catch((err) => {
      console.error('[writer] fatal', err)
    })
  }

  async stop() {
    this.running = false
    await this._allWorkersDone.promise
  }

  async _workerLoop() {
    while (this.running) {
      const task = await this.taskQueue.pop()
      if (!task) continue

      this.inflight++
      try {
        let lastReported = 0
        const d = await downloadUrl(task.url, {
          onStart: ({ contentLength }) => {
            this.onFileProgress &&
              this.onFileProgress({
                path: task.path,
                url: task.url,
                received: 0,
                contentLength: contentLength || 0
              })
          },
          onChunk: (delta, received, contentLength) => {
            downloadedBytes += delta
            this.onAnyProgress && this.onAnyProgress({ downloadedBytes })
            if (received - lastReported >= 32 * 1024 || received === contentLength) {
              lastReported = received
              this.onFileProgress &&
                this.onFileProgress({
                  path: task.path,
                  url: task.url,
                  received,
                  contentLength: contentLength || 0
                })
            }
          }
        })

        files.set(task.path, d.data)
        this.onFileDownloaded && this.onFileDownloaded({ path: task.path, size: d.size })
        this.fileReadyQueue.push({ path: task.path, data: d.data })
      } catch (err) {
        console.error(`[download error] ${task.url} -> ${task.path}`, err)
      } finally {
        this.inflight--
        if (!this.running && this.inflight === 0) {
          this._allWorkersDone.resolve()
        }
      }
    }
  }

  async _writerLoop() {
    for (;;) {
      const item = await this._nextReadyOrExit()
      if (!item) break

      try {
        await writeFile(item.path, item.data)
        files.delete(item.path)
        totalBytes += item.data.length

        this.onFileWritten &&
          this.onFileWritten({
            path: item.path,
            size: item.data.length,
            totalBytes
          })
      } catch (err) {
        console.error(`[write error] ${item.path}`, err)
      }
    }
    this.onDrain && this.onDrain({ remaining: files.size, inflight: this.inflight })
  }

  async _nextReadyOrExit() {
    if (this.fileReadyQueue.size > 0) {
      return this.fileReadyQueue.pop()
    }
    if (!this.running && this.inflight === 0 && files.size === 0) {
      return null
    }
    return this.fileReadyQueue.pop()
  }
}
