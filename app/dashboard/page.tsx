'use client';

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, CheckCircle, Clock, HeartPulse, Pill, Activity, User, Calendar } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const C = {
  rose: "#C97B9F",
  roseDark: "#8F4D6E",
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
  greenPale: "#D6EFE4",
  amber: "#C98A32",
  amberPale: "#FEF0D6",
  red: "#BE5555",
  redPale: "#FCEAEA",
};

function Card({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-[14px] p-[18px_20px] border border-[#EDE0E8] shadow-[0_2px_16px_rgba(42,22,34,0.05)]">
      <div className="font-ui text-[8px] font-bold tracking-[2.5px] text-[#B39AAA] uppercase mb-3 pb-2.5 border-b border-[#EDE0E8]">
        {title}
      </div>
      {children}
    </div>
  );
}

function StatusBadge({ label, color }: { label: string, color: string }) {
  return (
    <span className="inline-block px-[9px] py-[2px] rounded-[20px] font-ui text-[9px] font-bold tracking-[1.2px] uppercase" 
          style={{ backgroundColor: `${color}22`, color }}>
      {label}
    </span>
  );
}

export default function Dashboard() {
  const isMobile = useIsMobile();
  const aStyle = {
    amber: { dot: C.amber, bg: C.amberPale, label: "Concern" },
    green: { dot: C.green, bg: C.greenPale, label: "Good" },
    red: { dot: C.red, bg: C.redPale, label: "Emergency" },
  };

  const [alerts] = useState([
    { sev: 'amber' as const, time: '10:23 AM', msg: 'Headache reported — Lola mentioned head pain' },
    { sev: 'green' as const, time: '10:26 AM', msg: 'Took Losartan — medication confirmed' },
    { sev: 'amber' as const, time: '10:28 AM', msg: 'Losartan was not yet taken at check-in time' },
  ]);

  const [meds] = useState([
    { name: "Losartan 50mg", sub: "Blood Pressure", status: "taken" as const, note: "Taken 10:26 AM" },
    { name: "Metformin 500mg", sub: "Diabetes", status: "pending" as const, note: "After lunch" },
  ]);

  const [checkin] = useState([
    { label: "Mood", val: "Okay", ok: true },
    { label: "Sleep", val: "Good", ok: true },
    { label: "Meal", val: "Not yet", ok: false },
    { label: "Pain", val: "Headache 10:23 AM", ok: false },
  ]);

  const [conversationLog] = useState([
    { sender: 'Nene', role: 'nene', text: 'Hi Lola! Ako si Nene, ang apo mong laging nandito para sa\'yo. Kumusta ka today?', time: '8:00 AM' },
    { sender: 'Lola', role: 'lola', text: 'Okay naman apo. Medyo masakit lang tuhod ko.', time: '8:01 AM' },
    { sender: 'Nene', role: 'nene', text: 'Naku, kawawa naman po si Lola. Uminom na po ba kayo ng gamot?', time: '8:01 AM' },
    { sender: 'Lola', role: 'lola', text: 'Oo, tapos na.', time: '8:02 AM' },
  ]);

  const mIcon = { taken: "✓", pending: "…", missed: "✗" };
  const mColor = { taken: C.green, pending: C.amber, missed: C.red };
  const mBg = { taken: C.greenPale, pending: C.amberPale, missed: C.redPale };

  return (
    <div className="flex-1 overflow-y-auto bg-[#F5EFF5]">
      {/* Header */}
      <div className={cn(
        "bg-white border-b border-[#EDE0E8] flex items-center justify-between sticky top-0 z-10 shadow-sm",
        isMobile ? "p-[14px_20px]" : "p-[18px_36px]"
      )}>
        <div>
          <div className={cn("font-display text-[#261520] tracking-[0.5px]", isMobile ? "text-[18px]" : "text-[22px]")}>Family Dashboard</div>
          <div className={cn("font-ui text-[#B39AAA] mt-0.5", isMobile ? "text-[10px]" : "text-[11px]")}>
            March 16, 2026 &nbsp;·&nbsp; Today's Summary
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="nn-live w-1.75 h-1.75 rounded-full bg-[#6BAF90]" style={{ boxShadow: `0 0 0 3px ${C.greenPale}` }} />
          <span className={cn("font-ui text-[#6BAF90] font-bold", isMobile ? "text-[11px]" : "text-[12px]")}>Connected</span>
        </div>
      </div>

      <div className={cn(
        "flex flex-col gap-3.5",
        isMobile ? "p-[16px_16px_40px]" : "p-[28px_36px_48px]"
      )}>
        {/* Row 1 Grid */}
        <div className={cn("grid gap-3.5", isMobile ? "grid-cols-1" : "grid-cols-3")}>
          <Card title="Today's Check-in">
            {checkin.map((r, i) => (
              <div key={i} className={cn(
                "flex justify-between items-center py-2",
                i < checkin.length - 1 && "border-b border-[#EDE0E8]"
              )}>
                <span className={cn("font-ui text-[#6B4A5C]", isMobile ? "text-[13px]" : "text-[12px]")}>{r.label}</span>
                <span className={cn("font-ui font-bold", isMobile ? "text-[13px]" : "text-[12px]", r.ok ? "text-[#261520]" : "text-[#BE5555]")}>{r.val}</span>
              </div>
            ))}
          </Card>

          <Card title="Medication Today">
            {meds.map((m, i) => (
              <div key={i} className={cn(
                "flex items-center gap-3 py-2.25",
                i < meds.length - 1 && "border-b border-[#EDE0E8]"
              )}>
                <div className="w-7.5 h-7.5 rounded-full shrink-0 flex items-center justify-center font-bold text-[14px]"
                     style={{ backgroundColor: mBg[m.status], color: mColor[m.status] }}>
                  {mIcon[m.status]}
                </div>
                <div>
                  <div className={cn("font-ui font-bold text-[#261520]", isMobile ? "text-[14px]" : "text-[13px]")}>{m.name}</div>
                  <div className="font-ui text-[10px] text-[#B39AAA] mt-0.25">{m.sub} · {m.note}</div>
                </div>
              </div>
            ))}
          </Card>

          <Card title="Quick Stats">
            {[
              { label: "Last check-in", val: "10:28 AM" },
              { label: "Session length", val: "6 min" },
              { label: "Alerts today", val: "2 concerns" },
              { label: "Next reminder", val: "Metformin (lunch)" },
            ].map((s, i, arr) => (
              <div key={i} className={cn(
                "flex justify-between py-2",
                i < arr.length - 1 && "border-b border-[#EDE0E8]"
              )}>
                <span className={cn("font-ui text-[#6B4A5C]", isMobile ? "text-[13px]" : "text-[12px]")}>{s.label}</span>
                <span className={cn("font-ui font-bold text-[#261520]", isMobile ? "text-[13px]" : "text-[12px]")}>{s.val}</span>
              </div>
            ))}
          </Card>
        </div>

        {/* Row 2 Grid */}
        <div className={cn("grid gap-3.5", isMobile ? "grid-cols-1" : "grid-cols-[1fr_1.6fr]")}>
          <Card title="Alerts">
            <div className="flex flex-col gap-2.5">
              {alerts.map((a, i) => {
                const s = aStyle[a.sev];
                return (
                  <div key={i} className="flex gap-3 px-3.5 py-3 rounded-[10px] border"
                       style={{ backgroundColor: s.bg, borderColor: `${s.dot}33` }}>
                    <div className="w-1.75 h-1.75 rounded-full shrink-0 mt-1.25" style={{ backgroundColor: s.dot }} />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <StatusBadge label={s.label} color={s.dot} />
                        <span className="font-ui text-[10px] text-[#B39AAA]">{a.time}</span>
                      </div>
                      <div className={cn("font-ui text-[#261520] leading-[1.5]", isMobile ? "text-[13px]" : "text-[12px]")}>{a.msg}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card title="Conversation Log">
            <ScrollArea className={cn("w-full pr-1", isMobile ? "h-auto" : "h-[300px]")}>
              <div className="flex flex-col gap-3.5">
                {conversationLog.map((m, i) => {
                  const isNene = m.role === 'nene';
                  return (
                    <div key={i} className="flex gap-2.5 items-start">
                      <div className={cn(
                        "w-7 h-7 rounded-full shrink-0 mt-0.5 flex items-center justify-center font-ui text-[9px] font-bold border",
                        isNene ? "bg-[#EDE6F8] border-[#F2D4E2] text-[#9B7DBF]" : "bg-[#FBF0F5] border-[#F2D4E2] text-[#C97B9F]"
                      )}>
                        {isNene ? "N" : "L"}
                      </div>
                      <div>
                        <span className={cn(
                          "font-ui text-[10px] font-bold tracking-[1.2px] uppercase",
                          isNene ? "text-[#9B7DBF]" : "text-[#C97B9F]"
                        )}>
                          {isNene ? "Nene" : "Lola"}
                        </span>
                        <div className={cn("font-display text-[#261520] leading-[1.65] mt-0.5", isMobile ? "text-[14px]" : "text-[13px]")}>
                          {m.text}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  );
}
