import { GoogleGenAI } from "@google/genai";

const genai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || "",
});

export async function enhanceNewsArticle(article: { title: string; summary_text: string }) {
  const prompt = `Enhance the following news article:
Title: ${article.title}
Summary: ${article.summary_text}

Provide a catchy title and a more descriptive summary.`;

  try {
    const response = await genai.models.generateContent({
      model: 'google/gemini-2.5-flash',
      contents: prompt,
    });

    const content = response.text || '';
    const [enhancedTitle = article.title, enhancedSummary = article.summary_text] = content.split('\n');

    return { enhancedTitle, enhancedSummary };
  } catch (error) {
    console.error('Error enhancing news article:', error);
    return { enhancedTitle: article.title, enhancedSummary: article.summary_text };
  }
}