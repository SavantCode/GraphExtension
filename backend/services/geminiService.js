import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const analyzeImageWithGemini = async (imageBuffer) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Convert image buffer to base64
    const imageBase64 = imageBuffer.toString('base64');

    // Prepare the image for Gemini
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: 'image/png', // or 'image/jpeg' based on upload
      },
    };

    // Prompt Gemini with instructions
    const prompt = `You are a data analyst. Analyze the graph in the image briefly. Provide a short and precise summary describing the graph type and key conclusions in 2-3 sentences only.`;

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            imagePart,
          ],
        },
      ],
    });

    const response = await result.response;
    const text = await response.text();  // <-- Await here

    return {
      summary: text,
      chartType: "Unknown", // Could try to extract this from text if needed
      insights: [text],     // For now, return the whole text as one insight
    };
  } catch (error) {
    console.error('Gemini API Error:', error);

    if (error.response) {
      console.error('Response status:', error.response.status);
      try {
        const errorBody = await error.response.text();
        console.error('Response body:', errorBody);
      } catch (e) {
        console.error('Failed to parse error response body');
      }
    }

    throw error;
  }
};

export default analyzeImageWithGemini;
