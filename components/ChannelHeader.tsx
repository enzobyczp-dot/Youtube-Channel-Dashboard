import React from 'react';
import { ChannelStats } from '../types';
import { formatNumber } from '../utils/helpers';
import { StatIcon } from './StatIcon';

interface ChannelHeaderProps {
    stats: ChannelStats;
}

export const ChannelHeader: React.FC<ChannelHeaderProps> = ({ stats }) => {
    return (
        <div className="bg-gray-800/50 rounded-lg p-6 flex flex-col md:flex-row items-center gap-6">
            <img 
                src={stats.thumbnailUrl} 
                alt={`${stats.title} logo`}
                className="w-32 h-32 rounded-full border-4 border-indigo-500 shadow-lg"
            />
            <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-white">{stats.title}</h1>
                <p className="text-indigo-400 text-sm">@{stats.customUrl}</p>
                <p className="text-gray-300 mt-2 text-sm line-clamp-2">{stats.description}</p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-gray-700/50 p-3 rounded-lg">
                    <p className="text-2xl font-bold text-white">{formatNumber(stats.subscriberCount)}</p>
                    <p className="text-xs text-gray-400 uppercase">Subscribers</p>
                </div>
                 <div className="bg-gray-700/50 p-3 rounded-lg">
                    <p className="text-2xl font-bold text-white">{formatNumber(stats.viewCount)}</p>
                    <p className="text-xs text-gray-400 uppercase">Total Views</p>
                </div>
                 <div className="bg-gray-700/50 p-3 rounded-lg">
                    <p className="text-2xl font-bold text-white">{formatNumber(stats.videoCount)}</p>
                    <p className="text-xs text-gray-400 uppercase">Videos</p>
                </div>
            </div>
        </div>
    )
};
