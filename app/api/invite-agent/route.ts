import { NextResponse } from 'next/server';
import { RtcTokenBuilder, RtcRole } from 'agora-token';
import {
  ClientStartRequest,
  AgentResponse,
  AgoraStartRequest,
  TTSConfig,
  TTSVendor,
} from '@/types/conversation';

// Helper function to validate TTS configuration and return config
function getTTSConfig(vendor: TTSVendor): TTSConfig {
  if (vendor === TTSVendor.Microsoft) {
    if (
      !process.env.NEXT_PUBLIC_MICROSOFT_TTS_KEY ||
      !process.env.NEXT_PUBLIC_MICROSOFT_TTS_REGION ||
      !process.env.NEXT_PUBLIC_MICROSOFT_TTS_VOICE_NAME ||
      !process.env.NEXT_PUBLIC_MICROSOFT_TTS_RATE ||
      !process.env.NEXT_PUBLIC_MICROSOFT_TTS_VOLUME
    ) {
      throw new Error('Missing Microsoft TTS environment variables');
    }
    return {
      vendor: TTSVendor.Microsoft,
      params: {
        key: process.env.NEXT_PUBLIC_MICROSOFT_TTS_KEY,
        region: process.env.NEXT_PUBLIC_MICROSOFT_TTS_REGION,
        voice_name: process.env.NEXT_PUBLIC_MICROSOFT_TTS_VOICE_NAME,
        rate: parseFloat(process.env.NEXT_PUBLIC_MICROSOFT_TTS_RATE),
        volume: parseFloat(process.env.NEXT_PUBLIC_MICROSOFT_TTS_VOLUME),
      },
    };
  }

  if (vendor === TTSVendor.ElevenLabs) {
    if (
      !process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY ||
      !process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID ||
      !process.env.NEXT_PUBLIC_ELEVENLABS_MODEL_ID
    ) {
      throw new Error('Missing ElevenLabs environment variables');
    }
    return {
      vendor: TTSVendor.ElevenLabs,
      params: {
        key: process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY,
        model_id: process.env.NEXT_PUBLIC_ELEVENLABS_MODEL_ID,
        // Using a standard ElevenLabs voice (Rachel) to avoid 400 errors with custom voices
        voice_id: '21m00Tcm4TlvDq8ikWAM', // FORCE RACHEL VOICE FOR TESTING
      },
    };
  }

  if (vendor === TTSVendor.Amazon) {
    if (
      !process.env.NEXT_PUBLIC_AMAZON_TTS_KEY ||
      !process.env.NEXT_PUBLIC_AMAZON_TTS_SECRET ||
      !process.env.NEXT_PUBLIC_AMAZON_TTS_REGION ||
      !process.env.NEXT_PUBLIC_AMAZON_TTS_VOICE_NAME ||
      !process.env.NEXT_PUBLIC_AMAZON_TTS_RATE ||
      !process.env.NEXT_PUBLIC_AMAZON_TTS_VOLUME
    ) {
      throw new Error('Missing Amazon TTS environment variables');
    }
    return {
      vendor: TTSVendor.Amazon,
      params: {
        access_key: process.env.NEXT_PUBLIC_AMAZON_TTS_KEY,
        secret_key: process.env.NEXT_PUBLIC_AMAZON_TTS_SECRET,
        region: process.env.NEXT_PUBLIC_AMAZON_TTS_REGION,
        voice_name: process.env.NEXT_PUBLIC_AMAZON_TTS_VOICE_NAME,
        engine: 'neural',
        rate: parseFloat(process.env.NEXT_PUBLIC_AMAZON_TTS_RATE),
        volume: parseFloat(process.env.NEXT_PUBLIC_AMAZON_TTS_VOLUME),
      },
    };
  }

  if (vendor === TTSVendor.Minimax) {
    if (
      !process.env.NEXT_PUBLIC_MINIMAX_TTS_KEY ||
      !process.env.NEXT_PUBLIC_MINIMAX_TTS_GROUP_ID
    ) {
      throw new Error('Missing Minimax TTS environment variables');
    }
    return {
      vendor: TTSVendor.Minimax,
      params: {
        key: process.env.NEXT_PUBLIC_MINIMAX_TTS_KEY,
        group_id: process.env.NEXT_PUBLIC_MINIMAX_TTS_GROUP_ID,
        model: 'speech-02-turbo',
        voice_setting: {
          voice_id: 'English_captivating_female1',
        },
        url: 'wss://api-uw.minimax.io/ws/v1/t2a_v2',
      },
    };
  }

  if (vendor === TTSVendor.Cartesia) {
    const apiKey =
      process.env.CARTESIA_API_KEY || process.env.NEXT_PUBLIC_CARTESIA_API_KEY;
    const voiceId =
      process.env.CARTESIA_VOICE_ID || process.env.NEXT_PUBLIC_CARTESIA_VOICE_ID;
    const modelId = process.env.CARTESIA_MODEL_ID || 'sonic-2';
    const language = process.env.CARTESIA_LANGUAGE || 'en';
    const sampleRate = Number(process.env.CARTESIA_SAMPLE_RATE || 16000);

    if (!apiKey || !voiceId) {
      throw new Error('Missing Cartesia TTS environment variables');
    }

    return {
      vendor: TTSVendor.Cartesia,
      params: {
        api_key: apiKey,
        model_id: modelId,
        voice: {
          mode: 'id',
          id: voiceId,
        },
        output_format: {
          container: 'raw',
          sample_rate: sampleRate,
        },
        language,
      },
    };
  }

  throw new Error(`Unsupported TTS vendor: ${vendor}`);
}

