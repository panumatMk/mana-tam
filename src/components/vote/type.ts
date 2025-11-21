export interface User {
    id: string;
    name: string;
    avatar: string;
}

export type VoteStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface VoteItem {
    id: string;
    title: string;
    description?: string; // เช่น ราคา
    status: VoteStatus;
    votesFor: string[]; // เก็บ UserID ของคนที่เห็นด้วย
    votesAgainst: string[]; // เก็บ UserID ของคนที่ไม่เอา

    // Logic การผ่านโหวต
    thresholdType: 'count' | 'percent'; // นับจำนวนคน หรือ นับเปอร์เซ็นต์
    thresholdValue: number; // เช่น 3 (คน) หรือ 80 (%)
}
