
import React, { useState } from 'react';
import type { ChannelComparisonData, ChannelGroup, VideoStat } from '../types';
import { formatNumber, formatRelativeTime } from '../utils/helpers';

const MiniVideoDisplay: React.FC<{ video: VideoStat | null | undefined, type: 'Newest' | 'Oldest' }> = ({ video, type }) => {
    if (video === undefined) {
        return <div className="text-xs text-gray-500">Loading...</div>;
    }
    if (video === null) {
        return <div className="text-xs text-gray-400">{type} video not found.</div>;
    }

    return (
        <a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 group">
            <img src={video.thumbnailUrl} alt={video.title} className="w-20 h-12 object-cover rounded-md flex-shrink-0" />
            <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate group-hover:text-indigo-400 transition-colors" title={video.title}>{video.title}</p>
                <p className="text-xs text-gray-400">{formatRelativeTime(video.publishedAt)}</p>
            </div>
        </a>
    );
};

const StatBar: React.FC<{ value: number, max: number, label: string }> = ({ value, max, label }) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return (
        <div className="w-full bg-gray-700 rounded-full h-6 relative">
            <div
                className="bg-indigo-600 h-6 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
            ></div>
            <span className="absolute inset-0 flex items-center justify-start pl-3 text-sm font-semibold text-white">
                {label}
            </span>
        </div>
    );
}

interface ComparisonDashboardProps {
    group: ChannelGroup;
    data: ChannelComparisonData[];
    onBack: () => void;
    dateRange: { start: string, end: string } | null;
    onDateRangeChange: (range: { start: string, end: string } | null) => void;
}

export const ComparisonDashboard: React.FC<ComparisonDashboardProps> = ({ group, data, onBack, dateRange, onDateRangeChange }) => {

    const [localDateRange, setLocalDateRange] = useState(dateRange ?? { start: '', end: '' });

    const handleApplyFilter = () => {
        if (localDateRange.start && localDateRange.end) {
            onDateRangeChange(localDateRange);
        }
    };
    
    const handleClearFilter = () => {
        setLocalDateRange({ start: '', end: '' });
        onDateRangeChange(null);
    }

    const maxValues = React.useMemo(() => {
        if (data.length === 0) return { subs: 0, views: 0, videos: 0 };
        return {
            subs: Math.max(...data.map(c => parseInt(c.subscriberCount, 10) || 0)),
            views: Math.max(...data.map(c => parseInt(c.viewCount, 10) || 0)),
            videos: Math.max(...data.map(c => parseInt(c.videoCount, 10) || 0)),
        };
    }, [data]);

    return (
        <div className="w-full max-w-7xl mx-auto mt-2 space-y-8">
            <div className="flex items-center justify-between">
                <button 
                    onClick={onBack}
                    className="flex items-center text-sm text-indigo-400 hover:text-indigo-300"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Back to All Channels
                </button>
                <h1 className="text-3xl font-bold text-white text-center">
                    Comparison: <span className="text-indigo-400">{group.name}</span>
                </h1>
                <div className="w-32"></div> {/* Spacer */}
            </div>
            
            <div className="bg-gray-800/50 rounded-lg p-4 space-y-3 md:space-y-0 md:flex justify-between items-center">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white">Date Range Filter</h3>
                     <p className="text-xs text-amber-400 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 3.001-1.742 3.001H4.42c-1.53 0-2.493-1.667-1.743-3.001l5.58-9.92zM10 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Warning: This is a high API quota usage feature.
                    </p>
                </div>
                <div className="flex-shrink-0 flex items-center gap-2">
                    <input type="date" value={localDateRange.start} onChange={e => setLocalDateRange(p => ({...p, start: e.target.value}))} className="bg-gray-700 border border-gray-600 rounded-md p-2 text-sm text-white" />
                    <span className="text-gray-400">to</span>
                    <input type="date" value={localDateRange.end} onChange={e => setLocalDateRange(p => ({...p, end: e.target.value}))} className="bg-gray-700 border border-gray-600 rounded-md p-2 text-sm text-white" />
                    <button onClick={handleApplyFilter} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg text-sm">Apply</button>
                    {dateRange && <button onClick={handleClearFilter} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg text-sm">Clear</button>}
                </div>
            </div>

            <div className="overflow-x-auto bg-gray-800/50 rounded-lg shadow-lg">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-1/5">Channel</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-1/6">Subscribers</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-1/6">{dateRange ? 'Views In Range' : 'Total Views'}</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-1/6">{dateRange ? 'Videos In Range' : 'Total Videos'}</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-1/4">{dateRange ? 'Newest In Range' : 'Newest Video'}</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-1/4">{dateRange ? 'Oldest In Range' : 'Oldest Video'}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-800 divide-y divide-gray-700">
                        {data.map((channel) => (
                            <tr key={channel.id} className="hover:bg-gray-700/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-12 w-12">
                                            <img className="h-12 w-12 rounded-full" src={channel.thumbnailUrl} alt="" />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-bold text-white">{channel.title}</div>
                                            <div className="text-sm text-indigo-400">@{channel.customUrl}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <StatBar value={parseInt(channel.subscriberCount, 10)} max={maxValues.subs} label={formatNumber(channel.subscriberCount)} />
                                </td>
                                <td className="px-6 py-4">
                                    <StatBar value={parseInt(channel.viewCount, 10)} max={maxValues.views} label={formatNumber(channel.viewCount)} />
                                </td>
                                <td className="px-6 py-4">
                                    <StatBar value={parseInt(channel.videoCount, 10)} max={maxValues.videos} label={formatNumber(channel.videoCount)} />
                                </td>
                                <td className="px-6 py-4">
                                    <MiniVideoDisplay video={channel.newestVideo} type="Newest" />
                                </td>
                                <td className="px-6 py-4">
                                    <MiniVideoDisplay video={channel.oldestVideo} type="Oldest" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
