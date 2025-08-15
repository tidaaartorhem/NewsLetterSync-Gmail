import type { RawEmail } from '../types';

interface GmailPart {
  mimeType: string;
  body: {
    data?: string;
  };
  parts?: GmailPart[];
}

// Helper to decode base64url encoding, which is common in Gmail API.
function base64UrlDecode(str: string): string {
  if (!str) return "";
  try {
    // Replace URL-safe characters and add padding if needed
    let output = str.replace(/-/g, '+').replace(/_/g, '/');
    switch (output.length % 4) {
      case 0:
        break;
      case 2:
        output += '==';
        break;
      case 3:
        output += '=';
        break;
      default:
        throw new Error('Illegal base64url string!');
    }
    // Decode base64 and then decode URI components
    return decodeURIComponent(atob(output).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  } catch (e) {
    console.error("Failed to decode base64url string:", e);
    return ""; // Return empty string on failure
  }
}

async function fetchWithAuth(url: string, token: string) {
  const response = await fetch(url, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Gmail API error: ${error.error.message}`);
  }
  return response.json();
}

// A recursive function to find the desired mimeType part in a message payload.
function findPart(parts: GmailPart[], mimeType: string): GmailPart | null {
  for (const part of parts) {
    if (part.mimeType === mimeType && part.body && part.body.data) {
      return part;
    }
    if (part.parts) {
      const found = findPart(part.parts, mimeType);
      if (found) {
        return found;
      }
    }
  }
  return null;
}


export const fetchNewsletterEmails = async (token: string): Promise<RawEmail[]> => {
  const query = encodeURIComponent('in:inbox category:updates newer_than:1d (finance OR news)');
  const listUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${query}&maxResults=15`;
  const listData = await fetchWithAuth(listUrl, token);

  if (!listData.messages || listData.messages.length === 0) {
    return [];
  }

  const messageIds: string[] = listData.messages.map((m: { id: string }) => m.id);

  const emailPromises = messageIds.map(id => {
    const messageUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`;
    return fetchWithAuth(messageUrl, token);
  });

  const fullMessages = await Promise.all(emailPromises);

  return fullMessages.map(msg => {
    const headers = msg.payload.headers as { name: string; value: string }[];
    const fromHeader = headers.find(h => h.name.toLowerCase() === 'from');
    const subjectHeader = headers.find(h => h.name.toLowerCase() === 'subject');
    const dateHeader = headers.find(h => h.name.toLowerCase() === 'date');
    
    let body = '';
    let bodyData = '';
    const payload = msg.payload as GmailPart;
    let isPlainText = false;

    // Prefer HTML body, search recursively
    let htmlPart = payload.parts ? findPart(payload.parts, 'text/html') : null;
    if (!htmlPart && payload.mimeType === 'text/html') {
      htmlPart = payload;
    }

    if (htmlPart && htmlPart.body.data) {
      bodyData = htmlPart.body.data;
    } else {
      // Fallback to plain text, search recursively
      let textPart = payload.parts ? findPart(payload.parts, 'text/plain') : null;
      if (!textPart && payload.mimeType === 'text/plain') {
        textPart = payload;
      }

      if (textPart && textPart.body.data) {
        bodyData = textPart.body.data;
        isPlainText = true;
      }
    }
    
    const decodedBody = base64UrlDecode(bodyData);
    
    // If we fell back to plain text, wrap it to preserve formatting
    // and help the Gemini prompt which expects HTML.
    body = isPlainText 
      ? `<pre style="white-space: pre-wrap; font-family: sans-serif;">${decodedBody}</pre>` 
      : decodedBody;

    return { 
      id: msg.id, 
      from: fromHeader?.value || 'Unknown Sender', 
      subject: subjectHeader?.value || 'No Subject', 
      date: dateHeader?.value || 'Unknown Date',
      body 
    };
  });
};