import React from 'react';
import { ExternalLink, Hash } from 'lucide-react';
import type { DocItem } from './types';

interface Props { doc: DocItem; }

const GeneralDocCard: React.FC<Props> = ({ doc }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-3">
            {doc.image && (
                <div className="h-32 w-full bg-gray-100 relative">
                    <img src={doc.image} className="w-full h-full object-cover" />
                    {doc.link && (
                        <a href={doc.link} target="_blank" className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full backdrop-blur-sm hover:bg-black/70 transition-colors">
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    )}
                </div>
            )}

            <div className="p-4">
                <h4 className="font-bold text-gray-800 text-sm mb-1">{doc.title}</h4>
                {doc.detail && <p className="text-xs text-gray-500 line-clamp-2 mb-3">{doc.detail}</p>}

                <div className="flex flex-wrap gap-1">
                    {doc.tags.map(tag => (
                        <span key={tag} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded flex items-center gap-0.5">
                    <Hash className="w-2 h-2 opacity-50"/> {tag.replace('#', '')}
                </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GeneralDocCard;
