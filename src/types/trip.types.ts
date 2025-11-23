import type { User } from './user.types';

export interface Trip {
    id?: string; // เผื่อไว้ใช้ในอนาคต
    title: string;
    startDate: string;
    endDate: string;
    participants: User[];

    // ✨ Audit Fields (เก็บ Log)
    createdAt?: number | Date; // เก็บเป็น Timestamp หรือ Date
    updatedAt?: number | Date;
    createdBy?: string; // เก็บ User ID หรือ Name
    createdByName?: string;
    updatedBy?: string; // เก็บ User ID หรือ Name
    updatedByName?: string;
}
