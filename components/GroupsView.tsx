import React from 'react';
import type { ChannelGroup, ChannelStats } from '../types';
import { GroupCard } from './GroupCard';

interface GroupsViewProps {
    groups: ChannelGroup[];
    channels: ChannelStats[];
    onSelectGroup: (groupId: string) => void;
    onEditGroup: (group: ChannelGroup) => void;
    onDeleteGroup: (groupId: string) => void;
    onCreateGroup: () => void;
}

export const GroupsView: React.FC<GroupsViewProps> = ({ groups, channels, onSelectGroup, onEditGroup, onDeleteGroup, onCreateGroup }) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-6 border-b-2 border-gray-700 pb-2">
                <h2 className="text-3xl font-bold text-white">Channel Groups</h2>
                <button
                    onClick={onCreateGroup}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
                >
                    + Create Group
                </button>
            </div>

            {groups.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {groups.map(group => (
                        <GroupCard
                            key={group.id}
                            group={group}
                            channels={channels}
                            onSelect={onSelectGroup}
                            onEdit={onEditGroup}
                            onDelete={onDeleteGroup}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 px-6 bg-gray-800/50 rounded-lg">
                    <h3 className="text-xl font-bold text-white">Organize Your Channels</h3>
                    <p className="text-gray-400 mt-2">
                        Create groups to compare competitors, track your network, or organize channels by topic.
                    </p>
                </div>
            )}
        </div>
    );
};
