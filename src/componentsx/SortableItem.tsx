import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
    id: string | number;
    children: React.ReactNode;
    className?: string;
}

export const SortableItem: React.FC<SortableItemProps> = ({ id, children, className }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Translate.toString(transform), // ใช้ Translate แทน Transform จะลื่นกว่าในบางเคส
        transition,
        zIndex: isDragging ? 999 : 'auto',
        opacity: isDragging ? 0.5 : 1,
        touchAction: 'none', // สำคัญ! ป้องกันการเลื่อนหน้าจอตอนกำลังลาก
        position: 'relative' as const,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={className}>
            {children}
        </div>
    );
};
