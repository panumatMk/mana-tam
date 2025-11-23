export interface User {
    id: string;
    name: string;
    avatar: string;
    isGuest?: boolean; // แยกแยะว่าเป็น User จริง หรือ Guest ที่เราสร้างขึ้น

    // ✨ Audit Fields
    createdAt?: any;
    updatedAt?: any;
    createdBy?: string;
    createdByName?: string;
    updatedBy?: string;
    updatedByName?: string;
}
