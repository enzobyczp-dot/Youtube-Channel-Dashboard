import React from 'react';
import type { ChannelStats } from '../types';
import { formatNumber } from '../utils/helpers';

interface TrackedChannelCardProps {
    channel: ChannelStats;
    onSelect: (channelId: string) => void;
    onRemove: (channelId: string) => void;
}

export const TrackedChannelCard: React.FC<TrackedChannelCardProps> = ({ channel, onSelect, onRemove }) => {
    return (
        <div className="bg-gray-800 rounded-lg overflow-hidden shadow-lg group flex flex-col justify-between transition-transform transform hover:-translate-y-1 hover:shadow-indigo-500/20">
            <div className="p-4 flex flex-col items-center text-center">
                <img 
                    src={channel.thumbnailUrl} 
                    alt={`${channel.title} logo`}
                    className="w-24 h-24 rounded-full border-4 border-gray-700 group-hover:border-indigo-500 transition-colors"
                />
                <h3 className="text-lg font-bold text-white mt-4 line-clamp-2" title={channel.title}>
                    {channel.title}
                </h3>
                <p className="text-sm text-indigo-400">@{channel.customUrl}</p>
                <div className="flex justify-around w-full mt-4 text-sm">
                    <div className="text-center">
                        <p className="font-bold text-white">{formatNumber(channel.subscriberCount)}</p>
                        <p className="text-xs text-gray-400">Subs</p>
                    </div>
                    <div className="text-center">
                        <p className="font-bold text-white">{formatNumber(channel.videoCount)}</p>
                        <p className="text-xs text-gray-400">Videos</p>
                    </div>
                </div>
            </div>
             <div className="grid grid-cols-2 gap-px bg-gray-700">
                <button 
                    onClick={() => onRemove(channel.id)}
                    className="bg-gray-800 hover:bg-red-900/50 text-red-400 hover:text-red-300 font-semibold p-3 transition-colors text-sm"
                >
                    Remove
                </button>
                <button 
                    onClick={() => onSelect(channel.id)}
                    className="bg-gray-800 hover:bg-indigo-900/50 text-indigo-400 hover:text-indigo-300 font-semibold p-3 transition-colors text-sm"
                >
                    View Dashboard
                </button>
            </div>
        </div>
    );
};
