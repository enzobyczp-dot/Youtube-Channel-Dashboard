import React from 'react';
import type { SortOrder } from '../types';

interface DashboardControlsProps {
    sortOrder: SortOrder;
    onSortOrderChange: (order: SortOrder) => void;
    videosPerPage: number;
    onVideosPerPageChange: (value: number) => void;
}

export const DashboardControls: React.FC<DashboardControlsProps> = ({
    sortOrder,
    onSortOrderChange,
    videosPerPage,
    onVideosPerPageChange,
}) => {
    return (
        <div className="bg-gray-800/50 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-2xl font-bold text-white text-center sm:text-left">
                Latest Videos
            </h2>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <label htmlFor="videosPerPage" className="text-sm font-medium text-gray-300">Videos per page:</label>
                    <select
                        id="videosPerPage"
                        value={videosPerPage}
                        onChange={(e) => onVideosPerPageChange(parseInt(e.target.value, 10))}
                        className="bg-gray-700 border border-gray-600 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="12">12</option>
                        <option value="24">24</option>
                        <option value="48">48</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <label htmlFor="sortOrder" className="text-sm font-medium text-gray-300">Sort by:</label>
                    <select
                        id="sortOrder"
                        value={sortOrder}
                        onChange={(e) => onSortOrderChange(e.target.value as SortOrder)}
                        className="bg-gray-700 border border-gray-600 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="date">Latest</option>
                        <option value="viewCount">Most Views</option>
                        <option value="likeCount">Most Likes</option>
                    </select>
                </div>
            </div>
        </div>
    );
};