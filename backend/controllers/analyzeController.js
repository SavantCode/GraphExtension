import analyzeImageWithGemini from '../services/geminiService.js';

export const analyzeController = async (req, res) => {
  try {
    // Step 1: Check for uploaded file
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    const { buffer, mimetype } = req.file;

    // Step 2: Validate file type (basic check)
    if (!mimetype.startsWith('image/')) {
      return res.status(400).json({ error: 'Uploaded file is not an image' });
    }

    // Step 3: Send image buffer to Gemini for analysis
    const geminiResponse = await analyzeImageWithGemini(buffer);

    // Step 4: Extract insights (assuming Gemini gives back some structure)
    const { summary, chartType, insights } = geminiResponse;

    // Step 5: Respond with structured data
    return res.status(200).json({
      success: true,
      chartType: chartType || 'Unknown',
      summary: summary || 'No summary available.',
      insights: insights || [],
    });

  } catch (error) {
    console.error('Error in analyzeChart:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};

export default {
  analyzeController,
};
