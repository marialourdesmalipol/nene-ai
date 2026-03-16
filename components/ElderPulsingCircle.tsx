'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ILocalAudioTrack, IRemoteAudioTrack } from 'agora-rtc-react';

interface ElderPulsingCircleProps {
  track?: ILocalAudioTrack | IRemoteAudioTrack | undefined;
  status: 'idle' | 'listening' | 'thinking' | 'speaking';
  size?: number;
}

const C = {
  rose: "#C97B9F",
  green: "#6BAF90",
  amber: "#C98A32",
  lilac: "#9B7DBF",
};

const STATES_CFG = {
  idle: { color: "#BBA8B8", glow: "#BBA8B8", active: false },
  listening: { color: C.green, glow: "#4D9A78", active: true },
  thinking: { color: C.amber, glow: "#C98A32", active: true },
  speaking: { color: C.lilac, glow: "#7A5CAA", active: true },
};

export const ElderPulsingCircle: React.FC<ElderPulsingCircleProps> = ({ track, status, size = 140 }) => {
  const [volume, setVolume] = useState(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();

  const cfg = STATES_CFG[status] || STATES_CFG.idle;

  useEffect(() => {
    if (!track) {
      setVolume(0);
      return;
    }

    const startVisualizer = () => {
      try {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
        }

        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;
        
        const mediaStreamTrack = track.getMediaStreamTrack();
        const stream = new MediaStream([mediaStreamTrack]);
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(analyserRef.current);

        const animate = () => {
          if (!analyserRef.current) return;
          
          const bufferLength = analyserRef.current.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          analyserRef.current.getByteFrequencyData(dataArray);

          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const average = sum / bufferLength;
          setVolume(average);

          animationFrameRef.current = requestAnimationFrame(animate);
        };

        animate();
      } catch (error) {
        console.error('Error starting visualizer:', error);
      }
    };

    startVisualizer();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, [track]);

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      {cfg.active && (
        <>
          <div className="nn-halo" style={{ position: "absolute", inset: -size * 0.15, borderRadius: "50%", background: cfg.color, pointerEvents: "none" }} />
          <div className="nn-halo2" style={{ position: "absolute", inset: -size * 0.07, borderRadius: "50%", background: cfg.color, pointerEvents: "none" }} />
        </>
      )}
      <div className="nn-face" style={{
        width: size, height: size, borderRadius: "50%",
        background: `radial-gradient(circle at 38% 32%, #fff 0%, ${cfg.color}44 45%, ${cfg.color}BB 100%)`,
        boxShadow: `0 8px 36px ${cfg.glow}55, 0 2px 10px ${cfg.glow}22`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 90 90" fill="none">
          <ellipse cx="45" cy="16" rx="11" ry="9" fill="white" fillOpacity=".75" />
          <ellipse cx="36" cy="22" rx="5" ry="7" fill="white" fillOpacity=".5" />
          <ellipse cx="54" cy="22" rx="5" ry="7" fill="white" fillOpacity=".5" />
          <ellipse cx="45" cy="40" rx="22" ry="24" fill="white" fillOpacity=".88" />
          {status === "idle" ? (
            <>
              <path d="M34 38 Q37 35.5 40 38" stroke={cfg.color} strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M50 38 Q53 35.5 56 38" stroke={cfg.color} strokeWidth="2" strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <circle cx="37" cy="38" r="4" fill={cfg.color} fillOpacity=".9" />
              <circle cx="53" cy="38" r="4" fill={cfg.color} fillOpacity=".9" />
              <circle cx="38.4" cy="36.8" r="1.4" fill="white" />
              <circle cx="54.4" cy="36.8" r="1.4" fill="white" />
            </>
          )}
          <path d="M37 49 Q45 57 53 49" stroke={cfg.color} strokeWidth="2.3" strokeLinecap="round" fill="none" />
          <path d="M23 70 Q45 61 67 70" stroke="white" strokeOpacity=".45" strokeWidth="3" strokeLinecap="round" fill="none" />
          {status === "speaking" && [28, 35, 42, 49, 56].map((x, i) => (
            <rect key={i} className={`nn-bar nn-b${i + 1}`}
              x={x} y="72" width="4.5" height="10" rx="2.2"
              fill={cfg.color} fillOpacity=".85"
              style={{ 
                transformOrigin: `${x + 2.25}px 82px`,
                animationDelay: `${i * 0.15}s`
              }}
            />
          ))}
        </svg>
      </div>
    </div>
  );
};
