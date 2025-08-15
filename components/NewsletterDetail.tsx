
import React, { useEffect } from 'react';
import type { Newsletter } from '../types';
import { CloseIcon } from './icons/CloseIcon';

interface NewsletterDetailProps {
  newsletter: Newsletter;
  onClose: () => void;
}

const NewsletterDetail: React.FC<NewsletterDetailProps> = ({ newsletter, onClose }) => {

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-start p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-2xl w-full max-w-3xl my-8 relative animate-slide-up max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-200 flex-shrink-0">
          <div className="flex items-start space-x-4">
            <img src={newsletter.logoUrl} alt={`${newsletter.sender} logo`} className="w-10 h-10 rounded-full bg-slate-200"/>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{newsletter.subject}</h2>
              <p className="text-sm text-slate-600 mt-1">From <span className="font-medium">{newsletter.sender}</span> on {newsletter.date}</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Close newsletter"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        
        <div className="px-8 py-6 overflow-y-auto">
          <article 
            className="text-slate-800 leading-relaxed 
                       [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-6 [&_h2]:mb-3
                       [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-5 [&_h3]:mb-2
                       [&_p]:mb-4
                       [&_a]:text-indigo-600 [&_a]:underline hover:[&_a]:text-indigo-800
                       [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4
                       [&_li]:mb-2
                       [&_strong]:font-semibold"
            dangerouslySetInnerHTML={{ __html: newsletter.content }} 
          />
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from { transform: translateY(20px); opacity: 0.8; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        .animate-slide-up { animation: slide-up 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default NewsletterDetail;
