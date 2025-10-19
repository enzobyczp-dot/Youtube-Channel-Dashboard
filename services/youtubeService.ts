
import { ChannelStats, VideoStat } from '../types';

const API_BASE_URL = 'https://www.googleapis.com/youtube/v3';

let apiKeys: string[] = [];
let currentKeyIndex = 0;

export const setApiKeys = (keys: string[]) => {
    apiKeys = [...keys]; // Make a copy to avoid mutation issues
    currentKeyIndex = 0;
};

const getNextApiKey = (): string => {
    if (apiKeys.length === 0) {
        throw new Error('Please configure at least one YouTube Data API key in Settings.');
    }
    const key = apiKeys[currentKeyIndex];
    // Advance the index for the next call, wrapping around if necessary
    currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
    return key;
};

/**
 * Fetches data from the YouTube API with automatic key rotation and retries on quota failure.
 * @param endpoint The API endpoint to hit.
 * @param params The query parameters for the request.
 * @param attempt Internal counter for retry attempts to prevent infinite loops.
 * @returns A promise that resolves to the JSON response.
 */
const fetchYouTubeAPI = async (endpoint: string, params: Record<string, string>, attempt = 0): Promise<any> => {
    // Prevent infinite loops if all keys are bad
    if (attempt >= apiKeys.length && apiKeys.length > 0) {
        throw new Error(`All ${apiKeys.length} API key(s) failed, likely due to quota limits. Please try again later or add more keys.`);
    }

    const apiKey = getNextApiKey();
    try {
        const query = new URLSearchParams({ ...params, key: apiKey }).toString();
        const response = await fetch(`${API_BASE_URL}/${endpoint}?${query}`);
        
        if (!response.ok) {
            const errorData = await response.json();
            const reason = errorData.error?.errors?.[0]?.reason;

            // If it's a quota error and we have more keys to try, rotate and retry
            if ((reason === 'quotaExceeded' || reason === 'dailyLimitExceeded') && apiKeys.length > 1) {
                console.warn(`API key ending in ...${apiKey.slice(-4)} exceeded its quota. Trying next key...`);
                return fetchYouTubeAPI(endpoint, params, attempt + 1);
            }
            throw new Error(errorData.error?.message || 'Failed to fetch data from YouTube API.');
        }
        return response.json();
    } catch (error) {
        // Re-throw errors that are already from our retry logic
        if (error instanceof Error && error.message.includes('API key(s) failed')) {
            throw error;
        }

        console.error(`Request failed with key ending in ...${apiKey.slice(-4)}`, error);
        // Retry on other errors (like network errors) if we have more keys
        if (apiKeys.length > 1 && attempt < apiKeys.length - 1) {
             return fetchYouTubeAPI(endpoint, params, attempt + 1);
        }
        throw error;
    }
};


/**
 * Gets the channel ID. Handles different inputs like custom URLs or handles.
 * @param channelIdentifier The channel ID, custom URL name, or handle.
 * @returns The standard channel ID (UC...).
 */
async function resolveChannelId(channelIdentifier: string): Promise<string> {
    if (channelIdentifier.startsWith('UC')) {
        return channelIdentifier;
    }

    try {
        const data = await fetchYouTubeAPI('channels', { part: 'id', forUsername: channelIdentifier });
        if (data.items && data.items.length > 0) {
            return data.items[0].id;
        }
    } catch (error) {
        console.warn('Could not resolve channel ID with forUsername, trying search...');
    }
    
    const searchData = await fetchYouTubeAPI('search', { part: 'snippet', q: channelIdentifier, type: 'channel' });
    if (searchData.items && searchData.items.length > 0 && searchData.items[0].snippet.channelId) {
        return searchData.items[0].snippet.channelId;
    }

    throw new Error('Could not find a YouTube channel for the given identifier.');
}

/**
 * Fetches the main statistics for a given channel.
 * @param channelIdentifier The channel ID, custom URL name, or handle.
 * @returns An object containing channel stats.
 */
