import React, { useState, useEffect } from 'react';
import type { ChannelGroup, ChannelStats } from '../types';

interface GroupSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (group: Omit<ChannelGroup, 'id'> & { id?: string }) => void;
    existingGroup?: ChannelGroup | null;
    allChannels: ChannelStats[];
}

export const GroupSettingsModal: React.FC<GroupSettingsModalProps> = ({ isOpen, onClose, onSave, existingGroup, allChannels }) => {
    const [name, setName] = useState('');
    const [selectedChannelIds, setSelectedChannelIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (isOpen) {
            if (existingGroup) {
                setName(existingGroup.name);
                setSelectedChannelIds(new Set(existingGroup.channelIds));
            } else {
                setName('');
                setSelectedChannelIds(new Set());
            }
        }
    }, [existingGroup, isOpen]);

    if (!isOpen) return null;

    const handleToggleChannel = (channelId: string) => {
        const newSet = new Set(selectedChannelIds);
        if (newSet.has(channelId)) {
            newSet.delete(channelId);
        } else {
            newSet.add(channelId);
        }
        setSelectedChannelIds(newSet);
    };

    const handleSave = () => {
        if (!name.trim()) {
            // Simple validation feedback
            const nameInput = document.getElementById('groupName');
            nameInput?.focus();
            nameInput?.classList.add('ring-2', 'ring-red-500');
            setTimeout(() => nameInput?.classList.remove('ring-2', 'ring-red-500'), 2000);
            return;
        }
        onSave({
            id: existingGroup?.id,
            name: name.trim(),
            channelIds: Array.from(selectedChannelIds),
        });
        onClose();
    };
    
    return (
         <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="group-modal-title"
        >
            <div 
                className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl border border-indigo-500/30 m-4 flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 id="group-modal-title" className="text-xl font-bold">
                        {existingGroup ? 'Edit Group' : 'Create New Group'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close modal">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
                    <div>
                        <label htmlFor="groupName" className="block text-sm font-medium text-gray-300 mb-2">Group Name</label>
                        <input
                            id="groupName"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Main Competitors"
                            className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-gray-300 mb-2">Select Channels ({selectedChannelIds.size} selected)</h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto bg-gray-900/50 p-3 rounded-lg border border-gray-700">
                            {allChannels.length > 0 ? allChannels.map(channel => (
                                <label key={channel.id} className="flex items-center p-2 rounded-md hover:bg-gray-700/50 cursor-pointer transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={selectedChannelIds.has(channel.id)}
                                        onChange={() => handleToggleChannel(channel.id)}
                                        className="h-5 w-5 rounded bg-gray-600 border-gray-500 text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <img src={channel.thumbnailUrl} alt={channel.title} className="w-8 h-8 rounded-full mx-3" />
                                    <span className="text-sm font-medium text-white">{channel.title}</span>
                                </label>
                            )) : (
                                <p className="text-sm text-gray-500 text-center py-4">No channels tracked yet. Add channels on the main dashboard first.</p>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end items-center p-4 border-t border-gray-700 bg-gray-800/50 rounded-b-lg">
                    <button onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg mr-2">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg">
                        Save Group
                    </button>
                </div>
            </div>
        </div>
    );
};