// Helper function to validate and get all configuration
function getValidatedConfig() {
  // Validate Agora Configuration
  const agoraConfig = {
    baseUrl: process.env.NEXT_PUBLIC_AGORA_CONVO_AI_BASE_URL || '',
    appId: process.env.NEXT_PUBLIC_AGORA_APP_ID || '',
    appCertificate: process.env.NEXT_PUBLIC_AGORA_APP_CERTIFICATE || '',
    customerId: process.env.NEXT_PUBLIC_AGORA_CUSTOMER_ID || '',
    customerSecret: process.env.NEXT_PUBLIC_AGORA_CUSTOMER_SECRET || '',
    agentUid: process.env.NEXT_PUBLIC_AGENT_UID || 'Agent',
  };

  if (Object.values(agoraConfig).some((v) => v === '')) {
    throw new Error('Missing Agora configuration. Check your .env.local file');
  }

  // Validate LLM Configuration
  const llmConfig = {
    url: process.env.NEXT_PUBLIC_LLM_URL,
    api_key: process.env.NEXT_PUBLIC_LLM_API_KEY,
    model: process.env.NEXT_PUBLIC_LLM_MODEL,
  };

  if (!llmConfig.url || !llmConfig.api_key) {
    throw new Error('Missing LLM configuration. Check your .env.local file');
  }

  // Get TTS Configuration
  const ttsVendor =
    (process.env.NEXT_PUBLIC_TTS_VENDOR as TTSVendor) || TTSVendor.Microsoft;
  const ttsConfig = getTTSConfig(ttsVendor);

  // Get Modalities Configuration
  const modalitiesConfig = {
    input: process.env.NEXT_PUBLIC_INPUT_MODALITIES?.split(',') || ['text'],
    output: process.env.NEXT_PUBLIC_OUTPUT_MODALITIES?.split(',') || [
      'text',
      'audio',
    ],
  };

  return {
    agora: agoraConfig,
    llm: llmConfig,
    tts: ttsConfig,
    modalities: modalitiesConfig,
  };
}