export const getChannelStats = async (
    channelIdentifier: string
): Promise<ChannelStats> => {
    const channelId = await resolveChannelId(channelIdentifier);
    
    const channelData = await fetchYouTubeAPI('channels', {
        part: 'snippet,statistics,contentDetails',
        id: channelId,
    });

    if (!channelData.items || channelData.items.length === 0) {
        throw new Error('Channel not found.');
    }

    const channel = channelData.items[0];
    const channelStats: ChannelStats = {
        id: channel.id,
        title: channel.snippet.title,
        description: channel.snippet.description,
        customUrl: channel.snippet.customUrl,
        publishedAt: channel.snippet.publishedAt,
        thumbnailUrl: channel.snippet.thumbnails.high.url,
        subscriberCount: channel.statistics.subscriberCount,
        videoCount: channel.statistics.videoCount,
        viewCount: channel.statistics.viewCount,
        uploadsPlaylistId: channel.contentDetails.relatedPlaylists.uploads,
    };
    return channelStats;
};

/**
 * Fetches a paginated list of a channel's latest videos and their stats.
 * @param channelId The standard channel ID (UC...).
 * @param maxResults The number of recent videos to fetch per page.
 * @param pageToken The token for the next page of results.
 * @returns An object containing a list of video stats and the next page token.
 */
export const getChannelVideos = async (
    channelId: string,
    maxResults: number,
    pageToken?: string
): Promise<{ videos: VideoStat[], nextPageToken?: string }> => {
    const searchParams: Record<string, string> = {
        part: 'id',
        channelId: channelId,
        maxResults: String(maxResults),
        order: 'date',
        type: 'video'
    };
    if (pageToken) {
        searchParams.pageToken = pageToken;
    }

    const searchData = await fetchYouTubeAPI('search', searchParams);
    
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
    
    if (!videoIds) {
        return { videos: [], nextPageToken: undefined };
    }

    const videosData = await fetchYouTubeAPI('videos', {
        part: 'snippet,statistics',
        id: videoIds,
    });

    const videos: VideoStat[] = videosData.items.map((item: any) => ({
        id: item.id,
        publishedAt: item.snippet.publishedAt,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnailUrl: item.snippet.thumbnails.high.url,
        viewCount: item.statistics.viewCount,
        likeCount: item.statistics.likeCount,
        commentCount: item.statistics.commentCount,
    }));

    return { videos, nextPageToken: searchData.nextPageToken };
};


/**
 * Fetches the oldest video from a channel's upload playlist. This is a fix for the previous implementation.
 * @param playlistId The ID of the channel's "uploads" playlist.
 * @returns An object containing the oldest video's info, or null.
 */
export const getOldestVideo = async (
    playlistId: string,
): Promise<VideoStat | null> => {
    try {
        // The playlistItems endpoint returns items in the order they were added (oldest first).
        // We fetch a page and sort client-side just to be absolutely sure and robust.
        const playlistData = await fetchYouTubeAPI('playlistItems', {
            part: 'snippet',
            playlistId: playlistId,
            maxResults: '50',
        });

        if (!playlistData.items || playlistData.items.length === 0) {
            return null;
        }
        
        // Sort by publishedAt ascending to find the true oldest video in the batch
        const sortedItems = playlistData.items.sort((a: any, b: any) =>
            new Date(a.snippet.publishedAt).getTime() - new Date(b.snippet.publishedAt).getTime()
        );

        const item = sortedItems[0].snippet;
        const videoId = item.resourceId.videoId;
        
        const video: VideoStat = {
            id: videoId,
            publishedAt: item.publishedAt,
            title: item.title,
            description: item.description,
            thumbnailUrl: item.thumbnails.high?.url || item.thumbnails.default.url,
            viewCount: '0', // Not available from this endpoint
            likeCount: '0', // Not available from this endpoint
            commentCount: '0', // Not available from this endpoint
        };

        return video;
    } catch (error) {
        console.error("Failed to fetch oldest video:", error);
        return null;
    }
};

