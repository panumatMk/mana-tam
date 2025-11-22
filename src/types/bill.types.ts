// นำเข้า Enum จากไฟล์ที่แยกไว้
import { PayerStatus, PaymentMethod } from '../enums/bill.enums';

export interface Payer {
    userId: string;
    amount: number;
    status: PayerStatus; // ใช้ Enum
}

export interface Bill {
    id: string;
    title: string;
    totalAmount: number;
    paymentType: PaymentMethod; // ใช้ Enum
    payerId: string;
    debtors: Payer[];
    createdAt: number;
    isCompleted: boolean;
}
