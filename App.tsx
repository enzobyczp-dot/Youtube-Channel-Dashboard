
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SettingsModal } from './components/SettingsModal';
import { ApiKeyManager } from './components/ApiKeyManager';
import { MultiChannelView } from './components/MultiChannelView';
import { Dashboard } from './components/Dashboard';
import { ComparisonDashboard } from './components/ComparisonDashboard';
import { LoadingIndicator } from './components/LoadingIndicator';
import { ErrorDisplay } from './components/ErrorDisplay';
import { GroupSettingsModal } from './components/GroupSettingsModal';
import { getChannelStats, getChannelVideos, getOldestVideo, setApiKeys, getChannelStatsForDateRange, getNewestVideoInRange, getOldestVideoInRange } from './services/youtubeService';
import { extractChannelId } from './utils/helpers';
import type { ChannelStats, VideoStat, SortOrder, ChannelGroup, ChannelComparisonData } from './types';

// Define the shape of a selected channel's full data
interface SelectedChannelData {
    stats: ChannelStats;
    videos: VideoStat[];
    nextPageToken?: string;
}

const DEFAULT_API_KEYS = [
    'AIzaSyAXKwtLZ5umlg3Q8EhyUHXOHVRU7wzqqo4',
    'AIzaSyDjVs6HKSh6s-BY7TNGdcWBam9pxHL0FrM',
    'AIzaSyCiHjZSec4JRrjyCBV8TqywB6-htZQveh0',
    'AIzaSyB_BpGTbk-M10vvhWHa5YbKYDBrg5ZMLms',
    'AIzaSyAYRBnRv9LhIyzJZS0Y_NRRWhTWvLgxoXc'
];

