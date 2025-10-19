import React from 'react';
import { ChannelInput } from './ChannelInput';
import { TrackedChannelCard } from './TrackedChannelCard';
import { GroupsView } from './GroupsView';
import type { ChannelStats, ChannelGroup } from '../types';

interface MultiChannelViewProps {
    trackedChannels: ChannelStats[];
    groups: ChannelGroup[];
    onAddChannel: (channelInput: string) => void;
    onSelectChannel: (channelId: string) => void;
    onRemoveChannel: (channelId: string) => void;
    onSelectGroup: (groupId: string) => void;
    onEditGroup: (group: ChannelGroup) => void;
    onDeleteGroup: (groupId: string) => void;
    onCreateGroup: () => void;
    isAdding: boolean;
    apiKeySet: boolean;
}

export const MultiChannelView: React.FC<MultiChannelViewProps> = ({
    trackedChannels,
    groups,
    onAddChannel,
    onSelectChannel,
    onRemoveChannel,
    onSelectGroup,
    onEditGroup,
    onDeleteGroup,
    onCreateGroup,
    isAdding,
    apiKeySet,
}) => {
    return (
        <div className="w-full max-w-7xl mx-auto space-y-12">
            <ChannelInput onFetch={onAddChannel} isDisabled={isAdding || !apiKeySet} isAdding={isAdding} />
            
            <GroupsView
                groups={groups}
                channels={trackedChannels}
                onSelectGroup={onSelectGroup}
                onEditGroup={onEditGroup}
                onDeleteGroup={onDeleteGroup}
                onCreateGroup={onCreateGroup}
            />

            <div>
                <h2 className="text-3xl font-bold text-white mb-6 border-b-2 border-gray-700 pb-2">Tracked Channels</h2>
                {trackedChannels.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {trackedChannels.map(channel => (
                            <TrackedChannelCard 
                                key={channel.id} 
                                channel={channel} 
                                onSelect={onSelectChannel}
                                onRemove={onRemoveChannel}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 px-6 bg-gray-800/50 rounded-lg">
                        <h3 className="text-2xl font-bold text-white">Welcome to your Dashboard!</h3>
                        <p className="text-gray-400 mt-2">
                            You are not tracking any channels yet.
                            <br />
                            Use the input above to add your first channel.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
