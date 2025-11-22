export type DocType = 'passport' | 'general';

export interface DocItem {
    id: string;
    type: DocType;
    title: string;
    detail?: string;
    link?: string;
    tags: string[];
    attachedImage?: string;
    image?: string;
    passportData?: {
        fullName: string;
        passportNo: string;
        expiryDate: string;
        dob: string;
    }
}

export interface ChecklistItem {
    id: string;
    text: string;
    checked: boolean;
}

// --- MOCK DATA UPDATED ---
export const MOCK_DOCS: DocItem[] = [
    {
        id: 'p1', type: 'passport', title: 'Felix',
        tags: ['#Passport'], // เหลือแค่นี้
        attachedImage: 'https://images.unsplash.com/photo-1544306670-2d7392c32674?w=150',
        passportData: { fullName: 'Mr. Felix Happy', passportNo: 'AA1234567', expiryDate: '2030-02-20', dob: '1995-08-12' }
    },
    {
        id: 'p2', type: 'passport', title: 'Jane',
        tags: ['#Passport'],
        attachedImage: 'https://images.unsplash.com/photo-1544306670-2d7392c32674?w=150',
        passportData: { fullName: 'Ms. Jane Doe', passportNo: 'BB9876543', expiryDate: '2028-03-15', dob: '1998-01-05' }
    },
    // General Note ตัวอย่าง
    {
        id: 'g1', type: 'general', title: 'วิธีเดินทางจากสนามบิน 🚍', detail: 'นั่งรถบัส Limousine Bus ช่อง 3 ราคา 1,200 เยน',
        tags: ['#Transport', '#Tips'],
        attachedImage: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=300'
    },
    {
        id: 'g2', type: 'general', title: 'Pass WiFi', detail: 'ID: MyWifi_5G / Pass: 12345678',
        tags: [], // ไม่มีแท็ก
    }
];
