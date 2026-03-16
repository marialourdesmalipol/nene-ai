export interface AgoraTokenData {
  token: string;
  uid: string;
  channel: string;
  agentId?: string;
}

export interface ClientStartRequest {
  requester_id: string;
  channel_name: string;
  rtc_codec?: number;
  input_modalities?: string[];
  output_modalities?: string[];
}

interface MicrosoftTTSParams {
  key: string;
  region: string;
  voice_name: string;
  rate?: number;
  volume?: number;
}

interface ElevenLabsTTSParams {
  key: string;
  voice_id: string;
  model_id: string;
}

interface AmazonTTSParams {
  access_key: string;
  secret_key: string;
  region: string;
  voice_name: string;
  engine?: string;
  rate?: number;
  volume?: number;
}

interface MinimaxTTSParams {
  key: string;
  group_id: string;
  model: string;
  voice_setting: {
    voice_id: string;
  };
  url: string;
}

interface CartesiaTTSParams {
  api_key: string;
  model_id: string;
  voice: {
    mode: 'id';
    id: string;
  };
  output_format?: {
    container?: 'raw';
    sample_rate?: number;
  };
  language?: string;
}

export enum TTSVendor {
  Microsoft = 'microsoft',
  ElevenLabs = 'elevenlabs',
  Amazon = 'amazon',
  Minimax = 'minimax',
  Cartesia = 'cartesia',
}

export interface TTSConfig {
  vendor: TTSVendor;
  params:
    | MicrosoftTTSParams
    | ElevenLabsTTSParams
    | AmazonTTSParams
    | MinimaxTTSParams
    | CartesiaTTSParams;
}

// Agora API request body
export interface AgoraStartRequest {
  name: string;
  properties: {
    channel: string;
    token: string;
    agent_rtc_uid: string | number;
    remote_rtc_uids: (string | number)[];
    enable_string_uid?: boolean;
    idle_timeout?: number;
    advanced_features?: {
      enable_aivad?: boolean;
      enable_bhvs?: boolean;
    };
    asr: {
      language: string;
      task?: string;
    };
    llm: {
      url?: string;
      api_key?: string;
      system_messages: Array<{
        role: string;
        content: string;
      }>;
      greeting_message: string;
      failure_message: string;
      max_history?: number;
      input_modalities?: string[];
      output_modalities?: string[];
      params: {
        model: string;
        max_tokens: number;
        temperature?: number;
        top_p?: number;
      };
    };
    vad: {
      silence_duration_ms: number;
      speech_duration_ms?: number;
      threshold?: number;
      interrupt_duration_ms?: number;
      prefix_padding_ms?: number;
    };
    tts: TTSConfig;
  };
}

export interface StopConversationRequest {
  agent_id: string;
}

export interface AgentResponse {
  agent_id: string;
  create_ts: number;
  state: string;
}

export interface ConversationComponentProps {
  agoraData: AgoraTokenData;
  onTokenWillExpire: (uid: string) => Promise<string>;
  onEndConversation: () => void;
  onStartConversation?: () => void;
  initialVisionResponse?: string | null;
}
