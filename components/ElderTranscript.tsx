'use client';

import React, { useEffect, useRef } from 'react';
import { IMessageListItem, EMessageStatus } from '@/lib/message';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface ElderTranscriptProps {
  messageList: IMessageListItem[];
  currentInProgressMessage?: IMessageListItem | null;
}

export default function ElderTranscript({ messageList, currentInProgressMessage }: ElderTranscriptProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messageList, currentInProgressMessage?.text]);

  const allMessages = [...messageList];
  if (currentInProgressMessage && currentInProgressMessage.text.trim()) {
    allMessages.push(currentInProgressMessage);
  }

  // Filter out empty messages and only show last 20
  const displayMessages = allMessages
    .filter(m => m.text && m.text.trim().length > 0)
    .slice(-20);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-[18px_20px] flex flex-col gap-3.5 custom-scrollbar">
      {displayMessages.length === 0 ? (
        <div className="flex items-center justify-center py-7">
          <div className="font-display text-[14px] italic text-[#B39AAA] text-center">
            The conversation will appear here once you begin.
          </div>
        </div>
      ) : (
        displayMessages.map((msg, idx) => {
          const isNene = msg.uid === 0 || msg.uid.toString() === '333';
          return (
            <div key={idx} className={cn("flex", isNene ? "justify-start" : "justify-end")}>
              <div className={cn(
                "p-[12px_16px] shadow-[0_2px_8px_rgba(0,0,0,0.04)]",
                isMobile ? "max-w-[88%]" : "max-w-[75%]",
                isNene 
                  ? "bg-[linear-gradient(135deg,#EDE6F8,#FBF0F5)] border border-[#F2D4E2] rounded-[4px_16px_16px_16px]" 
                  : "bg-white border border-[#EDE0E8] rounded-[16px_4px_16px_16px]"
              )}>
                <div className={cn(
                  "font-ui text-[9px] font-bold tracking-[1.5px] uppercase mb-1",
                  isNene ? "text-[#9B7DBF]" : "text-[#C97B9F]"
                )}>
                  {isNene ? "Nene" : "Lola"}
                </div>
                <div className={cn(
                  "font-display text-[#261520] leading-[1.65]",
                  isMobile ? "text-[15px]" : "text-[14px]"
                )}>
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })
      )}
      <div ref={bottomRef} />
    </div>
  );
}