// --- New functions for date range filtering ---

/**
 * Gets total views and video count for a channel within a specific date range.
 * NOTE: This is a very quota-intensive operation.
 * @param channelId The channel's ID.
 * @param startDate The start of the date range (ISO string).
 * @param endDate The end of the date range (ISO string).
 * @returns An object with view and video counts for the period.
 */
export const getChannelStatsForDateRange = async (channelId: string, startDate: string, endDate: string) => {
    let totalViews = 0;
    let totalVideos = 0;
    let nextPageToken: string | undefined = undefined;
    const batchSize = 50; // Max per search query

    do {
        const searchParams: Record<string, string> = {
            part: 'id',
            channelId: channelId,
            maxResults: String(batchSize),
            order: 'date',
            type: 'video',
            publishedAfter: new Date(startDate).toISOString(),
            publishedBefore: new Date(endDate).toISOString(),
        };
        if (nextPageToken) {
            searchParams.pageToken = nextPageToken;
        }

        const searchData = await fetchYouTubeAPI('search', searchParams);
        const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
        
        if (videoIds) {
            const videosData = await fetchYouTubeAPI('videos', {
                part: 'statistics',
                id: videoIds,
            });
            videosData.items.forEach((item: any) => {
                totalViews += parseInt(item.statistics.viewCount || '0', 10);
                totalVideos++;
            });
        }
        nextPageToken = searchData.nextPageToken;

    } while (nextPageToken);

    return {
        viewCount: String(totalViews),
        videoCount: String(totalVideos),
    };
};

/**
 * Fetches the newest video in a given date range.
 */
export const getNewestVideoInRange = async (channelId: string, startDate?: string, endDate?: string): Promise<VideoStat | null> => {
    if (!startDate || !endDate) return getChannelVideos(channelId, 1).then(data => data.videos[0] || null);
    
    const searchParams: Record<string, string> = {
        part: 'snippet',
        channelId: channelId,
        maxResults: '1',
        order: 'date',
        type: 'video',
        publishedAfter: new Date(startDate).toISOString(),
        publishedBefore: new Date(endDate).toISOString(),
    };
    const searchData = await fetchYouTubeAPI('search', searchParams);
    if (!searchData.items || searchData.items.length === 0) return null;
    
    const item = searchData.items[0];
    return {
        id: item.id.videoId,
        publishedAt: item.snippet.publishedAt,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnailUrl: item.snippet.thumbnails.high.url,
        viewCount: '0', likeCount: '0', commentCount: '0',
    };
};

/**
 * Fetches the oldest video in a given date range.
 */
export const getOldestVideoInRange = async (playlistId: string, startDate?: string, endDate?: string): Promise<VideoStat | null> => {
     if (!startDate || !endDate) return getOldestVideo(playlistId);

    let nextPageToken: string | undefined = undefined;
    const startDateTime = new Date(startDate).getTime();
    const endDateTime = new Date(endDate).getTime();

    do {
        const params: Record<string, string> = {
            part: 'snippet',
            playlistId,
            maxResults: '50',
        };
        if (nextPageToken) params.pageToken = nextPageToken;
        
        const data = await fetchYouTubeAPI('playlistItems', params);

        for (const item of data.items) {
            const publishedAtTime = new Date(item.snippet.publishedAt).getTime();
            if (publishedAtTime >= startDateTime && publishedAtTime <= endDateTime) {
                // This is the first video we've found within the range, and since the API
                // returns oldest first, this is our target.
                const snippet = item.snippet;
                return {
                    id: snippet.resourceId.videoId,
                    publishedAt: snippet.publishedAt,
                    title: snippet.title,
                    description: snippet.description,
                    thumbnailUrl: snippet.thumbnails.high?.url || snippet.thumbnails.default.url,
                    viewCount: '0', likeCount: '0', commentCount: '0',
                };
            }
        }
        nextPageToken = data.nextPageToken;

    } while (nextPageToken);
    
    return null; // No video found in range
};
