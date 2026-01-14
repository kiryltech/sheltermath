export interface GeminiResponse {
  candidates: {
    content: {
      parts: {
        text: string;
      }[];
    };
  }[];
}

export async function callGemini(apiKey: string, prompt: string): Promise<string> {
  const model = 'gemini-3-flash-preview';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Gemini API Error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
    );
  }

  const data: GeminiResponse = await response.json();

  if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content.parts[0].text) {
    throw new Error('Invalid response format from Gemini API');
  }

  return data.candidates[0].content.parts[0].text;
}
