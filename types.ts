export interface Newsletter {
  id: string;
  sender: string;
  subject: string;
  date: string;
  content: string; // HTML content
  category: string;
  logoUrl: string;
}

export interface User {
  name: string;
  email: string;
  picture: string;
}

export interface RawEmail {
  id: string;
  from: string;
  subject: string;
  date: string;
  body: string;
}

export interface GsiCredentialResponse {
  credential: string;
  select_by?: string;
}

interface TokenResponse {
  access_token: string;
  error?: string;
  error_description?: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: { client_id: string; callback: (response: GsiCredentialResponse) => void; }) => void;
          renderButton: (
            parent: HTMLElement, 
            options: {
              theme?: string;
              size?: string;
              type?: string;
            }
          ) => void;
        };
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (tokenResponse: TokenResponse) => void;
          }) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
}