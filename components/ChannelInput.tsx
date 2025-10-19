
import React, { useState } from 'react';

interface ChannelInputProps {
    onFetch: (channelId: string) => void;
    isDisabled: boolean;
    isAdding: boolean;
}

export const ChannelInput: React.FC<ChannelInputProps> = ({ onFetch, isDisabled, isAdding }) => {
    const [inputValue, setInputValue] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            onFetch(inputValue.trim());
            setInputValue('');
        }
    };
    
    return (
        <div className="w-full max-w-3xl space-y-4 text-center">
             <p className="text-gray-300 text-lg">
                Track new YouTube channels by entering their URL, ID, or @handle.
             </p>
             <p className="text-gray-400 text-sm -mt-2">
                You can add multiple channels at once by pasting each one on a new line.
            </p>
            <form onSubmit={handleSubmit} className="bg-gray-800/50 rounded-xl p-4 space-y-3">
                <textarea
                    rows={4}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={isDisabled}
                    placeholder={`e.g., https://www.youtube.com/@Google\nUC_x5XG1OV2P6uZZ5FSM9Ttw\nMrBeast`}
                    className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-white placeholder-gray-500 resize-y transition-colors"
                />
                <button
                    type="submit"
                    disabled={isDisabled || !inputValue.trim()}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900/50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-full transition-all transform hover:scale-105 shadow-lg shadow-indigo-500/30 flex items-center justify-center"
                    aria-label="Add Channel(s) to Track"
                >
                    {isAdding ? (
                         <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                         </svg>
                    ) : (
                        'Add Channel(s)'
                    )}
                </button>
            </form>
        </div>
    );
};
