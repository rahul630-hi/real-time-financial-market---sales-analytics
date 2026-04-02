import { GoogleGenAI } from "@google/genai";
import { CustomerSegment } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Gemini API features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateClusterDescriptions = async (segments: CustomerSegment[]): Promise<string[]> => {
  if (!API_KEY) {
    // Return mock descriptions if API key is not available
    return segments.map(s => `This is a mock AI description for the ${s.name} segment. They are characterized by their purchasing habits.`);
  }

  try {
    const prompt = `
      You are an expert marketing analyst. I have segmented my customers into several groups based on their Recency, Frequency, and Monetary (RFM) scores.
      For each segment below, provide a short, insightful, and actionable description (2-3 sentences).
      The description should explain the characteristics of the customers in that segment and suggest a marketing action.
      
      Here are the segments and their average RFM scores:
      ${segments.map(s => `
      - Segment Name: "${s.name}"
      - Average Recency (days since last purchase): ${s.avgRFM.recency.toFixed(1)}
      - Average Frequency (number of purchases): ${s.avgRFM.frequency.toFixed(1)}
      - Average Monetary Value (total spent): ₹${s.avgRFM.monetary.toFixed(0)}
      `).join('')}

      Provide your response as a simple array of strings in your response, where each string is the description for one segment, in the same order they were provided. Do not include any other text, just the descriptions. Example: ["Description for segment 1.", "Description for segment 2."].
      Format the response as a valid JSON string array.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      }
    });
    
    const text = response.text.trim();
    const descriptions = JSON.parse(text);

    if (Array.isArray(descriptions) && descriptions.length === segments.length) {
      return descriptions;
    } else {
      throw new Error("AI response was not in the expected format.");
    }

  } catch (error) {
    console.error("Error generating cluster descriptions with Gemini API:", error);
    // Fallback to simpler descriptions on error
    return segments.map(s => `Could not generate AI description for ${s.name}. This segment has an average recency of ${s.avgRFM.recency.toFixed(0)}, frequency of ${s.avgRFM.frequency.toFixed(0)}, and monetary value of ₹${s.avgRFM.monetary.toFixed(0)}.`);
  }
};

export const analyzeDocumentText = async (text: string): Promise<string> => {
    if (!API_KEY) {
        return "API Key not configured. Cannot analyze document.";
    }

    try {
        const prompt = `
            You are a senior financial analyst. Please analyze the following text extracted from a business document.
            Provide a concise summary highlighting the key points, trends, potential risks, and actionable insights related to sales, marketing, or finance.
            Present the output in well-structured markdown format.

            Document Text:
            ---
            ${text.substring(0, 10000)} 
            ---
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error analyzing document with Gemini API:", error);
        throw new Error("Failed to get analysis from AI.");
    }
};