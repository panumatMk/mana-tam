// สถานะการจ่ายเงิน
export enum PayerStatus {
    UNPAID = 'UNPAID',
    SLIP_SENT = 'SLIP_SENT',
    VERIFIED = 'VERIFIED',
    REJECTED = 'REJECTED'
}

// วิธีการชำระเงิน
export enum PaymentMethod {
    QR = 'QR',
    BANK_ACCOUNT = 'BANK_ACCOUNT',
    PROMPT_PAY = 'PROMPT_PAY'
}
