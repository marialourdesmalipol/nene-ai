'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  useRTCClient,
  useLocalMicrophoneTrack,
  useRemoteUsers,
  useClientEvent,
  useIsConnected,
  useJoin,
  usePublish,
  UID,
} from 'agora-rtc-react';
import { ElderPulsingCircle } from './ElderPulsingCircle';
import ElderTranscript from './ElderTranscript';
import CameraCapture from './CameraCapture';
import { Button } from '@/components/ui/button';
import type {
  ConversationComponentProps,
  StopConversationRequest,
  ClientStartRequest,
} from '@/types/conversation';
import {
  MessageEngine,
  IMessageListItem,
  EMessageStatus,
  EMessageEngineMode,
} from '@/lib/message';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const C = {
  rose: "#C97B9F",
  roseMid: "#B5698C",
  rosePale: "#F2D4E2",
  roseFaint: "#FBF0F5",
  lilac: "#9B7DBF",
  lilacPale: "#EDE6F8",
  cream: "#FDF8F2",
  sand: "#F4EAD5",
  text: "#261520",
  textMid: "#6B4A5C",
  textLight: "#B39AAA",
  border: "#EDE0E8",
  green: "#6BAF90",
  amber: "#C98A32",
};

const STATES_CFG = {
  idle: { color: "#BBA8B8", label: "Nene is resting…" },
  listening: { color: C.green, label: "Nene is listening…" },
  thinking: { color: C.amber, label: "Nene is thinking…" },
  speaking: { color: C.lilac, label: "Nene is speaking…" },
};

