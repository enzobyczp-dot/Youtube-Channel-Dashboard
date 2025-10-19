
import React from 'react';

interface MusicSelectorProps {
  music: string;
  setMusic: (music: string) => void;
  isDisabled: boolean;
}

const musicOptions = [
    { value: 'None', label: 'Không có' },
    { value: 'Cinematic', label: 'Điện ảnh' },
    { value: 'Upbeat Pop', label: 'Pop Sôi động' },
    { value: 'Calm Piano', label: 'Piano Nhẹ nhàng' },
    { value: 'Epic Orchestral', label: 'Giao hưởng Hùng tráng' },
    { value: 'Acoustic Folk', label: 'Acoustic Folk' },
    { value: 'Electronic Lo-fi', label: 'Electronic Lo-fi' },
];

export const MusicSelector: React.FC<MusicSelectorProps> = ({ music, setMusic, isDisabled }) => {
  return (
    <div>
      <label htmlFor="music" className="block text-sm font-medium text-gray-300 mb-2">
        Nhạc nền
      </label>
      <select
        id="music"
        value={music}
        onChange={(e) => setMusic(e.target.value)}
        disabled={isDisabled}
        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 disabled:opacity-50"
      >
        {musicOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
};
