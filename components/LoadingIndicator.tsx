import React, { useState, useEffect } from 'react';

const loadingMessages = [
  "Connecting to your Gmail account...",
  "Fetching your latest newsletters...",
  "Asking AI to organize your feed...",
  "Cleaning up the content...",
  "Building your beautiful feed...",
  "Almost there...",
];

const LoadingIndicator: React.FC = () => {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full text-center py-20">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-indigo-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
      <p className="mt-6 text-lg font-medium text-slate-700">{loadingMessages[messageIndex]}</p>
    </div>
  );
};

export default LoadingIndicator;