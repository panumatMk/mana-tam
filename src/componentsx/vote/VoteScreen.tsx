import React, { useState } from 'react';
import VoteSearchBar from './VoteSearchBar';
import VoteTabs from './VoteTabs';
import VoteCard from './VoteCard';
import CreateVoteFAB from './CreateVoteFAB';
import CreateVoteModal from './CreateVoteModal'; // <-- Import Modal
import type { VoteItem, VoteStatus, User } from './types';

// --- Mock Data ---
const MOCK_USERS: User[] = [
    { id: 'u1', name: 'Me', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
    { id: 'u2', name: 'Jane', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane' },
    { id: 'u3', name: 'Max', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Max' },
    { id: 'u4', name: 'Bob', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob' },
    { id: 'u5', name: 'Alice', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice' },
];

const GROUP_SIZE = 5;

const VoteScreen: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'ALL' | VoteStatus>('ALL');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false); // <-- State Modal

    const [votes, setVotes] = useState<VoteItem[]>([
        {
            id: 'v1',
            title: 'Disney Sea (VIP Pass)',
            description: 'ราคา 3,500 บาท/คน แพงหน่อยแต่เร็ว',
            status: 'PENDING',
            votesFor: ['u2', 'u3'],
            votesAgainst: [],
            thresholdType: 'count',
            thresholdValue: 3,
        }
    ]);

    // Logic: Create New Vote
    const handleCreateVote = (data: Omit<VoteItem, 'id' | 'status' | 'votesFor' | 'votesAgainst'>) => {
        const newVote: VoteItem = {
            id: Date.now().toString(), // Generate ID ง่ายๆ
            status: 'PENDING',
            votesFor: [],
            votesAgainst: [],
            ...data
        };
        setVotes(prev => [newVote, ...prev]); // เอาอันใหม่ไว้บนสุด
    };

    // Logic: Vote Action
    const handleVote = (id: string, type: 'agree' | 'disagree') => {
        setVotes(prev => prev.map(v => {
            if (v.id !== id) return v;

            const userId = 'u1';
            let newFor = v.votesFor.filter(u => u !== userId);
            let newAgainst = v.votesAgainst.filter(u => u !== userId);

            if (type === 'agree') newFor.push(userId);
            if (type === 'disagree') newAgainst.push(userId);

            let required = v.thresholdType === 'count'
                ? v.thresholdValue
                : Math.ceil((GROUP_SIZE * v.thresholdValue) / 100);

            const isPassed = newFor.length >= required;

            return {
                ...v,
                votesFor: newFor,
                votesAgainst: newAgainst,
                status: isPassed ? 'APPROVED' : 'PENDING'
            };
        }));
    };

    const filteredVotes = votes.filter(v => {
        const matchesSearch = v.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTab = activeTab === 'ALL' || v.status === activeTab;
        return matchesSearch && matchesTab;
    });

    return (
        <div className="p-4 pt-2 pb-24 min-h-full bg-F3F4F6 relative">

            <VoteSearchBar value={searchTerm} onChange={setSearchTerm} />
            <VoteTabs currentTab={activeTab} onTabChange={setActiveTab} />

            <div className="space-y-1">
                {filteredVotes.map(vote => (
                    <VoteCard
                        key={vote.id}
                        item={vote}
                        totalGroupMembers={GROUP_SIZE}
                        currentUser={MOCK_USERS[0]}
                        allUsers={MOCK_USERS}
                        onVote={handleVote}
                    />
                ))}
                {filteredVotes.length === 0 && (
                    <div className="text-center py-10 text-gray-400 text-xs">ไม่พบรายการโหวต</div>
                )}
            </div>

            {/* FAB */}
            <CreateVoteFAB onClick={() => setIsCreateModalOpen(true)} />

            {/* Modal */}
            <CreateVoteModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSave={handleCreateVote}
                totalGroupMembers={GROUP_SIZE}
            />

        </div>
    );
};

export default VoteScreen;
