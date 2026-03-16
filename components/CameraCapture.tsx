'use client';

import { useState, useRef } from 'react';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface CameraCaptureProps {
  onCapture: (base64Image: string) => Promise<void>;
  isAnalyzing: boolean;
}

export default function CameraCapture({ onCapture, isAnalyzing }: CameraCaptureProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isMobile = useIsMobile();

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please allow permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleCapture = async () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const base64Image = canvasRef.current.toDataURL('image/jpeg', 0.8);
        stopCamera();
        setIsOpen(false);
        await onCapture(base64Image);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (open) startCamera();
      else stopCamera();
    }}>
      <DialogTrigger asChild>
        <button style={{
          flex: 1,
          height: isMobile ? 52 : 46,
          borderRadius: 12,
          border: "none",
          cursor: "pointer",
          background: `linear-gradient(135deg,#9B7DBF,#7550A8)`,
          color: "white",
          fontSize: isMobile ? 15 : 13,
          fontWeight: 700,
          fontFamily: `'Trebuchet MS','Segoe UI',Tahoma,Geneva,sans-serif`,
          letterSpacing: ".8px",
          boxShadow: "0 4px 16px rgba(120,80,180,.25)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px"
        }}>
          <Camera className="w-5 h-5" />
          Show Nene
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-[#FDF8F2] border-[#EDE0E8] rounded-[18px]">
        <DialogHeader>
          <DialogTitle className="font-display text-[20px] text-[#8F4D6E]">Show Nene something</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-full aspect-[4/3] bg-[#2A1622] rounded-[14px] overflow-hidden shadow-inner border border-[#EDE0E8]">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
          </div>
          <Button 
            onClick={handleCapture}
            disabled={isAnalyzing}
            className="w-full h-12 text-lg bg-[#6BAF90] hover:bg-[#6BAF90]/90 text-white rounded-[12px] font-bold font-ui tracking-wide"
          >
            {isAnalyzing ? 'Sending...' : 'Capture & Send'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
