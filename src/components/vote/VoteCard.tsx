import React from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import type { VoteItem, User } from './types';

interface Props {
    item: VoteItem;
    totalGroupMembers: number; // จำนวนคนในกลุ่ม (เช่น 5)
    currentUser: User;
    allUsers: User[]; // เอาไว้หา Avatar จาก ID
    onVote: (id: string, type: 'agree' | 'disagree') => void;
}

const VoteCard: React.FC<Props> = ({ item, totalGroupMembers, currentUser, allUsers, onVote }) => {

    // 1. คำนวณคะแนนที่ต้องการ (Target)
    let votesRequired = 0;
    if (item.thresholdType === 'count') {
        votesRequired = item.thresholdValue;
    } else {
        // แบบ %: (จำนวนคนทั้งหมด * % / 100) ปัดเศษขึ้น
        votesRequired = Math.ceil((totalGroupMembers * item.thresholdValue) / 100);
    }

    // 2. คำนวณความคืบหน้า
    const currentVotes = item.votesFor.length;
    const progressPercent = Math.min((currentVotes / votesRequired) * 100, 100);
    const remaining = votesRequired - currentVotes;
    const isPassed = item.status === 'APPROVED' || currentVotes >= votesRequired;

    // Helper: หา User Object จาก ID
    const getVoters = (ids: string[]) => ids.map(id => allUsers.find(u => u.id === id)).filter(Boolean) as User[];
    const agreeVoters = getVoters(item.votesFor);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-3">

            {/* Header Section */}
            <div className="p-4 pb-2">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-lg text-gray-800 leading-tight flex-1 pr-2">{item.title}</h3>

                    {/* Badge สถานะ / ความต้องการ */}
                    {!isPassed ? (
                        <span className="bg-orange-100 text-orange-600 text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap">
              ต้องการ {item.thresholdType === 'percent' ? `>${item.thresholdValue}%` : `${item.thresholdValue} เสียง`}
            </span>
                    ) : (
                        <span className="bg-green-100 text-green-600 text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap">
              ผ่านแล้ว 🎉
            </span>
                    )}
                </div>

                {item.description && <p className="text-sm text-gray-500">{item.description}</p>}
            </div>

            {/* Progress Section */}
            <div className="px-4 mb-4">
                {/* Bar */}
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-2 relative">
                    <div
                        className={`h-full transition-all duration-500 ${isPassed ? 'bg-green-500' : 'bg-green-500'}`}
                        style={{ width: `${progressPercent}%` }}
                    ></div>
                </div>

                {/* Voter Avatars & Status Text */}
                <div className="flex justify-between items-center h-6">

                    {/* Avatar Stack */}
                    <div className="flex -space-x-2 overflow-hidden pl-1">
                        {agreeVoters.length > 0 ? agreeVoters.map((voter, i) => (
                            <img
                                key={i}
                                src={voter.avatar}
                                alt={voter.name}
                                className="inline-block h-6 w-6 rounded-full ring-2 ring-white object-cover"
                            />
                        )) : (
                            <span className="text-[10px] text-gray-300 italic">ยังไม่มีคนโหวต</span>
                        )}
                    </div>

                    {/* Text info */}
                    <div className="text-[10px] text-gray-400 font-medium">
                        {isPassed
                            ? 'ครบตามกำหนดแล้ว'
                            : `ขาดอีก ${remaining} เสียงเพื่อผ่าน`
                        }
                    </div>
                </div>
            </div>

            {/* Action Buttons (Bottom) */}
            {!isPassed && (
                <div className="grid grid-cols-2 border-t border-gray-100 divide-x divide-gray-100">
                    <button
                        onClick={() => onVote(item.id, 'agree')}
                        className={`py-3 flex items-center justify-center gap-2 text-sm font-bold transition-colors ${item.votesFor.includes(currentUser.id) ? 'bg-green-50 text-green-600' : 'text-green-600 hover:bg-green-50'}`}
                    >
                        <ThumbsUp className="w-4 h-4" /> เห็นด้วย
                    </button>
                    <button
                        onClick={() => onVote(item.id, 'disagree')}
                        className={`py-3 flex items-center justify-center gap-2 text-sm font-bold transition-colors ${item.votesAgainst.includes(currentUser.id) ? 'bg-red-50 text-red-500' : 'text-red-500 hover:bg-red-50'}`}
                    >
                        <ThumbsDown className="w-4 h-4" /> ไม่เอา
                    </button>
                </div>
            )}
        </div>
    );
};

export default VoteCard;
