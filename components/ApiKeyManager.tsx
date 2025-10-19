
import React, { useState } from 'react';

interface ApiKeyManagerProps {
    apiKeys: string[];
    onApiKeysChange: (keys: string[]) => void;
    isDisabled: boolean;
}

const maskApiKey = (key: string) => {
    if (key.length < 8) return '***';
    return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
};

export const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ apiKeys, onApiKeysChange, isDisabled }) => {
    const [newKey, setNewKey] = useState('');

    const handleAddKey = () => {
        const trimmedKey = newKey.trim();
        if (trimmedKey && !apiKeys.includes(trimmedKey)) {
            onApiKeysChange([...apiKeys, trimmedKey]);
            setNewKey('');
        }
    };

    const handleRemoveKey = (keyToRemove: string) => {
        onApiKeysChange(apiKeys.filter(k => k !== keyToRemove));
    };
    
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAddKey();
        }
    };

    return (
        <div className="w-full max-w-2xl bg-gray-800/70 border border-indigo-500/50 rounded-lg p-6 space-y-6">
            <div>
                <h2 className="text-xl font-bold text-white">YouTube API Keys</h2>
                <p className="text-sm text-gray-300 mt-1">
                    Manage your pool of YouTube Data API keys. The app will automatically rotate keys if one reaches its daily quota. Get keys from the{' '}
                    <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline hover:text-indigo-300">Google Cloud Console</a>.
                </p>
            </div>
            
            <div className="space-y-3">
                <label htmlFor="add-api-key" className="block text-sm font-medium text-gray-300">Add New Key</label>
                <div className="flex space-x-2">
                    <input
                        id="add-api-key"
                        type="password"
                        value={newKey}
                        onChange={(e) => setNewKey(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Paste your API key here"
                        disabled={isDisabled}
                        className="flex-grow p-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
                    />
                    <button
                        onClick={handleAddKey}
                        disabled={!newKey.trim() || isDisabled}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900/50 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                        Add
                    </button>
                </div>
            </div>

            <div className="space-y-3">
                 <h3 className="text-lg font-semibold text-white">Active Keys ({apiKeys.length})</h3>
                 <div className="space-y-2 max-h-48 overflow-y-auto pr-2 bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                    {apiKeys.length > 0 ? (
                        apiKeys.map((key, index) => (
                            <div key={`${key.slice(-4)}-${index}`} className="flex items-center justify-between bg-gray-700/50 p-2 rounded-lg group">
                                <span className="font-mono text-sm text-green-400">{maskApiKey(key)}</span>
                                <button 
                                    onClick={() => handleRemoveKey(key)}
                                    disabled={isDisabled}
                                    className="text-red-500 hover:text-red-400 text-xs font-bold opacity-50 group-hover:opacity-100 transition-opacity disabled:opacity-20 disabled:cursor-not-allowed"
                                    aria-label={`Remove key ending in ${key.slice(-4)}`}
                                >
                                    REMOVE
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 text-sm py-4">No API keys configured. Please add one to begin.</p>
                    )}
                </div>
            </div>
        </div>
    );
};
