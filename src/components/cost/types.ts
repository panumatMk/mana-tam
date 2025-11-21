import { Utensils, Plane, Bed, ShoppingBag, Ticket, MoreHorizontal } from 'lucide-react';

export interface ExpenseItem {
    id: string;
    title: string;
    amount: number;
    category: CategoryType;
    date: string;
}

export type CategoryType = 'food' | 'transport' | 'stay' | 'shopping' | 'activity' | 'other';

// *** ต้องมีบรรทัดนี้ ***
export const CATEGORIES: Record<CategoryType, { label: string; color: string; icon: any }> = {
    food: { label: 'อาหาร', color: '#F97316', icon: Utensils },
    transport: { label: 'เดินทาง', color: '#3B82F6', icon: Plane },
    stay: { label: 'ที่พัก', color: '#8B5CF6', icon: Bed },
    shopping: { label: 'ช้อปปิ้ง', color: '#EC4899', icon: ShoppingBag },
    activity: { label: 'กิจกรรม', color: '#10B981', icon: Ticket },
    other: { label: 'อื่นๆ', color: '#6B7280', icon: MoreHorizontal },
};
