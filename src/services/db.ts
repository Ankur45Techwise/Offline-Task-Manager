import type { Task, Column, BoardState } from "../types/task";

const DB_NAME = "TaskManagerDB";
const DB_VERSION = 1;
const TASKS_STORE = "tasks";
const COLUMNS_STORE = "columns";

class DatabaseService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create tasks store
        if (!db.objectStoreNames.contains(TASKS_STORE)) {
          const taskStore = db.createObjectStore(TASKS_STORE, {
            keyPath: "id",
          });
          taskStore.createIndex("column", "column", { unique: false });
          taskStore.createIndex("createdAt", "createdAt", { unique: false });
        }

        // Create columns store
        if (!db.objectStoreNames.contains(COLUMNS_STORE)) {
          db.createObjectStore(COLUMNS_STORE, { keyPath: "id" });
        }
      };
    });
  }

  // Task operations
  async getAllTasks(): Promise<Task[]> {
    if (!this.db) throw new Error("Database not initialized");

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([TASKS_STORE], "readonly");
      const store = transaction.objectStore(TASKS_STORE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async addTask(task: Task): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([TASKS_STORE], "readwrite");
      const store = transaction.objectStore(TASKS_STORE);
      const request = store.add(task);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async updateTask(task: Task): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([TASKS_STORE], "readwrite");
      const store = transaction.objectStore(TASKS_STORE);
      const request = store.put(task);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteTask(taskId: string): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([TASKS_STORE], "readwrite");
      const store = transaction.objectStore(TASKS_STORE);
      const request = store.delete(taskId);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Column operations
  async getColumns(): Promise<Column[]> {
    if (!this.db) throw new Error("Database not initialized");

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([COLUMNS_STORE], "readonly");
      const store = transaction.objectStore(COLUMNS_STORE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async saveColumns(columns: Column[]): Promise<void> {
    if (!this.db) throw new Error("Database not initialized");

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([COLUMNS_STORE], "readwrite");
      const store = transaction.objectStore(COLUMNS_STORE);

      // Clear existing columns
      const clearRequest = store.clear();

      clearRequest.onsuccess = () => {
        // Add new columns
        let addedCount = 0;
        columns.forEach((column) => {
          const request = store.add(column);
          request.onsuccess = () => {
            addedCount++;
            if (addedCount === columns.length) {
              resolve();
            }
          };
          request.onerror = () => reject(request.error);
        });
      };

      clearRequest.onerror = () => reject(clearRequest.error);
    });
  }

  // Board state operations
  async getBoardState(): Promise<BoardState> {
    const [tasks, columns] = await Promise.all([
      this.getAllTasks(),
      this.getColumns(),
    ]);

    const tasksObject = tasks.reduce((acc, task) => {
      acc[task.id] = task;
      return acc;
    }, {} as { [key: string]: Task });

    const columnsObject = columns.reduce((acc, column) => {
      acc[column.id] = column;
      return acc;
    }, {} as { [key: string]: Column });

    return {
      tasks: tasksObject,
      columns: columnsObject,
      columnOrder: ["todo", "in-progress", "done"],
    };
  }

  async initializeDefaultData(): Promise<void> {
    // Check if data already exists
    const existingColumns = await this.getColumns();
    if (existingColumns.length > 0) return;

    // Create default columns
    const defaultColumns: Column[] = [
      { id: "todo", title: "To Do", taskIds: [] },
      { id: "in-progress", title: "In Progress", taskIds: [] },
      { id: "done", title: "Done", taskIds: [] },
    ];

    await this.saveColumns(defaultColumns);
  }
}

export const dbService = new DatabaseService();
