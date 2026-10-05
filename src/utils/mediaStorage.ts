// IndexedDB storage for large video & image files to avoid localStorage 5MB quota errors
const DB_NAME = 'PastelPortfolioMediaDB';
const DB_VERSION = 1;
const STORE_NAME = 'media_blobs';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveMediaBlob(slotId: string, blob: Blob): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(blob, slotId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to save blob to IndexedDB:', err);
  }
}

export async function getMediaBlob(slotId: string): Promise<Blob | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(slotId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to get blob from IndexedDB:', err);
    return null;
  }
}

export async function deleteMediaBlob(slotId: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(slotId);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to delete blob from IndexedDB:', err);
  }
}

export async function clearAllMediaBlobs(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Failed to clear blobs from IndexedDB:', err);
  }
}

/**
 * Converts a Blob to a Base64 data URL for standalone HTML exports.
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Parses and normalizes video & image URLs from YouTube, YouTube Shorts, Google Drive, TikTok, direct MP4/WebM files, and image links.
 */
export function parseVideoUrl(inputUrl: string): {
  type: 'video' | 'image';
  videoType?: 'youtube' | 'tiktok' | 'gdrive' | 'url';
  embedUrl: string;
  directUrl: string;
} {
  const url = inputUrl.trim();

  // Check if image link
  const isImage =
    /\.(jpe?g|png|webp|gif|svg|avif)(\?.*)?$/i.test(url) ||
    url.startsWith('data:image/') ||
    url.includes('images.unsplash.com') ||
    url.includes('imgur.com') ||
    url.includes('fbcdn.net') ||
    url.includes('pinimg.com');
  if (isImage) {
    return {
      type: 'image',
      embedUrl: url,
      directUrl: url,
    };
  }

  // 1. YouTube (standard, shorts, youtu.be, embed, mobile)
  const ytMatch = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    return {
      type: 'video',
      videoType: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0`,
      directUrl: url,
    };
  }

  // 2. Google Drive video
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (driveMatch && driveMatch[1]) {
    return {
      type: 'video',
      videoType: 'gdrive',
      embedUrl: `https://drive.google.com/file/d/${driveMatch[1]}/preview`,
      directUrl: url,
    };
  }

  // 3. TikTok video embed
  const tiktokMatch = url.match(/tiktok\.com\/(?:@[\w.-]+\/video\/|v\/)(\d+)/i);
  if (tiktokMatch && tiktokMatch[1]) {
    return {
      type: 'video',
      videoType: 'tiktok',
      embedUrl: `https://www.tiktok.com/embed/v2/${tiktokMatch[1]}`,
      directUrl: url,
    };
  }

  // 4. Default direct video or media
  return {
    type: 'video',
    videoType: 'url',
    embedUrl: url,
    directUrl: url,
  };
}
