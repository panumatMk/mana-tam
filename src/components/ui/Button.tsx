import React, { useMemo, type PropsWithChildren } from 'react';
// (ปกติจะลง library: npm install clsx tailwind-merge)
// ใน Canvas เราจะสมมติว่า function cn() มีอยู่แล้ว หรือเราจะนำมาใส่ไว้ในไฟล์เดียวเลย

// --- Utility Functions (ปกติจะอยู่ใน lib/utils.ts) ---

// Mock หรือ Implement clsx/tailwind-merge here for single file mandate
const clsx = (...inputs) => inputs.flat().filter(Boolean).join(' ');

function cn(...inputs) {
    // ในโปรเจกต์จริง: return twMerge(clsx(inputs));
    // ใน Canvas (แบบง่าย):
    return clsx(inputs);
}

// --- Component Types ---

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    // 1. ทำให้ children เป็น Optional โดยใช้ PropsWithChildren
    //    หรือถ้าไม่ต้องการ children เลย ให้ลบออก
    variant?: 'primary' | 'danger' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg' ;
}

// 2. ใช้ PropsWithChildren<T> และ Arrow Function ธรรมดาแทน React.FC<T>
export const Button = React.forwardRef<HTMLButtonElement, PropsWithChildren<ButtonProps>>(
    ({
         className,
         variant = 'primary',
         size = 'md',
         children, // รับ children มาจัดการโดยตรง
         ...props
     }, ref) => {

        // ใช้ useMemo เพื่อป้องกันการคำนวณ string class ซ้ำซ้อน
        const calculatedClasses = useMemo(() => {
            const baseStyles = "font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap";

            const variants = {
                primary: "bg-green-600 text-white shadow-lg shadow-green-200 hover:bg-green-700",
                danger: "bg-red-500 text-white shadow-lg shadow-red-200 hover:bg-red-600",
                outline: "bg-white text-gray-600 border-2 border-gray-100 hover:bg-gray-50",
                ghost: "bg-transparent text-gray-500 hover:bg-gray-100",
            };

            const sizes = {
                sm: "py-2 px-3 text-xs w-full",
                md: "py-3 px-4 text-sm w-full",
                lg: "py-3.5 px-6 text-base w-full",
            };

            return cn(baseStyles, variants[variant], sizes[size], className);
        }, [variant, size, className]);

        return (
            <button
                ref={ref} // เพิ่ม ref support (Pro-level feature)
                className={calculatedClasses}
                {...props}
            >
                {children}
            </button>
        );
    });

// กำหนด Display Name เพื่อช่วยในการ Debug ใน DevTools
Button.displayName = 'Button';
