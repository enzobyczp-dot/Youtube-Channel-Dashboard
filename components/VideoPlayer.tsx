import React, { useState, useEffect, useRef } from 'react';
import type { VideoProjectResult } from '../types';
import JSZip from 'jszip';

interface VideoPlayerProps {
  project: VideoProjectResult | null;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ project }) => {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isZipping, setIsZipping] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Reset to the first scene when the project changes
    setCurrentSceneIndex(0);
  }, [project]);
  
  if (!project || project.scenes.length === 0) return null;

  const handleVideoEnded = () => {
    if (currentSceneIndex < project.scenes.length - 1) {
      setCurrentSceneIndex(prevIndex => prevIndex + 1);
    }
  };

  const handleDownloadAll = async () => {
    if (!project) return;
    setIsZipping(true);

    try {
        const zip = new JSZip();
        for (let i = 0; i < project.scenes.length; i++) {
            const scene = project.scenes[i];
            const response = await fetch(scene.videoUrl);
            const blob = await response.blob();
            zip.file(`scene-${i + 1}-${scene.prompt.slice(0, 20).replace(/ /g,"_")}.mp4`, blob);
        }
        
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(zipBlob);
        link.download = `project-${project.id}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);

    } catch (error) {
        console.error("Failed to create zip file", error);
        alert("Không thể tạo tệp zip. Vui lòng thử lại.");
    } finally {
        setIsZipping(false);
    }
  };
  
  const currentScene = project.scenes[currentSceneIndex];

  return (
    <div className="w-full max-w-4xl mt-8">
      <div className="flex justify-between items-center mb-4 px-2">
        <h2 className="text-2xl font-bold text-white">Video của bạn đã sẵn sàng!</h2>
        <button
            onClick={handleDownloadAll}
            disabled={isZipping}
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-900/50 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
        >
          {isZipping ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Đang nén...</span>
              </>
          ) : (
             <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <span>Tải tất cả (.zip)</span>
             </>
          )}
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Video Player */}
        <div className="md:col-span-2 aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-2xl border-2 border-indigo-500/50">
          <video
            ref={videoRef}
            key={currentScene.videoUrl} // Force re-render when url changes
            controls
            autoPlay
            playsInline
            poster={currentScene.thumbnailUrl}
            onEnded={handleVideoEnded}
            className="w-full h-full object-contain"
          >
            <source src={currentScene.videoUrl} type="video/mp4" />
            Trình duyệt của bạn không hỗ trợ thẻ video.
          </video>
        </div>
        {/* Playlist */}
        <div className="md:col-span-1 bg-gray-800/50 p-2 rounded-lg max-h-[450px] overflow-y-auto">
            <h3 className="text-lg font-semibold p-2">Các cảnh</h3>
            <div className="space-y-2">
            {project.scenes.map((scene, index) => (
                <div 
                    key={scene.sceneId} 
                    className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${index === currentSceneIndex ? 'bg-indigo-600/50' : 'hover:bg-gray-700/50'}`}
                    onClick={() => setCurrentSceneIndex(index)}
                >
                    <img src={scene.thumbnailUrl} alt={`Cảnh ${index + 1}`} className="w-20 h-12 object-cover rounded-md mr-3" />
                    <div className="flex-1">
                        <p className="text-sm font-bold text-white">Cảnh {index + 1}</p>
                        <p className="text-xs text-gray-300 line-clamp-2">{scene.prompt}</p>
                    </div>
                     <a
                        href={scene.videoUrl}
                        download={`scene-${index + 1}.mp4`}
                        onClick={(e) => e.stopPropagation()}
                        className="ml-2 p-2 text-gray-300 hover:text-white"
                        aria-label={`Tải xuống cảnh ${index + 1}`}
                     >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                     </a>
                </div>
            ))}
            </div>
        </div>
      </div>
    </div>
  );
};