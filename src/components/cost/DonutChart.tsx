import React from 'react';
// *** เช็คบรรทัดนี้ครับ ต้อง import CATEGORIES มาด้วย ***
import type { ExpenseItem, CategoryType } from './types';
import { CATEGORIES } from './types';

interface Props {
    expenses: ExpenseItem[];
}

const DonutChart: React.FC<Props> = ({ expenses }) => {
    const total = expenses.reduce((sum, item) => sum + item.amount, 0);

    const categoryTotals = expenses.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + item.amount;
        return acc;
    }, {} as Record<CategoryType, number>);

    let gradientString = '';
    let currentDeg = 0;

    // เรียงลำดับตามยอดเงิน (มาก -> น้อย) สีจะได้เรียงสวยๆ
    const sortedCats = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

    sortedCats.forEach(([cat, amount]) => {
        const percent = (amount / total) * 360;
        const color = CATEGORIES[cat as CategoryType]?.color || '#ccc';
        gradientString += `${color} ${currentDeg}deg ${currentDeg + percent}deg, `;
        currentDeg += percent;
    });

    const finalGradient = gradientString
        ? `conic-gradient(${gradientString.slice(0, -2)})`
        : 'conic-gradient(#E5E7EB 0deg 360deg)';

    return (
        <div className="bg-white p-4 rounded-3xl shadow-sm mb-2 flex gap-4 items-center border border-gray-100">

            {/* Chart Circle (ลดขนาดลง) */}
            <div
                className="w-32 h-32 rounded-full flex-shrink-0 relative flex items-center justify-center transition-all duration-500"
                style={{ background: finalGradient }}
            >
                <div className="w-24 h-24 bg-white rounded-full flex flex-col items-center justify-center z-10 shadow-inner">
                    <span className="text-gray-400 text-[9px] font-bold uppercase tracking-wider">ยอดรวม</span>
                    <span className="text-lg font-bold text-gray-800">฿{total.toLocaleString()}</span>
                </div>
            </div>

            {/* Legend (จัด layout ใหม่ให้อยู่ขวามือ) */}
            <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto max-h-32 custom-scrollbar pr-1">
                {sortedCats.map(([cat, amount]) => {
                    const category = CATEGORIES[cat as CategoryType];
                    if (!category) return null;
                    return (
                        <div key={cat} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: category.color }}></div>
                                <span className="text-gray-500 font-bold">{category.label}</span>
                            </div>
                            <span className="text-gray-800 font-bold">{Math.round((amount/total)*100)}%</span>
                        </div>
                    )
                })}
                {sortedCats.length === 0 && <div className="text-xs text-gray-300 italic">ยังไม่มีข้อมูล</div>}
            </div>
        </div>
    );
};

export default DonutChart;