export default function ConversationComponent({
  agoraData,
  onTokenWillExpire,
  onEndConversation,
  onStartConversation,
  initialVisionResponse,
}: ConversationComponentProps) {
  const client = useRTCClient();
  const isConnected = useIsConnected();
  const remoteUsers = useRemoteUsers();
  const isMobile = useIsMobile();
  const [isEnabled, setIsEnabled] = useState(true);
  const { localMicrophoneTrack } = useLocalMicrophoneTrack(isEnabled);
  const [isAgentConnected, setIsAgentConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const agentUID = process.env.NEXT_PUBLIC_AGENT_UID;
  const [joinedUID, setJoinedUID] = useState<UID>(0);
  const [messageList, setMessageList] = useState<IMessageListItem[]>([]);
  const [currentInProgressMessage, setCurrentInProgressMessage] =
    useState<IMessageListItem | null>(null);
  const messageEngineRef = useRef<MessageEngine | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [visionResponse, setVisionResponse] = useState<string | null>(null);

  // Join the channel
  const { isConnected: joinSuccess } = useJoin(
    {
      appid: process.env.NEXT_PUBLIC_AGORA_APP_ID!,
      channel: agoraData.channel,
      token: agoraData.token,
      uid: parseInt(agoraData.uid),
    },
    Boolean(agoraData.channel && agoraData.token)
  );

  // Message Engine Setup
  useEffect(() => {
    if (!client || !isConnected) return;

    if (messageEngineRef.current) {
      try {
        messageEngineRef.current.teardownInterval();
        messageEngineRef.current.cleanup();
      } catch (err) { console.error(err); }
      messageEngineRef.current = null;
    }

    try {
      const messageEngine = new MessageEngine(
        client,
        EMessageEngineMode.TEXT,
        (updatedMessages: IMessageListItem[]) => {
          const sortedMessages = [...updatedMessages].sort((a, b) => a.turn_id - b.turn_id);
          const inProgressMsg = sortedMessages.find(msg => msg.status === EMessageStatus.IN_PROGRESS);
          setMessageList(sortedMessages.filter(msg => msg.status !== EMessageStatus.IN_PROGRESS));
          setCurrentInProgressMessage(inProgressMsg || null);
        }
      );
      messageEngineRef.current = messageEngine;
      messageEngineRef.current.run({ legacyMode: false });
    } catch (error) { console.error(error); }

    return () => {
      if (messageEngineRef.current) {
        messageEngineRef.current.teardownInterval();
        messageEngineRef.current.cleanup();
        messageEngineRef.current = null;
      }
    };
  }, [client, isConnected]);

  // Stream message handler
  useClientEvent(client, 'stream-message', (uid, payload) => {
    const uidStr = uid.toString();
    const isAgentMessage = uidStr === '333' || (agentUID && uidStr === agentUID);
    if (messageEngineRef.current && isAgentMessage) {
      messageEngineRef.current.handleStreamMessage(payload);
    }
  });

  useEffect(() => {
    if (joinSuccess && client) setJoinedUID(client.uid as UID);
  }, [joinSuccess, client]);

  usePublish([localMicrophoneTrack]);

  useEffect(() => {
    if (localMicrophoneTrack) localMicrophoneTrack.setEnabled(true);
  }, [localMicrophoneTrack]);

  useClientEvent(client, 'user-joined', (user) => {
    if (user.uid.toString() === agentUID) setIsAgentConnected(true);
  });

  useClientEvent(client, 'user-left', (user) => {
    if (user.uid.toString() === agentUID) setIsAgentConnected(false);
  });

  useClientEvent(client, 'user-published', async (user, mediaType) => {
    if (mediaType === 'audio') {
      try {
        await client.subscribe(user, mediaType);
        user.audioTrack?.play();
      } catch (err) {
        console.error('Failed to subscribe/play remote audio', err);
      }
    }
  });

  useEffect(() => {
    const isAgentInRemoteUsers = remoteUsers.some(user => user.uid.toString() === agentUID);
    setIsAgentConnected(isAgentInRemoteUsers);
  }, [remoteUsers, agentUID]);

  const handleStopConversation = async () => {
    try {
      await fetch('/api/stop-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_id: agoraData.agentId! }),
      });
      setIsAgentConnected(false);
      if (onEndConversation) onEndConversation();
    } catch (error) {
      if (onEndConversation) onEndConversation();
    }
  };

  const getStatus = (): 'idle' | 'listening' | 'speaking' | 'thinking' => {
    if (!isConnected || !isAgentConnected) return 'idle';
    if (currentInProgressMessage?.status === EMessageStatus.IN_PROGRESS) return 'speaking';
    if (isAnalyzingImage) return 'thinking';
    return 'listening';
  };

  const status = getStatus();
  const cfg = STATES_CFG[status];
  const agentUser = remoteUsers.find(u => u.uid.toString() === agentUID);
  const visualizerTrack = status === 'speaking' ? agentUser?.audioTrack : (localMicrophoneTrack || undefined);

  const handleCameraCapture = async (base64Image: string) => {
    setIsAnalyzingImage(true);
    try {
      const response = await fetch('/api/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image }),
      });
      const data = await response.json();
      if (data.description) {
        setVisionResponse(data.description);
        setMessageList(prev => [...prev, { uid: 0, turn_id: Date.now(), text: `(Nene sees: ${data.description})`, status: EMessageStatus.END }]);

        try {
          const ttsRes = await fetch('/api/cartesia-tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: data.description }),
          });

          if (ttsRes.ok) {
            const blob = await ttsRes.blob();
            const url = URL.createObjectURL(blob);
            const audio = new Audio(url);
            audio.onended = () => URL.revokeObjectURL(url);
            await audio.play();
          }
        } catch (err) {
          console.error('Cartesia TTS playback failed', err);
        }
      }
    } catch (error) { console.error(error); }
    finally { setIsAnalyzingImage(false); }
  };

  const avatarSize = isMobile ? 120 : 140;

  return (
    <div className="flex-1 overflow-y-auto bg-[linear-gradient(170deg,_#FDF8F2_0%,_#F4EAD5_55%,_#FBF0F5_100%)]">
      <div className={cn(
        "mx-auto w-full flex flex-col gap-0",
        isMobile ? "max-w-full p-[24px_20px_32px]" : "max-w-[680px] p-[40px_40px_48px]"
      )}>
        
        {/* Top row: avatar + controls */}
        <div className={cn(
          "flex items-start gap-7 mb-7",
          isMobile ? "flex-col items-center gap-5" : "flex-row items-flex-start gap-7"
        )}>
          {/* Avatar Area */}
          <div className="flex flex-col items-center gap-3">
            <div className={cn(
              "p-[4px_14px] rounded-[20px] flex items-center gap-1.5 border transition-colors duration-300",
              isConnected && isAgentConnected 
                ? `bg-[${cfg.color}18] border-[${cfg.color}44]` 
                : "bg-white/60 border-[#EDE0E8]"
            )}>
              {isConnected && isAgentConnected && (
                <div className="nn-live w-1.25 h-1.25 rounded-full" style={{ backgroundColor: cfg.color }} />
              )}
              <span className={cn(
                "font-ui text-[9px] tracking-[2px] uppercase",
                isConnected && isAgentConnected ? `text-[${cfg.color}]` : "text-[#B39AAA]"
              )} style={{ color: isConnected && isAgentConnected ? cfg.color : '#B39AAA' }}>
                {isConnected && isAgentConnected ? "Live Session" : "Offline"}
              </span>
            </div>
            <ElderPulsingCircle status={status} track={visualizerTrack} size={avatarSize} />
          </div>

          {/* Controls Area */}
          <div className={cn("flex-1", isMobile ? "w-full" : "w-auto")}>
            <div className={cn(
              "font-display text-[20px] italic text-[#6B4A5C] mb-3.5 tracking-[0.3px]",
              isMobile ? "text-center text-[18px]" : "text-left"
            )}>
              {cfg.label}
            </div>

            {/* Legend Grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-[18px]">
              {Object.entries(STATES_CFG).map(([key, value]) => (
                <div key={key} className="flex items-center gap-1.75">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: value.color }} />
                  <span className={cn("font-ui text-[#6B4A5C]", isMobile ? "text-[12px]" : "text-[11px]")}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </span>
                </div>
              ))}
            </div>

            {/* Buttons Row */}
            <div className="flex gap-2.5">
              <Button 
                onClick={isConnected && isAgentConnected ? handleStopConversation : onStartConversation} 
                className={cn(
                  "flex-1 h-[46px] rounded-[12px] border-none text-white font-bold font-ui text-[13px] tracking-[0.8px] transition-all duration-200",
                  isMobile && "h-[52px] text-[15px]",
                  isConnected && isAgentConnected
                    ? "bg-[linear-gradient(135deg,#C07070,#8E4848)] shadow-[0_4px_16px_rgba(160,70,70,.25)]"
                    : "bg-[linear-gradient(135deg,#6BAF90,#4D9070)] shadow-[0_4px_16px_rgba(70,150,110,.28)]"
                )}
              >
                {isConnected && isAgentConnected ? "End Session" : "Talk to Nene"}
              </Button>
              <CameraCapture onCapture={handleCameraCapture} isAnalyzing={isAnalyzingImage} />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-2.5 mb-5">
          <div className="flex-1 h-[1px] bg-[linear-gradient(to_right,transparent,#F2D4E2)]" />
          <div className="font-ui text-[9px] tracking-[2px] uppercase text-[#B39AAA] px-2.5">Conversation</div>
          <div className="flex-1 h-[1px] bg-[linear-gradient(to_left,transparent,#F2D4E2)]" />
        </div>

        {/* Chat box container */}
        <div className={cn(
          "bg-white/72 rounded-[18px] border border-[#F2D4E2] shadow-[0_4px_24px_rgba(180,120,150,0.07)] overflow-hidden flex flex-col",
          isMobile ? "min-h-[260px]" : "min-h-[320px]"
        )}>
          {/* Transcript Header */}
          <div className="p-[12px_20px] bg-white/50 border-b border-[#EDE0E8] flex items-center justify-between">
            <div className="font-ui text-[10px] tracking-[1.5px] uppercase text-[#B39AAA]">Live Transcript</div>
            {isConnected && isAgentConnected && (
              <div className="flex items-center gap-1.25">
                <div className="nn-live w-1.25 h-1.25 rounded-full" style={{ backgroundColor: cfg.color }} />
                <span className="font-ui text-[9px] tracking-[1px] uppercase" style={{ color: cfg.color }}>Recording</span>
              </div>
            )}
          </div>

          {/* Transcript Scroll Area */}
          <ElderTranscript 
            messageList={messageList} 
            currentInProgressMessage={currentInProgressMessage} 
          />
        </div>
      </div>
    </div>
  );
}
