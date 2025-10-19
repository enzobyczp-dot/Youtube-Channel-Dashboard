import React from 'react';
import { ChannelStats, VideoStat, SortOrder } from '../types';
import { ChannelHeader } from './ChannelHeader';
import { VideoCard } from './VideoCard';
import { VideoStatsChart } from './VideoStatsChart';
import { DashboardControls } from './DashboardControls';

interface DashboardProps {
    channelStats: ChannelStats;
    videos: VideoStat[];
    sortOrder: SortOrder;
    onSortOrderChange: (order: SortOrder) => void;
    videosPerPage: number;
    onVideosPerPageChange: (value: number) => void;
    onLoadMore: () => void;
    hasNextPage: boolean;
    isLoadingMore: boolean;
    onBack: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
    channelStats, 
    videos,
    sortOrder,
    onSortOrderChange,
    videosPerPage,
    onVideosPerPageChange,
    onLoadMore,
    hasNextPage,
    isLoadingMore,
    onBack
}) => {
    return (
        <div className="w-full max-w-7xl mx-auto mt-2 space-y-8">
            <div className="flex items-center">
                <button 
                    onClick={onBack}
                    className="flex items-center text-sm text-indigo-400 hover:text-indigo-300"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Back to All Channels
                </button>
            </div>
            <ChannelHeader stats={channelStats} />
            
            {videos.length > 0 && (
                <>
                    <VideoStatsChart videos={videos} />
                    
                    <DashboardControls 
                        sortOrder={sortOrder}
                        onSortOrderChange={onSortOrderChange}
                        videosPerPage={videosPerPage}
                        onVideosPerPageChange={onVideosPerPageChange}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {videos.map(video => (
                            <VideoCard key={video.id} video={video} />
                        ))}
                    </div>

                    {hasNextPage && (
                        <div className="flex justify-center">
                            <button
                                onClick={onLoadMore}
                                disabled={isLoadingMore}
                                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-900/50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-full transition-transform transform hover:scale-105 shadow-lg flex items-center"
                            >
                                {isLoadingMore ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Loading...
                                    </>
                                ) : (
                                    'Load More'
                                )}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};
