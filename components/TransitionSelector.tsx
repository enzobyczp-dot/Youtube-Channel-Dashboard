import React from 'react';

interface TransitionSelectorProps {
  transition: string;
  onChange: (transition: string) => void;
  isDisabled: boolean;
}

const transitionOptions = [
    { value: 'None', label: 'Không chuyển cảnh' },
    { value: 'Fade in', label: 'Mờ dần vào (Fade in)' },
    { value: 'Fade to black then fade in', label: 'Mờ sang đen rồi mờ vào' },
    { value: 'Cross dissolve', label: 'Hòa tan (Cross dissolve)' },
    { value: 'Wipe left', label: 'Quét sang trái (Wipe left)' },
    { value: 'Wipe right', label: 'Quét sang phải (Wipe right)' },
];

export const TransitionSelector: React.FC<TransitionSelectorProps> = ({ transition, onChange, isDisabled }) => {
  return (
    <div className="flex items-center justify-center my-2">
      <div className="flex items-center space-x-2 w-full max-w-xs">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
        <select
          value={transition}
          onChange={(e) => onChange(e.target.value)}
          disabled={isDisabled}
          aria-label="Scene transition"
          className="w-full text-sm p-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 disabled:opacity-50"
        >
          {transitionOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
};
