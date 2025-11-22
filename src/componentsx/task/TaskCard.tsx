import React from 'react';
import { CheckCircle2, ExternalLink, ThumbsUp } from 'lucide-react';
import type { TaskItem, User } from './types';

interface Props {
    task: TaskItem;
    currentUser: User;
    allUsers: User[];
    onToggleCF: (taskId: string) => void;
    onComplete: (taskId: string, taskPrice: number, taskTitle: string) => void;
}

const TaskCard: React.FC<Props> = ({ task, currentUser, allUsers, onToggleCF, onComplete }) => {
    const isDone = task.status === 'DONE';
    const isConfirmed = task.cfUsers.includes(currentUser.id);

    // หา User Object ของคนที่ CF แล้ว
    const cfUserObjects = task.cfUsers.map(id => allUsers.find(u => u.id === id)).filter(Boolean) as User[];

    return (
        <div className={`bg-white rounded-2xl shadow-sm border-l-4 p-4 mb-3 relative overflow-hidden transition-all ${isDone ? 'border-gray-300 opacity-70' : 'border-blue-500'}`}>

            {/* Header: Badge & Price */}
            <div className="flex justify-between items-start mb-2">
        <span className={`text-[10px] font-bold px-2 py-1 rounded ${isDone ? 'bg-gray-100 text-gray-500' : 'bg-blue-50 text-blue-600'}`}>
          {isDone ? 'Done' : 'To Do'}
        </span>
                {task.price > 0 && (
                    <span className={`text-sm font-bold ${isDone ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
            ฿ {task.price.toLocaleString()}
          </span>
                )}
            </div>

            {/* Title & Creator */}
            <h4 className={`font-bold text-gray-800 text-sm mb-1 ${isDone ? 'line-through' : ''}`}>{task.title}</h4>
            <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-2">
                <span>สร้างโดย: {task.createdBy.name}</span>
            </div>

            {/* Attachments (Note, Link, Image) */}
            <div className="space-y-2 mb-3">
                {task.note && <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">{task.note}</p>}

                {(task.link || task.image) && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {task.link && (
                            <a href={task.link} target="_blank" className="flex items-center gap-1 text-[10px] bg-blue-50 text-blue-500 px-2 py-1 rounded-lg border border-blue-100 whitespace-nowrap">
                                <ExternalLink className="w-3 h-3"/> Link
                            </a>
                        )}
                        {task.image && (
                            <img src={task.image} className="h-10 w-10 rounded-lg object-cover border border-gray-200" />
                        )}
                    </div>
                )}
            </div>

            {/* --- ACTIONS ZONE --- */}
            {!isDone && (
                <div className="pt-3 border-t border-gray-100 flex flex-col gap-3">

                    {/* 1. CF Area */}
                    <div className="flex justify-between items-center">
                        <div className="flex -space-x-2 items-center">
                            {cfUserObjects.length > 0 ? cfUserObjects.map((u, i) => (
                                <img key={i} src={u.avatar} className="w-6 h-6 rounded-full border-2 border-white" title={u.name} />
                            )) : <span className="text-[10px] text-gray-300 italic">ยังไม่มีใคร CF</span>}

                            {cfUserObjects.length > 0 && <span className="text-[10px] text-gray-400 ml-3">{cfUserObjects.length} คน Confirm</span>}
                        </div>

                        <button
                            onClick={() => onToggleCF(task.id)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all ${isConfirmed ? 'bg-green-50 text-green-600 border-green-200' : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-50'}`}
                        >
                            <ThumbsUp className="w-3 h-3" /> {isConfirmed ? 'Confirmed' : 'CF'}
                        </button>
                    </div>

                    {/* 2. Complete Button (กดแล้ว trigger auto money prompt) */}
                    <button
                        onClick={() => onComplete(task.id, task.price, task.title)}
                        className="w-full bg-gray-800 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                        <CheckCircle2 className="w-4 h-4" /> กดเมื่อทำเสร็จ
                    </button>
                </div>
            )}

            {isDone && (
                <div className="pt-2 border-t border-gray-100 text-center">
                    <span className="text-[10px] text-green-500 font-bold flex items-center justify-center gap-1"><CheckCircle2 className="w-3 h-3"/> เรียบร้อยแล้ว</span>
                </div>
            )}

        </div>
    );
};

export default TaskCard;
