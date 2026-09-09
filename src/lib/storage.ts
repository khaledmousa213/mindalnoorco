import {
  deleteObject,
  getDownloadURL,
  ref as storageRef,
  uploadBytes,
} from 'firebase/storage';
import { storage } from './firebase';

function randomId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function safeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80);
}

async function upload(path: string, file: File): Promise<string> {
  const objectRef = storageRef(storage, path);
  await uploadBytes(objectRef, file, { contentType: file.type || undefined });
  return getDownloadURL(objectRef);
}

export function uploadProductImage(file: File): Promise<string> {
  return upload(`products/images/${randomId()}-${safeName(file.name)}`, file);
}

export function uploadDatasheet(file: File): Promise<string> {
  return upload(`products/datasheets/${randomId()}-${safeName(file.name)}`, file);
}

/**
 * Delete a file given its download URL. Silently ignores files that are not in
 * our bucket or already gone (e.g. seed data pointing at external URLs).
 */
export async function deleteStorageFile(downloadUrl: string): Promise<void> {
  try {
    if (!downloadUrl.includes('firebasestorage.googleapis.com')) return;
    await deleteObject(storageRef(storage, downloadUrl));
  } catch {
    // best effort
  }
}

export const IMAGE_ACCEPT = 'image/png,image/jpeg,image/webp,image/avif';
export const DATASHEET_ACCEPT = 'application/pdf';
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_DATASHEET_BYTES = 20 * 1024 * 1024;
