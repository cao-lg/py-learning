import { storage } from './idb';
import type { SyncPayload } from '../types';

class SyncQueue {
  private isOnline: boolean = navigator.onLine;
  private syncInterval: number | null = null;

  constructor() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processQueue();
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  startAutoSync(intervalMs: number = 30000): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    this.syncInterval = window.setInterval(() => {
      if (this.isOnline) {
        this.processQueue();
      }
    }, intervalMs);
  }

  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  async enqueue(payload: SyncPayload): Promise<void> {
    await storage.addToSyncQueue(payload);
    if (this.isOnline) {
      this.processQueue();
    }
  }

  async processQueue(): Promise<void> {
    const queue = await storage.getSyncQueue();
    if (queue.length === 0) return;

    const failedItems: unknown[] = [];

    for (const item of queue) {
      try {
        const response = await fetch('/api/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });
        if (!response.ok) {
          failedItems.push(item);
        }
      } catch {
        failedItems.push(item);
      }
    }

    if (failedItems.length > 0) {
      await storage.clearSyncQueue();
      for (const item of failedItems) {
        await storage.addToSyncQueue(item);
      }
    } else {
      await storage.clearSyncQueue();
    }
  }
}

export const syncQueue = new SyncQueue();
