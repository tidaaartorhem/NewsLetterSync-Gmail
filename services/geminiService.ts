import { GoogleGenAI, Type } from "@google/genai";
import type { Newsletter, RawEmail } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set. Please add it to your environment.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    newsletters: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: 'The original unique ID of the email.' },
          sender: { type: Type.STRING, description: 'The name of the newsletter sender (e.g., "Tech Weekly").' },
          subject: { type: Type.STRING, description: 'The original subject line of the email.' },
          date: { type: Type.STRING, description: 'The original date of the email, formatted as a readable string (e.g., "May 28, 2024").' },
          content: { type: Type.STRING, description: 'The main body of the newsletter as clean, well-formatted HTML. Remove boilerplate content like unsubscribe links, ads, tracking pixels, and irrelevant footers. Preserve essential formatting, links, and images.' },
          category: { type: Type.STRING, description: 'A relevant category for the newsletter, e.g., "Tech", "Design", "Productivity", "Finance", "News".' },
          logoUrl: { type: Type.STRING, description: 'A URL for the sender\'s logo. Use a service like `https://logo.clearbit.com/{domain.com}` based on the sender\'s email domain.' }
        },
        required: ['id', 'sender', 'subject', 'date', 'content', 'category', 'logoUrl'],
      },
    }
  },
  required: ['newsletters'],
};

export const processNewsletters = async (emails: RawEmail[]): Promise<Newsletter[]> => {
  const prompt = `
    You are an expert at parsing and cleaning HTML emails to create a beautiful news feed.
    Given a JSON array of raw email objects, process each one and return a clean JSON object that conforms to the provided schema.
    For each email:
    1.  Use the email's original 'id', 'subject', and 'date'.
    2.  Extract the sender's name from the 'from' field.
    3.  Thoroughly clean the HTML 'body'. Remove all scripts, styles, tracking pixels, "View in browser" links, unsubscribe footers, and any other non-essential boilerplate. The goal is to isolate the core content of the newsletter.
    4.  Determine a relevant 'category'.
    5.  Generate a 'logoUrl' using a service like Clearbit based on the sender's domain.
    6.  The final output must be a single JSON object with a "newsletters" key containing an array of the processed newsletter objects.

    Here is the raw email data:
    ${JSON.stringify(emails)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const responseText = response.text.trim();
    const parsedData = JSON.parse(responseText);

    if (!parsedData || !Array.isArray(parsedData.newsletters)) {
      throw new Error("API did not return a valid object with a newsletters array.");
    }
    
    const newsletters = parsedData.newsletters as Newsletter[];
    
    // Sort by date, newest first, as a safeguard
    return newsletters.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  } catch (error) {
    console.error("Error processing newsletters with Gemini:", error);
    throw new Error("Failed to process email data with the Gemini API.");
  }
};