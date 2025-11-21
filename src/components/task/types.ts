export interface User {
    id: string;
    name: string;
    avatar: string;
}

export type TaskStatus = 'TODO' | 'DONE';

export interface TaskItem {
    id: string;
    title: string;
    price: number; // ราคา (ถ้ามี)
    note?: string; // รายละเอียดงาน
    link?: string; // ลิงก์แนบ
    image?: string; // รูปแนบ
    status: TaskStatus;
    createdBy: User; // คนสร้าง
    cfUsers: string[]; // รายชื่อ ID คนที่กด CF
    createdAt: number;
}
