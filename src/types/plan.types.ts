export interface LinkItem {
    type: 'url' | 'map';
    url: string;
    title: string;
}

export interface Activity {
    id: string;
    day: number;
    time: string;
    title: string;
    note?: string;
    image?: string;
    links?: LinkItem[];

    // ✨ Audit Fields
    createdAt?: any;
    updatedAt?: any;
    createdBy?: string;
    createdByName?: string;
    updatedBy?: string;
    updatedByName?: string;
}
