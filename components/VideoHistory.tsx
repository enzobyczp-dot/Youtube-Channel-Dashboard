
import React from 'react';
import { VideoHistoryItem } from '../types';

interface VideoHistoryProps {
  history: VideoHistoryItem[];
  onLoadProject: (project: VideoHistoryItem) => void;
  onDeleteProject: (id: string) => void;
  isDisabled: boolean;
}

export const VideoHistory: React.FC<VideoHistoryProps> = ({ history, onLoadProject, onDeleteProject, isDisabled }) => {
  if (history.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-5xl mt-12">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Lịch sử dự án</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {history.map((item) => (
          <div key={item.id} className="group relative aspect-video rounded-lg overflow-hidden shadow-lg border-2 border-gray-700 hover:border-indigo-500 transition-all duration-300">
            <img src={item.thumbnailUrl} alt={item.scenes[0]?.prompt || 'Dự án đã lưu'} className="w-full h-full object-cover" />
            <div 
                className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-2 text-center cursor-pointer"
                onClick={() => !isDisabled && onLoadProject(item)}
            >
              <p className="text-white text-xs font-bold">{item.scenes.length} cảnh</p>
              <p className="text-white text-xs line-clamp-3 mt-1">{item.scenes[0]?.prompt}</p>
            </div>
             <button
                onClick={(e) => {
                    e.stopPropagation(); // Prevent onLoadProject from firing
                    if (!isDisabled) onDeleteProject(item.id);
                }}
                disabled={isDisabled}
                className="absolute top-1 right-1 bg-red-600/80 hover:bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center text-xs z-10 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-20 disabled:cursor-not-allowed"
                aria-label="Xóa dự án"
            >
                &#x2715;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
