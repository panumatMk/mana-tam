import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X } from 'lucide-react';

interface Props {
    tag: string;
    onRemove: (tag: string) => void;
    isPassportTag: boolean;
}

export const SortableTag: React.FC<Props> = ({ tag, onRemove, isPassportTag }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: tag });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        zIndex: isDragging ? 999 : 'auto',
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-600 border border-blue-200 cursor-grab active:cursor-grabbing touch-none"
        >
            {tag}
            {!isPassportTag && (
                // ปุ่มลบต้อง onPointerDown เพื่อกัน event drag ตีกัน
                <button
                    onPointerDown={(e) => { e.stopPropagation(); onRemove(tag); }}
                    className="hover:text-red-500 p-0.5"
                >
                    <X className="w-3 h-3"/>
                </button>
            )}
        </div>
    );
};
