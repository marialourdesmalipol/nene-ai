import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 });
    }

    const apiKey = process.env.CARTESIA_API_KEY;
    const voiceId = process.env.CARTESIA_VOICE_ID;
    const modelId = process.env.CARTESIA_MODEL_ID || 'sonic-3';
    const sampleRate = Number(process.env.CARTESIA_SAMPLE_RATE || 44100);
    const language = process.env.CARTESIA_LANGUAGE || 'en';

    if (!apiKey) {
      return NextResponse.json(
        { error: 'CARTESIA_API_KEY not configured' },
        { status: 500 }
      );
    }
    if (!voiceId) {
      return NextResponse.json(
        { error: 'CARTESIA_VOICE_ID not configured' },
        { status: 500 }
      );
    }

    const response = await fetch('https://api.cartesia.ai/tts/bytes', {
      method: 'POST',
      headers: {
        'Cartesia-Version': '2025-04-16',
        'X-API-Key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model_id: modelId,
        transcript: text,
        voice: {
          mode: 'id',
          id: voiceId,
        },
        language,
        output_format: {
          container: 'wav',
          encoding: 'pcm_f32le',
          sample_rate: sampleRate,
        },
        generation_config: {
          speed: 1,
          volume: 1,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: `Cartesia TTS error: ${response.status} ${errText}` },
        { status: 502 }
      );
    }

    const audioBytes = await response.arrayBuffer();
    return new NextResponse(audioBytes, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to synthesize speech' }, { status: 500 });
  }
}
