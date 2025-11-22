import type { User } from './user.types';

export interface Trip {
    title: string;
    startDate: string;
    endDate: string;
    participants: User[]; // สมาชิกในทริป (ทีมแมว)
}