const App: React.FC = () => {
    // Core State
    const [apiKeys, setApiKeysState] = useState<string[]>([]);
    const [trackedChannels, setTrackedChannels] = useState<ChannelStats[]>([]);
    const [channelGroups, setChannelGroups] = useState<ChannelGroup[]>([]);
    const [selectedChannel, setSelectedChannel] = useState<SelectedChannelData | null>(null);
    const [comparisonData, setComparisonData] = useState<ChannelComparisonData[]>([]);
    const [selectedGroup, setSelectedGroup] = useState<ChannelGroup | null>(null);
    const [view, setView] = useState<'multi' | 'single' | 'comparison'>('multi');

    // UI State
    const [isLoading, setIsLoading] = useState(true);
    const [isAddingChannel, setIsAddingChannel] = useState(false);
    const [isLoadingVideos, setIsLoadingVideos] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isLoadingComparison, setIsLoadingComparison] = useState(false);
    const [error, setError] = useState('');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<ChannelGroup | null>(null);

    // Dashboard State
    const [sortOrder, setSortOrder] = useState<SortOrder>('date');
    const [videosPerPage, setVideosPerPage] = useState<number>(12);
    const [comparisonDateRange, setComparisonDateRange] = useState<{ start: string; end: string } | null>(null);


    // Load settings from localStorage on initial mount
    useEffect(() => {
        try {
            const savedApiKeys = localStorage.getItem('youtubeApiKeys');
            const parsedKeys = savedApiKeys ? JSON.parse(savedApiKeys) : DEFAULT_API_KEYS;
            if (Array.isArray(parsedKeys) && parsedKeys.length > 0) {
                 setApiKeysState(parsedKeys);
                 setApiKeys(parsedKeys);
            } else {
                 setApiKeysState(DEFAULT_API_KEYS);
                 setApiKeys(DEFAULT_API_KEYS);
                 setIsSettingsOpen(true);
            }

            const savedChannels = localStorage.getItem('youtubeTrackedChannels');
            if (savedChannels) setTrackedChannels(JSON.parse(savedChannels));
            
            const savedGroups = localStorage.getItem('youtubeChannelGroups');
            if (savedGroups) setChannelGroups(JSON.parse(savedGroups));

            const savedVideosPerPage = localStorage.getItem('youtubeVideosPerPage');
            if (savedVideosPerPage) setVideosPerPage(parseInt(savedVideosPerPage, 10));

        } catch (e) {
            console.error("Failed to load settings from localStorage", e);
            setError("Could not load saved settings.");
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    // Handlers for settings
    const handleApiKeysChange = (newKeys: string[]) => {
        setApiKeysState(newKeys);
        setApiKeys(newKeys); // Update the service
        localStorage.setItem('youtubeApiKeys', JSON.stringify(newKeys));
    };
    
    const handleVideosPerPageChange = (newValue: number) => {
        setVideosPerPage(newValue);
        localStorage.setItem('youtubeVideosPerPage', String(newValue));
    };
    
    // Handlers for channel management
    const handleAddChannel = useCallback(async (channelInput: string) => {
        if (apiKeys.length === 0) {
            setError('Please set your YouTube Data API key(s) in Settings first.');
            setIsSettingsOpen(true);
            return;
        }

        const identifiers = channelInput.split('\n').map(s => s.trim()).filter(Boolean);
        if (identifiers.length === 0) return;

        setIsAddingChannel(true);
        setError('');

        const newChannels: ChannelStats[] = [];
        const errors: string[] = [];
        
        // Create a set of existing IDs for efficient lookup
        const existingIds = new Set(trackedChannels.map(c => c.id));

        for (const identifier of identifiers) {
            try {
                const channelIdentifier = extractChannelId(identifier);
                if (!channelIdentifier) {
                    errors.push(`Invalid format: ${identifier}`);
                    continue;
                }
                
                const stats = await getChannelStats(channelIdentifier);
                if (existingIds.has(stats.id) || newChannels.some(c => c.id === stats.id)) {
                    // Skip duplicates within the current session and against existing tracked channels
                    continue;
                }
                
                newChannels.push(stats);
            } catch (err: any) {
                console.error(`Failed to fetch channel '${identifier}':`, err);
                errors.push(`'${identifier}': ${err.message || 'An unknown error occurred.'}`);
            }
        }

        if (newChannels.length > 0) {
            const updatedChannels = [...trackedChannels, ...newChannels];
            setTrackedChannels(updatedChannels);
            localStorage.setItem('youtubeTrackedChannels', JSON.stringify(updatedChannels));
        }

        if (errors.length > 0) {
            setError(`Could not add all channels:\n- ${errors.join('\n- ')}`);
        }

        setIsAddingChannel(false);
    }, [apiKeys, trackedChannels]);

    const handleRemoveChannel = (channelId: string) => {
        const updatedChannels = trackedChannels.filter(c => c.id !== channelId);
        setTrackedChannels(updatedChannels);
        localStorage.setItem('youtubeTrackedChannels', JSON.stringify(updatedChannels));

        // Also remove from groups
        const updatedGroups = channelGroups.map(g => ({
            ...g,
            channelIds: g.channelIds.filter(id => id !== channelId)
        }));
        setChannelGroups(updatedGroups);
        localStorage.setItem('youtubeChannelGroups', JSON.stringify(updatedGroups));
    };
    
    const handleSelectChannel = useCallback(async (channelId: string) => {
        const stats = trackedChannels.find(c => c.id === channelId);
        if (!stats) return;
        
        setView('single');
        setIsLoadingVideos(true);
        setError('');
        setSelectedChannel(null);
        setSortOrder('date');
        
        try {
            const videoData = await getChannelVideos(stats.id, videosPerPage);
            setSelectedChannel({
                stats,
                videos: videoData.videos,
                nextPageToken: videoData.nextPageToken
            });
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
            setView('multi');
        } finally {
            setIsLoadingVideos(false);
        }
    }, [trackedChannels, videosPerPage]);

    // Group Handlers
    const handleOpenGroupModal = (group: ChannelGroup | null = null) => {
        setEditingGroup(group);
        setIsGroupModalOpen(true);
    };

    const handleSaveGroup = (groupData: Omit<ChannelGroup, 'id'> & { id?: string }) => {
        let updatedGroups;
        if (groupData.id) { // Editing existing group
            updatedGroups = channelGroups.map(g => g.id === groupData.id ? { ...g, name: groupData.name, channelIds: groupData.channelIds } : g);
        } else { // Creating new group
            const newGroup: ChannelGroup = {
                id: `group-${Date.now()}`,
                name: groupData.name,
                channelIds: groupData.channelIds
            };
            updatedGroups = [...channelGroups, newGroup];
        }
        setChannelGroups(updatedGroups);
        localStorage.setItem('youtubeChannelGroups', JSON.stringify(updatedGroups));
    };

    const handleDeleteGroup = (groupId: string) => {
        const updatedGroups = channelGroups.filter(g => g.id !== groupId);
        setChannelGroups(updatedGroups);
        localStorage.setItem('youtubeChannelGroups', JSON.stringify(updatedGroups));
    };

    const handleSelectGroup = useCallback(async (groupId: string, dateRange: { start: string, end: string} | null = null) => {
        const group = channelGroups.find(g => g.id === groupId);
        if (!group) return;

        setView('comparison');
        setIsLoadingComparison(true);
        setError('');
        setSelectedGroup(group);
        setComparisonData([]);
        setComparisonDateRange(dateRange);

        try {
            const groupChannels = trackedChannels.filter(c => group.channelIds.includes(c.id));

            const dataPromises = groupChannels.map(async (channel): Promise<ChannelComparisonData> => {
                 const [
                    newestVideo,
                    oldestVideo,
                    dateRangeStats
                ] = await Promise.all([
                    getNewestVideoInRange(channel.id, dateRange?.start, dateRange?.end),
                    getOldestVideoInRange(channel.uploadsPlaylistId, dateRange?.start, dateRange?.end),
                    dateRange ? getChannelStatsForDateRange(channel.id, dateRange.start, dateRange.end) : Promise.resolve(null),
                ]);

                return {
                    ...channel,
                    // If we have date range stats, override the total counts
                    viewCount: dateRangeStats?.viewCount ?? channel.viewCount,
                    videoCount: dateRangeStats?.videoCount ?? channel.videoCount,
                    newestVideo: newestVideo || null,
                    oldestVideo: oldestVideo || null,
                };
            });
            
            const results = await Promise.all(dataPromises);
            setComparisonData(results);

        } catch (err: any) {
            console.error("Failed to fetch comparison data:", err);
            setError(err.message || "An error occurred while fetching comparison data.");
            setView('multi');
        } finally {
            setIsLoadingComparison(false);
        }
    }, [channelGroups, trackedChannels]);


    const handleBackToMultiView = () => {
        setView('multi');
        setSelectedChannel(null);
        setComparisonData([]);
        setSelectedGroup(null);
        setComparisonDateRange(null);
        setError('');
    };
    
    const handleLoadMore = async () => {
        if (!selectedChannel || !selectedChannel.nextPageToken || isLoadingMore) return;
        
        setIsLoadingMore(true);
        setError('');
        try {
            const videoData = await getChannelVideos(selectedChannel.stats.id, videosPerPage, selectedChannel.nextPageToken);
            setSelectedChannel(prevData => prevData ? {
                ...prevData,
                videos: [...prevData.videos, ...videoData.videos],
                nextPageToken: videoData.nextPageToken
            } : null);
        } catch (err: any)
        {
            setError(err.message || 'An unknown error occurred while loading more videos.');
        } finally {
            setIsLoadingMore(false);
        }
    };
    
    const sortedVideos = useMemo(() => {
        if (!selectedChannel) return [];
        return [...selectedChannel.videos].sort((a, b) => {
            switch (sortOrder) {
                case 'viewCount':
                    return parseInt(b.viewCount, 10) - parseInt(a.viewCount, 10);
                case 'likeCount':
                    return (parseInt(b.likeCount, 10) || 0) - (parseInt(a.likeCount, 10) || 0);
                case 'date':
                default:
                    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
            }
        });
    }, [selectedChannel, sortOrder]);
    
    const renderContent = () => {
        if (isLoading) return <LoadingIndicator />;

        switch(view) {
            case 'single':
                return isLoadingVideos ? <LoadingIndicator /> : selectedChannel && (
                    <Dashboard 
                        channelStats={selectedChannel.stats} 
                        videos={sortedVideos}
                        sortOrder={sortOrder}
                        onSortOrderChange={setSortOrder}
                        videosPerPage={videosPerPage}
                        onVideosPerPageChange={handleVideosPerPageChange}
                        onLoadMore={handleLoadMore}
                        hasNextPage={!!selectedChannel.nextPageToken}
                        isLoadingMore={isLoadingMore}
                        onBack={handleBackToMultiView}
                    />
                );
            case 'comparison':
                return isLoadingComparison ? <LoadingIndicator /> : selectedGroup && (
                    <ComparisonDashboard
                        group={selectedGroup}
                        data={comparisonData}
                        onBack={handleBackToMultiView}
                        dateRange={comparisonDateRange}
                        onDateRangeChange={(range) => handleSelectGroup(selectedGroup.id, range)}
                    />
                );
            case 'multi':
            default:
                 return (
                    <MultiChannelView 
                        trackedChannels={trackedChannels}
                        groups={channelGroups}
                        onAddChannel={handleAddChannel}
                        onSelectChannel={handleSelectChannel}
                        onRemoveChannel={handleRemoveChannel}
                        onSelectGroup={(groupId) => handleSelectGroup(groupId)}
                        onEditGroup={(group) => handleOpenGroupModal(group)}
                        onDeleteGroup={handleDeleteGroup}
                        onCreateGroup={() => handleOpenGroupModal(null)}
                        isAdding={isAddingChannel}
                        apiKeySet={apiKeys.length > 0}
                    />
                );
        }
    };

    return (
        <div className="bg-gray-900 min-h-screen text-white font-sans antialiased">
            <Header onOpenSettings={() => setIsSettingsOpen(true)} />
            <main className="container mx-auto px-4 py-8 flex flex-col items-center space-y-8">
                {error && <ErrorDisplay message={error} />}
                {renderContent()}
            </main>
            <Footer />
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)}>
                <ApiKeyManager 
                    apiKeys={apiKeys}
                    onApiKeysChange={handleApiKeysChange}
                    isDisabled={false}
                />
            </SettingsModal>
            <GroupSettingsModal 
                isOpen={isGroupModalOpen}
                onClose={() => setIsGroupModalOpen(false)}
                onSave={handleSaveGroup}
                existingGroup={editingGroup}
                allChannels={trackedChannels}
            />
        </div>
    );
};

export default App;
