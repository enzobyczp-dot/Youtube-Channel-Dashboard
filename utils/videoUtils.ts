/**
 * Chuyển đổi một đối tượng Blob thành một URL dữ liệu base64.
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Tạo một ảnh thumbnail từ một URL video (object URL hoặc data URL).
 * @param videoUrl URL của video.
 * @returns Một promise phân giải với một URL dữ liệu base64 của ảnh thumbnail.
 */
export const generateThumbnail = (videoUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous'; 
    video.preload = 'metadata';

    const cleanup = () => {
        video.removeEventListener('seeked', onSeeked);
        video.removeEventListener('loadeddata', onLoadedData);
        video.removeEventListener('error', onError);
        video.remove();
    };

    const onSeeked = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          cleanup();
          return reject(new Error('Không thể lấy context của canvas.'));
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8);
        
        cleanup();
        resolve(thumbnailUrl);
      } catch (error) {
        cleanup();
        reject(error);
      }
    };
    
    const onLoadedData = () => {
        // Try to seek to 1 second, or halfway if the video is shorter.
        video.currentTime = Math.min(1, video.duration / 2); 
    };
    
    const onError = () => {
        cleanup();
        reject(new Error(`Lỗi tải video để tạo thumbnail: ${video.error?.message}`));
    };

    video.addEventListener('loadeddata', onLoadedData);
    video.addEventListener('seeked', onSeeked);
    video.addEventListener('error', onError);

    video.src = videoUrl;
    video.load();
  });
};
