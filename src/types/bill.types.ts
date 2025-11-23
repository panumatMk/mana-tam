import { PayerStatus, PaymentMethod } from '../enums/bill.enums';

export type PaymentMethodType = 'QR' | 'BANK_ACCOUNT' | 'PROMPT_PAY';

export interface Payer {
    userId: string;
    amount: number;
    status: PayerStatus;
    slipUrl?: string;
}

export interface BillItem {
    id: string;
    title: string;
    totalAmount: number;
    paymentType: PaymentMethodType;
    paymentValue: string;
    payerId: string; // เจ้าหนี้
    debtors: Payer[]; // ลูกหนี้
    isCompleted: boolean;

    // ✨ Audit Fields
    createdAt?: any;
    updatedAt?: any;
    createdBy?: string;
    createdByName?: string;
    updatedBy?: string;
    updatedByName?: string;
}
