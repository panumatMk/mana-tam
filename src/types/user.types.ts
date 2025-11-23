export interface User {
    id: string;
    name: string;
    avatar: string;

    // ✨ Audit Fields
    createdAt?: any;
    updatedAt?: any;
    createdBy?: string;
    createdByName?: string;
    updatedBy?: string;
    updatedByName?: string;
}
