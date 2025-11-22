export interface User {
    id: string;
    name: string;
    avatar: string;
}

export type PaymentMethodType = 'QR' | 'BANK_ACCOUNT' | 'PROMPT_PAY';

export type PayerStatus = 'UNPAID' | 'SLIP_SENT' | 'VERIFIED' | 'REJECTED';

export interface Payer {
    userId: string;
    amount: number;
    status: PayerStatus;
    slipUrl?: string; // ถ้าแนบสลิปแล้ว
}

export interface BillItem {
    id: string;
    title: string;
    totalAmount: number;

    // ข้อมูลการรับเงิน
    paymentType: PaymentMethodType;
    paymentValue: string; // URL รูป QR หรือ เลขบัญชี
    bankName?: string; // ชื่อธนาคาร (ถ้ามี)

    payerId: string; // คนสร้างบิล (เจ้าหนี้)
    debtors: Payer[]; // รายชื่อลูกหนี้
    createdAt: number;
    isCompleted: boolean; // จ่ายครบทุกคนหรือยัง
}
