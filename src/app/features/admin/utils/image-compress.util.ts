/**
 * Client-side image compression before upload.
 * Resizes to `maxDimension` and re-encodes as JPEG so large phone photos
 * are never shipped to the server at full size.
 */

const MAX_DIMENSION = 1600;
const QUALITY = 0.8;

export function compressImage(file: File | Blob, maxDimension = MAX_DIMENSION, quality = QUALITY): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    const sourceName = file instanceof File ? file.name : '';

    img.onload = () => {
      try {
        URL.revokeObjectURL(url);
        const { width, height } = img;
        const scale = Math.min(1, maxDimension / Math.max(width, height));
        const targetWidth = Math.round(width * scale);
        const targetHeight = Math.round(height * scale);

        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas not supported');
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Compression failed'));
              return;
            }
            const name = (sourceName || `upload-${Date.now()}`).replace(/\.[^/.]+$/, '') + '.jpg';
            resolve(new File([blob], name, { type: 'image/jpeg' }));
          },
          'image/jpeg',
          quality
        );
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read image'));
    };
    img.src = url;
  });
}