import React from 'react';

interface QualitySelectorProps {
  quality: 'HD' | 'FHD';
  setQuality: (quality: 'HD' | 'FHD') => void;
  isDisabled: boolean;
}

export const QualitySelector: React.FC<QualitySelectorProps> = ({ quality, setQuality, isDisabled }) => {
  return (
    <div>
      <label htmlFor="quality" className="block text-sm font-medium text-gray-300 mb-2">
        Chất lượng video
      </label>
      <select
        id="quality"
        value={quality}
        onChange={(e) => setQuality(e.target.value as 'HD' | 'FHD')}
        disabled={isDisabled}
        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 disabled:opacity-50"
      >
        <option value="FHD">Full HD (1080p)</option>
        <option value="HD">HD (720p)</option>
      </select>
    </div>
  );
};
