'use client';

import { useState, useMemo, Suspense } from 'react';
import dynamic from 'next/dynamic';
import type {
  AgoraTokenData,
  ClientStartRequest,
  AgentResponse,
} from '../types/conversation';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

// Dynamically import the ConversationComponent with ssr disabled
const ConversationComponent = dynamic(() => import('./ConversationComponent'), {
  ssr: false,
});

// Dynamically import AgoraRTC and AgoraRTCProvider
const AgoraProvider = dynamic(
  async () => {
    const { AgoraRTCProvider, default: AgoraRTC } = await import(
      'agora-rtc-react'
    );

    return {
      default: ({ children }: { children: React.ReactNode }) => {
        const client = useMemo(
          () => AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' }),
          []
        );
        return <AgoraRTCProvider client={client}>{children}</AgoraRTCProvider>;
      },
    };
  },
  { ssr: false }
);

export default function LandingPage() {
  const [showConversation, setShowConversation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agoraData, setAgoraData] = useState<AgoraTokenData | null>(null);
  const [visionResponse, setVisionResponse] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const handleStartConversation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const agoraResponse = await fetch('/api/generate-agora-token');
      const responseData = await agoraResponse.json();

      if (!agoraResponse.ok) {
        throw new Error(`Failed to generate Agora token`);
      }

      const startRequest: ClientStartRequest = {
        requester_id: responseData.uid,
        channel_name: responseData.channel,
        input_modalities: ['text'],
        output_modalities: ['text', 'audio'],
      };

      const response = await fetch('/api/invite-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(startRequest),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      } else {
        const agentData: AgentResponse = await response.json();
        setAgoraData({
          ...responseData,
          agentId: agentData.agent_id,
        });
      }

      setShowConversation(true);
    } catch (err) {
      setError('Failed to start conversation. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTokenWillExpire = async (uid: string) => {
    try {
      const response = await fetch(
        `/api/generate-agora-token?channel=${agoraData?.channel}&uid=${uid}`
      );
      const data = await response.json();
      if (!response.ok) throw new Error('Failed to generate new token');
      return data.token;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  if (showConversation && agoraData) {
    return (
      <Suspense fallback={<div className="flex h-screen items-center justify-center text-2xl font-display text-[#9B7DBF]">Calling Nene...</div>}>
        <AgoraProvider>
          <ConversationComponent
            agoraData={agoraData}
            onTokenWillExpire={handleTokenWillExpire}
            onEndConversation={() => setShowConversation(false)}
            initialVisionResponse={visionResponse}
          />
        </AgoraProvider>
      </Suspense>
    );
  }

  // Use ConversationComponent in idle state for the Landing UI to match reference
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-2xl font-display text-[#9B7DBF]">Loading Nene...</div>}>
      <AgoraProvider>
        <ConversationComponent
          agoraData={{ channel: '', token: '', uid: '0' }}
          onTokenWillExpire={async () => ''}
          onEndConversation={() => {}}
          onStartConversation={handleStartConversation}
        />
      </AgoraProvider>
    </Suspense>
  );
}
