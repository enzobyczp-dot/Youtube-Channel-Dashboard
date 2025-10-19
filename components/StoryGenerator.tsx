import React, { useState } from 'react';
import { generateStoryFromPrompt } from '../services/geminiService';
import type { Scene } from '../types';

interface StoryGeneratorProps {
  onStoryGenerated: (scenes: Scene[]) => void;
  isDisabled: boolean;
}

// FIX: Implement the StoryGenerator component.
export const StoryGenerator: React.FC<StoryGeneratorProps> = ({ onStoryGenerated, isDisabled }) => {
  const [idea, setIdea] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateStory = async () => {
    if (!idea.trim()) {
      setError('Vui lòng nhập ý tưởng câu chuyện.');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const scenes = await generateStoryFromPrompt(idea);
      onStoryGenerated(scenes);
    } catch (err) {
      setError('Không thể tạo kịch bản. Vui lòng thử lại hoặc kiểm tra ý tưởng của bạn.');
      console.error("Story generation failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-800/50 rounded-lg space-y-3 border border-gray-700">
      <h2 className="text-lg font-semibold text-white">Tạo kịch bản với AI</h2>
      <p className="text-sm text-gray-400">
        Bạn có một ý tưởng? Hãy để AI giúp bạn phát triển thành một kịch bản video gồm nhiều cảnh.
      </p>
      <div>
        <textarea
          rows={2}
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          disabled={isDisabled || isLoading}
          placeholder="Ví dụ: một chú chó con khám phá ra một thế giới ma thuật trong sân sau nhà mình"
          className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 resize-none disabled:opacity-50"
        />
      </div>
      <button
        onClick={handleGenerateStory}
        disabled={isDisabled || isLoading || !idea.trim()}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900/50 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Đang tạo...
          </>
        ) : (
          'Tạo kịch bản'
        )}
      </button>
      {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
    </div>
  );
};
