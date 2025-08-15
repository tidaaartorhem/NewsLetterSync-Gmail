import React, { useEffect } from 'react';
import type { GsiCredentialResponse } from '../types';

interface LoginScreenProps {
  clientId: string;
  onCredentialResponse: (response: GsiCredentialResponse) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ clientId, onCredentialResponse }) => {

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(intervalId);
        
        const gsiButton = document.getElementById('gsi-button');
        // Ensure we don't initialize multiple times if the component re-renders
        if (gsiButton && gsiButton.childElementCount === 0) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: onCredentialResponse,
          });
          
          window.google.accounts.id.renderButton(
            gsiButton, 
            {
              theme: 'outline',
              size: 'large',
              type: 'standard',
            }
          );
        }
      }
    }, 100);

    return () => clearInterval(intervalId);
  }, [clientId, onCredentialResponse]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="text-center">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-indigo-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/>
          </svg>
          <h1 className="text-4xl font-bold text-slate-800">InboxFeed</h1>
        </div>
        <p className="mt-2 text-lg text-slate-600">Your newsletters, beautifully organized.</p>
        <div className="mt-12 h-10 flex justify-center items-center">
          <div id="gsi-button"></div>
        </div>
         <p className="mt-10 text-sm text-slate-400">
          Sign in to connect your Gmail and build your feed.
        </p>
      </div>
    </div>
  );
};

export default LoginScreen;
