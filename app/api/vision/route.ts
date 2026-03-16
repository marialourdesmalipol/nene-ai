import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const openRouterKey = process.env.NEXT_PUBLIC_LLM_API_KEY;
    const openRouterUrl = process.env.NEXT_PUBLIC_LLM_URL;

    const prompt = "Lola asks: 'Ano ito?'. Describe what you see in this image in simple Taglish (Tagalog and English mix). Speak as if you are Nene, a caring granddaughter speaking to her Lola. Focus on identifying medicine bottles or safety hazards if any. Keep it short and friendly.";

    const mimeMatch = image.match(/^data:(image\/(png|jpeg|jpg));base64,/);
    const mimeType = mimeMatch?.[1] || 'image/jpeg';
    const base64Image = image.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');

    const requestBody = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Image,
              },
            },
          ],
        },
      ],
    };

    const modelsToTry = [
      'gemini-2.0-flash',
      'gemini-1.5-flash-latest',
      'gemini-1.5-flash',
      'gemini-1.0-pro-vision-latest',
      'gemini-pro-vision',
    ];

    let text: string | undefined;
    let lastError: string | null = null;

    if (apiKey) {
      for (const model of modelsToTry) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          lastError = await response.text();
          continue;
        }

        const data = await response.json();
        text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) break;
      }
    }

    if (!text && openRouterKey && openRouterUrl) {
      const visionModel = process.env.VISION_MODEL || 'google/gemini-2.0-flash-001';
      const response = await fetch(openRouterUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openRouterKey}`,
        },
        body: JSON.stringify({
          model: visionModel,
          max_tokens: 220,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: image } },
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        lastError = await response.text();
      } else {
        const data = await response.json();
        text = data.choices?.[0]?.message?.content;
      }
    }

    if (!text) {
      if (lastError) console.error('Vision API error:', lastError);
      throw new Error('No description generated');
    }

    return NextResponse.json({ description: text });

  } catch (error) {
    console.error('Vision API Error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze image' },
      { status: 500 }
    );
  }
}
