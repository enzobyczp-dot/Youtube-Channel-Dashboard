export interface ChannelStats {
  id: string;
  title: string;
  description: string;
  customUrl: string;
  publishedAt: string;
  thumbnailUrl: string;
  subscriberCount: string;
  videoCount: string;
  viewCount: string;
  uploadsPlaylistId: string;
}

export interface VideoStat {
  id: string;
  publishedAt: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  viewCount: string;
  likeCount: string;
  commentCount: string;
}

export interface YouTubeData {
  channelStats: ChannelStats;
  videos: VideoStat[];
}

export type SortOrder = 'date' | 'viewCount' | 'likeCount';

// FIX: Add missing type definitions for Scene, VideoProjectResult, and VideoHistoryItem.
export interface Scene {
  id: string;
  prompt: string;
  duration: number;
  transition: string;
}

export interface ProcessedScene {
  sceneId: string; // Corresponds to Scene['id']
  prompt: string;
  videoUrl: string;
  thumbnailUrl: string;
}

export interface VideoProjectResult {
  id: string;
  scenes: ProcessedScene[];
}

// A history item is a saved project result, with a main thumbnail for display.
export interface VideoHistoryItem extends VideoProjectResult {
  thumbnailUrl: string;
}


// New types for Channel Groups feature
export interface ChannelGroup {
  id:string;
  name: string;
  channelIds: string[];
}

export interface ChannelComparisonData extends ChannelStats {
    newestVideo?: VideoStat | null;
    oldestVideo?: VideoStat | null;
}
