
import React from 'react';
import type { Newsletter } from '../types';

interface NewsletterCardProps {
  newsletter: Newsletter;
  onClick: () => void;
}

const NewsletterCard: React.FC<NewsletterCardProps> = ({ newsletter, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden"
    >
      <div className="p-5 flex items-start space-x-4">
        <img 
          src={newsletter.logoUrl} 
          alt={`${newsletter.sender} logo`} 
          className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0" 
        />
        <div className="flex-grow">
          <div className="flex justify-between items-baseline">
            <p className="font-semibold text-slate-800 truncate pr-4">{newsletter.sender}</p>
            <p className="text-xs text-slate-500 whitespace-nowrap">{newsletter.date}</p>
          </div>
          <h3 className="text-md font-medium text-slate-900 mt-1">{newsletter.subject}</h3>
          <div className="text-sm text-slate-600 mt-2 line-clamp-2" dangerouslySetInnerHTML={{ __html: newsletter.content.replace(/<[^>]*>?/gm, ' ').substring(0, 150) + '...' }} />
        </div>
      </div>
    </div>
  );
};

export default NewsletterCard;
