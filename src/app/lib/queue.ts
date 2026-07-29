type Task = () => Promise<any>;

class BackgroundTaskQueue {
  private queue: Task[] = [];
  private running = 0;
  private concurrencyLimit = 3; // Max 3 concurrent background CPU tasks

  push(task: Task) {
    this.queue.push(task);
    this.runNext();
  }

  private runNext() {
    if (this.running >= this.concurrencyLimit || this.queue.length === 0) {
      return;
    }

    const task = this.queue.shift();
    if (!task) return;

    this.running++;
    
    // Execute asynchronously
    task()
      .catch((error) => {
        console.error("[Background Queue] Task execution failed:", error);
      })
      .finally(() => {
        this.running--;
        this.runNext();
      });
  }
}

export const backgroundQueue = new BackgroundTaskQueue();
