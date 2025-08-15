
import React, { useState, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import type { Newsletter, User, GsiCredentialResponse } from './types';
import { processNewsletters } from './services/geminiService';
import { fetchNewsletterEmails } from './services/gmailService';
import Header from './components/Header';
import NewsletterCard from './components/NewsletterCard';
import NewsletterDetail from './components/NewsletterDetail';
import LoadingIndicator from './components/LoadingIndicator';
import LoginScreen from './components/LoginScreen';
import { GmailIcon } from './components/icons/GmailIcon';

// IMPORTANT: Replace with your actual Google Client ID from the Google Cloud Console.
const GOOGLE_CLIENT_ID = '537799634030-4vdlr0m3hm131gcdokv3ch359gdvtsqn.apps.googleusercontent.com';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null);

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setNewsletters([]);
  };

  const fetchAndProcessNewsletters = useCallback(async (accessToken: string) => {
    setIsLoading(true);
    setError(null);
    setNewsletters([]);
    try {
      const rawEmails = await fetchNewsletterEmails(accessToken);
      if (rawEmails.length === 0) {
        setNewsletters([]);
      } else {
        const processedNewsletters = await processNewsletters(rawEmails);
        setNewsletters(processedNewsletters);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCredentialResponse = useCallback((response: GsiCredentialResponse) => {
    try {
      const decoded: { name: string; email: string; picture: string; } = jwtDecode(response.credential);
      const currentUser = {
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
      };
      setUser(currentUser);

      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/gmail.readonly',
        callback: (tokenResponse) => {
          if (tokenResponse.error) {
            if (tokenResponse.error === 'access_denied') {
              setError("Permission to access Gmail was denied. Please ensure your account is added as a 'Test User' in your Google Cloud project's OAuth consent screen.");
            } else {
              setError(`Error getting access token: ${tokenResponse.error_description || tokenResponse.error}`);
            }
            handleLogout();
            return;
          }
          const accessToken = tokenResponse.access_token;
          setToken(accessToken);
          fetchAndProcessNewsletters(accessToken);
        },
      });
      client.requestAccessToken();
    } catch (error) {
      console.error("Error decoding credential or requesting token:", error);
      setError("Failed to process login. Please try again.");
      handleLogout();
    }
  }, [fetchAndProcessNewsletters]);

  const handleRefresh = useCallback(() => {
    if (token) {
      fetchAndProcessNewsletters(token);
    } else {
      setError("You are not signed in. Please sign in to refresh your feed.");
      handleLogout();
    }
  }, [token, fetchAndProcessNewsletters]);


  if (!user || !token) {
    return <LoginScreen clientId={GOOGLE_CLIENT_ID} onCredentialResponse={handleCredentialResponse} />;
  }


  const renderContent = () => {
    if (isLoading) {
      return <LoadingIndicator />;
    }

    if (error) {
      return (
        <div className="text-center text-red-500 p-8">
          <p className="text-xl mb-4">Oops! Something went wrong.</p>
          <p>{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-6 bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }
    
    if (newsletters.length === 0) {
      return (
        <div className="text-center pt-20 px-4">
          <GmailIcon className="mx-auto h-24 w-24 text-slate-300" />
          <h2 className="mt-6 text-2xl font-semibold text-slate-800">Your feed is up to date!</h2>
          <p className="mt-2 text-slate-500">No new newsletters found in your 'Updates' category from the last 24 hours.</p>
           <button
            onClick={handleRefresh}
            className="mt-8 inline-flex items-center gap-2 bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-transform transform hover:scale-105 shadow-lg"
          >
            Check Again
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-4 max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {newsletters.map((newsletter) => (
          <NewsletterCard
            key={newsletter.id}
            newsletter={newsletter}
            onClick={() => setSelectedNewsletter(newsletter)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Header 
        user={user}
        onLogout={handleLogout}
        onRefresh={handleRefresh}
        isLoading={isLoading}
      />
      <main>
        {renderContent()}
      </main>
      {selectedNewsletter && (
        <NewsletterDetail
          newsletter={selectedNewsletter}
          onClose={() => setSelectedNewsletter(null)}
        />
      )}
    </div>
  );
};

export default App;
