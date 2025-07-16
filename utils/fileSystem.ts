// File System Access API utilities
// Provides cross-browser file system operations with fallbacks

interface FileSystemFileHandle {
  kind: 'file';
  name: string;
  getFile(): Promise<File>;
  createWritable(): Promise<FileSystemWritableFileStream>;
}

interface FileSystemDirectoryHandle {
  kind: 'directory';
  name: string;
  keys(): AsyncIterableIterator<string>;
  values(): AsyncIterableIterator<FileSystemFileHandle | FileSystemDirectoryHandle>;
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>;
  getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<FileSystemDirectoryHandle>;
}

declare global {
  interface Window {
    showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
    showOpenFilePicker?: (options?: any) => Promise<FileSystemFileHandle[]>;
    showSaveFilePicker?: (options?: any) => Promise<FileSystemFileHandle>;
  }
}

export class FileSystemManager {
  private static directoryHandle: FileSystemDirectoryHandle | null = null;
  private static readonly STORAGE_KEY = 'fs-directory-handle';

  static async isSupported(): Promise<boolean> {
    return 'showDirectoryPicker' in window && 'showOpenFilePicker' in window;
  }

  static async requestDirectoryAccess(): Promise<FileSystemDirectoryHandle | null> {
    try {
      if (!window.showDirectoryPicker) {
        throw new Error('File System Access API not supported');
      }

      const handle = await window.showDirectoryPicker();
      this.directoryHandle = handle;
      
      // Store handle in IndexedDB for persistence
      await this.persistDirectoryHandle(handle);
      
      return handle;
    } catch (error) {
      console.error('Failed to get directory access:', error);
      return null;
    }
  }

  static async getDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
    if (this.directoryHandle) {
      return this.directoryHandle;
    }

    // Try to restore from IndexedDB
    const restored = await this.restoreDirectoryHandle();
    if (restored) {
      this.directoryHandle = restored;
      return restored;
    }

    return null;
  }

  static async saveFile(file: File, fileName: string): Promise<boolean> {
    try {
      const dirHandle = await this.getDirectoryHandle();
      if (!dirHandle) {
        throw new Error('No directory access');
      }

      const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      
      await writable.write(file);
      await writable.close();
      
      return true;
    } catch (error) {
      console.error('Failed to save file:', error);
      return false;
    }
  }

  static async readFile(fileName: string): Promise<File | null> {
    try {
      const dirHandle = await this.getDirectoryHandle();
      if (!dirHandle) {
        throw new Error('No directory access');
      }

      const fileHandle = await dirHandle.getFileHandle(fileName);
      return await fileHandle.getFile();
    } catch (error) {
      console.error('Failed to read file:', error);
      return null;
    }
  }

  static async deleteFile(fileName: string): Promise<boolean> {
    try {
      const dirHandle = await this.getDirectoryHandle();
      if (!dirHandle) {
        throw new Error('No directory access');
      }

      await dirHandle.removeEntry(fileName);
      return true;
    } catch (error) {
      console.error('Failed to delete file:', error);
      return false;
    }
  }

  static async listFiles(): Promise<string[]> {
    try {
      const dirHandle = await this.getDirectoryHandle();
      if (!dirHandle) {
        return [];
      }

      const files: string[] = [];
      for await (const [name, handle] of dirHandle.entries()) {
        if (handle.kind === 'file') {
          files.push(name);
        }
      }
      
      return files;
    } catch (error) {
      console.error('Failed to list files:', error);
      return [];
    }
  }

  private static async persistDirectoryHandle(handle: FileSystemDirectoryHandle): Promise<void> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction(['handles'], 'readwrite');
      const store = transaction.objectStore('handles');
      await store.put(handle, this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to persist directory handle:', error);
    }
  }

  private static async restoreDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
    try {
      const db = await this.openDB();
      const transaction = db.transaction(['handles'], 'readonly');
      const store = transaction.objectStore('handles');
      const handle = await store.get(this.STORAGE_KEY);
      
      if (handle) {
        // Verify the handle is still valid
        await handle.queryPermission({ mode: 'readwrite' });
        return handle;
      }
    } catch (error) {
      console.error('Failed to restore directory handle:', error);
    }
    
    return null;
  }

  private static openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('FileSystemHandles', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains('handles')) {
          db.createObjectStore('handles');
        }
      };
    });
  }
}

// Fallback implementation using File objects and localStorage
export class FallbackFileManager {
  private static readonly STORAGE_KEY = 'fallback-documents';

  static saveFile(file: File, id: string, metadata: any): boolean {
    try {
      const documents = this.getDocuments();
      documents[id] = {
        file: null, // Can't persist File objects
        metadata,
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified
      };
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(documents));
      return true;
    } catch (error) {
      console.error('Failed to save file metadata:', error);
      return false;
    }
  }

  static getDocuments(): Record<string, any> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  static deleteFile(id: string): boolean {
    try {
      const documents = this.getDocuments();
      delete documents[id];
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(documents));
      return true;
    } catch (error) {
      console.error('Failed to delete file metadata:', error);
      return false;
    }
  }
}