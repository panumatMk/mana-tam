import React, { useState } from 'react';
import TaskTabs from './TaskTabs';
import TaskCard from './TaskCard';
import CreateTaskFAB from './CreateTaskFAB';
import CreateTaskModal from './CreateTaskModal';
import type { TaskItem, TaskStatus, User } from './types';

// --- Mock Data ---
const MOCK_USERS: User[] = [
    { id: 'u1', name: 'Me', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix' },
    { id: 'u2', name: 'Jane', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane' },
    { id: 'u3', name: 'Max', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Max' },
];

const TaskScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'ALL' | TaskStatus>('ALL');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const [tasks, setTasks] = useState<TaskItem[]>([
        {
            id: 't1',
            title: 'จองที่พัก Osaka',
            price: 12000,
            note: 'จองผ่าน Agoda ตัดบัตร Felix',
            status: 'TODO',
            createdBy: MOCK_USERS[2], // Max สร้าง
            cfUsers: ['u2'], // Jane CF แล้ว
            createdAt: Date.now()
        },
        {
            id: 't2',
            title: 'ซื้อประกันเดินทาง',
            price: 2000,
            status: 'DONE',
            createdBy: MOCK_USERS[0],
            cfUsers: ['u1', 'u2', 'u3'],
            createdAt: Date.now() - 10000
        }
    ]);

    // Create Task
    const handleCreateTask = (data: Omit<TaskItem, 'id' | 'status' | 'cfUsers' | 'createdAt'>) => {
        const newTask: TaskItem = {
            id: Date.now().toString(),
            status: 'TODO',
            cfUsers: [],
            createdAt: Date.now(),
            ...data
        };
        setTasks(prev => [newTask, ...prev]);
    };

    // Toggle CF
    const handleToggleCF = (taskId: string) => {
        const myId = 'u1';
        setTasks(prev => prev.map(t => {
            if (t.id !== taskId) return t;
            const isConfirmed = t.cfUsers.includes(myId);
            const newCfUsers = isConfirmed
                ? t.cfUsers.filter(id => id !== myId)
                : [...t.cfUsers, myId];
            return { ...t, cfUsers: newCfUsers };
        }));
    };

    // Complete Task + Auto Money Prompt
    const handleCompleteTask = (taskId: string, price: number, title: string) => {
        // 1. Update Status
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'DONE' } : t));

        // 2. Trigger Automation Prompt (Native Confirm for now)
        if (price > 0) {
            setTimeout(() => {
                const shouldAddMoney = window.confirm(
                    `🎉 งาน "${title}" เสร็จแล้ว!\n\nต้องการสร้างรายการ "ค่าใช้จ่าย" (฿${price.toLocaleString()}) ในหน้า Money อัตโนมัติเลยไหม?`
                );

                if (shouldAddMoney) {
                    alert("ระบบ: สร้างรายการในหน้า Money เรียบร้อย! (Mockup)");
                    // TODO: Call function to add expense logic here later
                }
            }, 300);
        }
    };

    // Filter
    const filteredTasks = tasks.filter(t => activeTab === 'ALL' || t.status === activeTab);

    return (
        <div className="p-4 pt-2 pb-24 min-h-full bg-F3F4F6 relative">
            <TaskTabs currentTab={activeTab} onTabChange={setActiveTab} />

            <div className="space-y-1">
                {filteredTasks.map(task => (
                    <TaskCard
                        key={task.id}
                        task={task}
                        currentUser={MOCK_USERS[0]}
                        allUsers={MOCK_USERS}
                        onToggleCF={handleToggleCF}
                        onComplete={handleCompleteTask}
                    />
                ))}
                {filteredTasks.length === 0 && <div className="text-center py-10 text-gray-400 text-xs">ไม่มีงานในหน้านี้</div>}
            </div>

            <CreateTaskFAB onClick={() => setIsCreateModalOpen(true)} />

            <CreateTaskModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSave={handleCreateTask}
                currentUser={MOCK_USERS[0]}
            />
        </div>
    );
};

export default TaskScreen;
