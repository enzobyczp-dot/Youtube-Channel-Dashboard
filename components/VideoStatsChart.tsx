import React from 'react';
import { VideoStat } from '../types';
import { formatNumber } from '../utils/helpers';

interface VideoStatsChartProps {
    videos: VideoStat[];
}

export const VideoStatsChart: React.FC<VideoStatsChartProps> = ({ videos }) => {
    if (!videos || videos.length === 0) {
        return null;
    }

    const chartData = videos.slice(0, 12).map(v => ({
        ...v,
        viewCount: parseInt(v.viewCount, 10) || 0,
    })).sort((a,b) => b.viewCount - a.viewCount);

    const maxViews = Math.max(...chartData.map(v => v.viewCount), 1);

    return (
        <div className="bg-gray-800/50 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Video Views Snapshot (Top 12 from loaded)</h2>
            <div className="space-y-4">
                {chartData.map((video) => (
                    <div key={video.id} className="group flex items-center gap-4">
                        <div className="w-1/3 text-right pr-4 truncate">
                             <a href={`https://www.youtube.com/watch?v=${video.id}`} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-300 group-hover:text-indigo-400 transition-colors" title={video.title}>
                                {video.title}
                            </a>
                        </div>
                        <div className="w-2/3">
                            <div className="relative w-full bg-gray-700 rounded-full h-6">
                                <div
                                    className="bg-indigo-600 h-6 rounded-full text-xs font-medium text-blue-100 text-center p-0.5 leading-none transition-all duration-500"
                                    style={{ width: `${(video.viewCount / maxViews) * 100}%` }}
                                >
                                </div>
                                <span className="absolute inset-0 flex items-center justify-start pl-3 text-sm font-semibold text-white">
                                    {formatNumber(video.viewCount)} views
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};