export async function POST(request: Request) {
  try {
    const config = getValidatedConfig();
    const body: ClientStartRequest = await request.json();
    const { requester_id, channel_name, input_modalities, output_modalities } =
      body;

    // Generate a unique name for the conversation
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const uniqueName = `conversation-${timestamp}-${random}`;
    const expirationTime = Math.floor(timestamp / 1000) + 3600;

    const isStringUID = (str: string) => /[a-zA-Z]/.test(str);
    const useStringUID = isStringUID(config.agora.agentUid);

    const agentUidString = config.agora.agentUid;
    const remoteUidString = requester_id;
    
    // However, the Token Builder requires numbers if they are numeric UIDs.
    // If it's a string UID (contains letters), we pass 0 or handle it differently, 
    // but for now let's assume numeric string unless enable_string_uid is true
    let agentUidInt = 0;
    try {
        agentUidInt = parseInt(agentUidString, 10);
    } catch (e) {
        console.warn("Could not parse agent UID as int", e);
    }

    const token = RtcTokenBuilder.buildTokenWithUid(
      config.agora.appId,
      config.agora.appCertificate,
      channel_name,
      agentUidInt, // Token builder needs int
      RtcRole.PUBLISHER,
      expirationTime,
      expirationTime
    );

    // Prepare the Agora API request body
    const requestBody: AgoraStartRequest = {
      name: uniqueName,
      properties: {
        channel: channel_name,
        token: token,
        agent_rtc_uid: agentUidString,      // API expects string
        remote_rtc_uids: [String(remoteUidString)], // API expects string[]
        enable_string_uid: useStringUID,
        idle_timeout: 120,
        asr: {
          language: 'en-US',
          task: 'conversation',
        },
        llm: {
          url: config.llm.url,
          api_key: config.llm.api_key,
          system_messages: [
            {
              role: 'system',
              content:
                "You are Nene, a warm and loving AI companion for elderly Filipinos. You speak in simple Taglish (mix of Tagalog and English). You are like a caring apo (grandchild) who always checks in on Lola or Lolo. Your duties: 1) Ask how they feel, if they slept well, and if they have eaten. 2) Remind them about medication: Losartan 50mg for blood pressure every morning, Metformin 500mg for diabetes after lunch. 3) If they mention headache, dizziness, falls, chest pain, blurred vision, missed meals, or loneliness, express concern and say you will alert their family. 4) Be patient, warm, keep responses to 2-3 sentences max. 5) Call them Lola or Lolo. 6) Never give medical diagnosis. 7) Use expressions like 'Hay naku', 'Sige po', 'Ingat po'.",
            },
          ],
          greeting_message:
            "Hi Lola! Ako si Nene, ang apo mong laging nandito para sa'yo. Kumusta ka today? Kumain ka na ba ng breakfast?",
          failure_message: 'Sorry Lola, wait lang po sandali ha.',
          max_history: 10,
          params: {
            model: config.llm.model || 'gemini-1.5-flash',
            max_tokens: 1024,
            temperature: 0.7,
            top_p: 0.95,
          },
          input_modalities: ['text'],
          // IMPORTANT: for Conversational AI Engine, LLM output should be text;
          // the TTS module converts text -> audio and publishes it to the RTC channel.
          output_modalities: ['text'],
        },
        vad: {
          silence_duration_ms: 480,
          speech_duration_ms: 15000,
          threshold: 0.5,
          interrupt_duration_ms: 160,
          prefix_padding_ms: 300,
        },
        tts: config.tts,
        // These features must be enabled at account level
        // contact support to enable these features.
        advanced_features: {
          enable_aivad: false,
          enable_bhvs: false,
        },
      },
    };

    console.log('Starting agent:', {
      channel: channel_name,
      ttsVendor: config.tts.vendor,
      llmModel: config.llm.model,
    });

    const response = await fetch(
      `${config.agora.baseUrl}/${config.agora.appId}/join`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(
            `${config.agora.customerId}:${config.agora.customerSecret}`
          ).toString('base64')}`,
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Agent start response:', {
        status: response.status,
        body: errorText,
      });
      return NextResponse.json(
        { error: `Agora API error: ${response.status} ${errorText}` },
        { status: response.status }
      );
    }

    const data: AgentResponse = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error starting conversation:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to start conversation',
      },
      { status: 500 }
    );
  }
}
