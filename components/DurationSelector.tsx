import React from 'react';

interface DurationSelectorProps {
  duration: number;
  setDuration: (duration: number) => void;
  isDisabled: boolean;
}

export const DurationSelector: React.FC<DurationSelectorProps> = ({ duration, setDuration, isDisabled }) => {
  return (
    <div>
      <label htmlFor="duration" className="block text-sm font-medium text-gray-300 mb-2">
        Thời lượng video (giây)
      </label>
      <div className="flex items-center space-x-4">
        <input
          id="duration"
          type="range"
          min="1"
          max="15"
          step="1"
          value={duration}
          onChange={(e) => setDuration(parseInt(e.target.value, 10))}
          disabled={isDisabled}
          className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
        />
        <span className="w-12 text-center bg-gray-700 text-white text-sm font-medium px-2.5 py-1 rounded-lg">
          {duration}s
        </span>
      </div>
    </div>
  );
};
