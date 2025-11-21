import React from 'react';
// *** เช็คบรรทัดนี้ครับ ต้อง import CATEGORIES มาด้วย ***
import type { ExpenseItem, CategoryType } from './types';
import { CATEGORIES } from './types';

interface Props {
    expenses: ExpenseItem[];
}

const DonutChart: React.FC<Props> = ({ expenses }) => {
    const total = expenses.reduce((sum, item) => sum + item.amount, 0);

    // คำนวณยอดรวมแยกตามหมวดหมู่
    const categoryTotals = expenses.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + item.amount;
        return acc;
    }, {} as Record<CategoryType, number>);

    // สร้าง String สำหรับ CSS Conic Gradient
    let gradientString = '';
    let currentDeg = 0;

    Object.entries(categoryTotals).forEach(([cat, amount]) => {
        const percent = (amount / total) * 360;
        // จุดที่ Error: ตรงนี้ต้องเรียก CATEGORIES ได้
        const color = CATEGORIES[cat as CategoryType]?.color || '#ccc';
        gradientString += `${color} ${currentDeg}deg ${currentDeg + percent}deg, `;
        currentDeg += percent;
    });

    const finalGradient = gradientString
        ? `conic-gradient(${gradientString.slice(0, -2)})`
        : 'conic-gradient(#E5E7EB 0deg 360deg)';

    return (
        <div className="bg-white p-6 rounded-3xl shadow-sm mb-4 flex flex-col items-center relative overflow-hidden">

            {/* Chart Circle */}
            <div
                className="w-48 h-48 rounded-full relative flex items-center justify-center transition-all duration-500"
                style={{ background: finalGradient }}
            >
                <div className="w-36 h-36 bg-white rounded-full flex flex-col items-center justify-center z-10 shadow-inner">
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">ยอดรวมทั้งหมด</span>
                    <span className="text-3xl font-bold text-gray-800 mt-1">฿{total.toLocaleString()}</span>
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-3 mt-6 w-full">
                {Object.entries(categoryTotals).map(([cat, amount]) => {
                    const category = CATEGORIES[cat as CategoryType];
                    if (!category) return null;
                    return (
                        <div key={cat} className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }}></div>
                            <span className="text-[10px] text-gray-500 font-bold">{category.label}</span>
                            <span className="text-[10px] text-gray-800 font-bold">{(amount/total*100).toFixed(0)}%</span>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export default DonutChart;
