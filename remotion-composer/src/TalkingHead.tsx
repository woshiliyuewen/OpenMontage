import React from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  Sequence,
  staticFile,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Audio } from "@remotion/media";
import { CaptionOverlay, WordCaption } from "./components/CaptionOverlay";
import { TextCard } from "./components/TextCard";
import { StatCard } from "./components/StatCard";
import { CalloutBox } from "./components/CalloutBox";
import { ComparisonCard } from "./components/ComparisonCard";
import { BarChart } from "./components/charts/BarChart";
import { LineChart } from "./components/charts/LineChart";
import { PieChart } from "./components/charts/PieChart";
import { KPIGrid } from "./components/charts/KPIGrid";
import { HeroTitle } from "./components/HeroTitle";
import { SectionTitle } from "./components/SectionTitle";
import { StatReveal } from "./components/StatReveal";

// ---------------------------------------------------------------------------
// Overlay types for talking-head video
// ---------------------------------------------------------------------------

export interface TalkingHeadOverlay {
  id?: string;
  type: string;
  in_seconds: number;
  out_seconds: number;
  position?:
    | "lower_third"
    | "upper_third"
    | "left_panel"
    | "right_panel"
    | "center_top"
    | "center_bottom"
    | "full_overlay";
  // Component-specific props (same as Explainer Cut)
  text?: string;
  stat?: string;
  subtitle?: string;
  callout_type?: "info" | "warning" | "tip" | "quote";
  title?: string;
  leftLabel?: string;
  rightLabel?: string;
  leftValue?: string;
  rightValue?: string;
  chartData?: any[];
  chartSeries?: any[];
  chartColors?: string[];
  chartAnimation?: string;
  donut?: boolean;
  centerLabel?: string;
  centerValue?: string;
  showGrid?: boolean;
  showValues?: boolean;
  showLegend?: boolean;
  showMarkers?: boolean;
  columns?: 2 | 3 | 4;
  // Styling
  backgroundColor?: string;
  color?: string;
  accentColor?: string;
  fontSize?: number;
  eyebrow?: string;
  items?: string[];
  variant?: "identity" | "course" | "risk";
}

export type EditorialCaption = {
  word: string;
  startMs: number;
  endMs: number;
  highlight?: string;
};

const reveal = (frame: number, fps: number, delay: number) =>
  spring({ frame: frame - delay, fps, config: { damping: 18, stiffness: 155, mass: 0.75 } });

const EditorialOverlay: React.FC<{ overlay: TalkingHeadOverlay }> = ({ overlay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 12 });
  const translateY = interpolate(enter, [0, 1], [24, 0]);
  const accent = overlay.accentColor || "#F6E94E";
  const isFull = overlay.position === "full_overlay";
  const titleIn = reveal(frame, fps, 4);
  const detailIn = reveal(frame, fps, 10);

  if (overlay.type === "editorial_keyword") {
    return (
      <AbsoluteFill style={{ justifyContent: "center", paddingLeft: 74, pointerEvents: "none" }}>
        <div style={{ opacity: enter, transform: `translateY(${translateY}px)`, width: 440 }}>
          <div style={{ color: "rgba(255,255,255,.72)", fontSize: 22, letterSpacing: 6, marginBottom: 8 }}>
            {overlay.eyebrow || "核心关键词"}
          </div>
          <div style={{ color: accent, fontSize: overlay.fontSize || 66, fontWeight: 950, lineHeight: 1.02, textShadow: "5px 5px 0 rgba(0,0,0,.35)" }}>
            {overlay.text}
          </div>
          <div style={{ height: 5, width: interpolate(detailIn, [0, 1], [0, 150]), background: accent, marginTop: 16 }} />
        </div>
      </AbsoluteFill>
    );
  }

  if (overlay.type === "editorial_evidence") {
    const identity = overlay.variant === "identity";
    const course = overlay.variant === "course";
    return (
      <AbsoluteFill style={{ justifyContent: "center", alignItems: isFull ? "center" : "flex-end", padding: isFull ? 100 : 62 }}>
        <div style={{ opacity: enter, transform: `translateY(${translateY}px)`, width: isFull ? "72%" : 510, background: identity ? "linear-gradient(145deg,#111214 0%,#202126 100%)" : "#111214", borderTop: `5px solid ${accent}`, boxShadow: `0 18px 54px rgba(0,0,0,.52)`, padding: "34px 38px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", width: 150, height: 150, borderRadius: "50%", border: `28px solid ${accent}`, opacity: .08, right: -48, top: -50 }} />
          <div style={{ color: "rgba(255,255,255,.58)", fontSize: 20, letterSpacing: 5, marginBottom: 10 }}>
            {overlay.eyebrow || "EVIDENCE / 证据"}
          </div>
          <div style={{ opacity: titleIn, transform: `translateX(${interpolate(titleIn,[0,1],[28,0])}px)`, color: "white", fontSize: overlay.fontSize || 48, fontWeight: 900, lineHeight: 1.12 }}>
            {overlay.title || overlay.text}
          </div>
          {identity && <div style={{ opacity: detailIn, display: "flex", alignItems: "center", gap: 12, marginTop: 18 }}><div style={{ width: 38, height: 38, borderRadius: "50%", border: `3px solid ${accent}` }} /><div style={{ width: 72, height: 3, background: accent }} /><div style={{ width: 38, height: 38, borderRadius: "50%", background: accent }} /></div>}
          {overlay.subtitle && <div style={{ opacity: detailIn, color: accent, fontSize: 30, fontWeight: 800, marginTop: 14 }}>{overlay.subtitle}</div>}
          {overlay.items && (
            <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
              {overlay.items.map((item, i) => {
                const itemIn = reveal(frame, fps, 14 + i * 5);
                return <div key={item} style={{ opacity: itemIn, transform: `translateY(${interpolate(itemIn,[0,1],[14,0])}px)`, color: course && i === 0 ? "#111214" : "#F5F5F5", background: course && i === 0 ? accent : "transparent", border: `1px solid ${course && i === 0 ? accent : "rgba(255,255,255,.25)"}`, padding: "9px 14px", fontSize: 22, fontWeight: 700 }}>{item}</div>;
              })}
            </div>
          )}
        </div>
      </AbsoluteFill>
    );
  }

  if (overlay.type === "editorial_comparison") {
    const leftIn = reveal(frame, fps, 5);
    const rightIn = reveal(frame, fps, 12);
    return (
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ position: "absolute", left: "7%", width: "72%", opacity: enter, transform: `scale(${interpolate(enter, [0, 1], [.96, 1])})` }}>
          <div style={{ color: accent, fontSize: 22, letterSpacing: 6, marginBottom: 14, textShadow: "0 2px 8px rgba(0,0,0,.95)" }}>{overlay.eyebrow || "一项技术，两面结果"}</div>
          <div style={{ color: "white", fontSize: 46, fontWeight: 950, marginBottom: 28, textShadow: "0 3px 12px rgba(0,0,0,.95)" }}>用途本身不决定结果</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <div style={{ opacity: leftIn, transform: `translateX(${interpolate(leftIn,[0,1],[-70,0])}px)`, border: `3px solid ${accent}`, padding: 36, background: "rgba(17,18,20,.88)", boxShadow: "0 14px 34px rgba(0,0,0,.28)" }}>
              <div style={{ color: accent, fontSize: 22, marginBottom: 22 }}>01 / OPPORTUNITY</div>
              <div style={{ color: accent, fontSize: 58, fontWeight: 950 }}>{overlay.leftLabel}</div>
              <div style={{ color: "white", fontSize: 30, marginTop: 12, lineHeight: 1.5 }}>{overlay.leftValue}</div>
            </div>
            <div style={{ opacity: rightIn, transform: `translateX(${interpolate(rightIn,[0,1],[70,0])}px)`, border: "3px solid rgba(255,255,255,.72)", padding: 36, background: "rgba(17,18,20,.88)", boxShadow: "0 14px 34px rgba(0,0,0,.28)" }}>
              <div style={{ color: "rgba(255,255,255,.58)", fontSize: 22, marginBottom: 22 }}>02 / CONSEQUENCE</div>
              <div style={{ color: "white", fontSize: 58, fontWeight: 950 }}>{overlay.rightLabel}</div>
              <div style={{ color: "rgba(255,255,255,.78)", fontSize: 30, marginTop: 12, lineHeight: 1.5 }}>{overlay.rightValue}</div>
            </div>
          </div>
          <div style={{ opacity: detailIn, marginTop: 24, color: "white", fontSize: 25, textShadow: "0 2px 8px rgba(0,0,0,.95)" }}><span style={{ color: accent, fontWeight: 900 }}>判断标准：</span>是否获得授权，是否会让他人误认</div>
        </div>
      </AbsoluteFill>
    );
  }

  if (overlay.type === "editorial_process") {
    const items = overlay.items || [];
    return (
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ position: "absolute", left: "6%", width: "82%" }}>
          <div style={{ opacity: enter, color: accent, fontSize: 21, letterSpacing: 6, textShadow: "0 2px 8px rgba(0,0,0,.95)" }}>{overlay.eyebrow}</div>
          <div style={{ opacity: titleIn, color: "white", fontSize: 60, fontWeight: 950, marginTop: 14, textShadow: "0 3px 12px rgba(0,0,0,.95)" }}>{overlay.title}</div>
          <div style={{ display: "flex", alignItems: "center", marginTop: 36 }}>
            {items.map((item, i) => {
              const itemIn = reveal(frame, fps, 10 + i * 7);
              return <React.Fragment key={item}>
                <div style={{ opacity: itemIn, transform: `scale(${interpolate(itemIn,[0,1],[.82,1])})`, minWidth: 230, padding: "24px 20px", background: "rgba(17,18,20,.88)", boxShadow: "0 12px 30px rgba(0,0,0,.25)", border: `2px solid ${i === items.length - 1 ? accent : "rgba(255,255,255,.62)"}`, color: i === items.length - 1 ? accent : "white", fontSize: 29, fontWeight: 850, textAlign: "center" }}><div style={{ fontSize: 17, opacity: .55, marginBottom: 7 }}>0{i + 1}</div>{item}</div>
                {i < items.length - 1 && <div style={{ opacity: reveal(frame,fps,14+i*7), color: accent, fontSize: 34, padding: "0 14px" }}>→</div>}
              </React.Fragment>;
            })}
          </div>
          <div style={{ opacity: reveal(frame,fps,38), color: "white", fontSize: 29, fontWeight: 700, marginTop: 30, lineHeight: 1.45, textShadow: "0 2px 8px rgba(0,0,0,.95)" }}><span style={{ color: accent, fontWeight: 900 }}>关键风险：</span>{overlay.subtitle}</div>
        </div>
      </AbsoluteFill>
    );
  }

  if (overlay.type === "editorial_final") {
    return (
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div style={{ opacity: enter, transform: `translateY(${translateY}px)`, textAlign: "left", width: "78%" }}>
          <div style={{ color: "white", fontSize: 21, letterSpacing: 8, textShadow: "0 2px 8px rgba(0,0,0,.95)" }}>{overlay.eyebrow || "最终建议"}</div>
          <div style={{ color: "white", fontSize: 86, fontWeight: 950, marginTop: 14, textShadow: "0 4px 16px rgba(0,0,0,.98)" }}>{overlay.text}</div>
          <div style={{ color: accent, fontSize: 40, fontWeight: 850, marginTop: 12, textShadow: "0 3px 12px rgba(0,0,0,.98)" }}>{overlay.subtitle}</div>
          <div style={{ display: "flex", gap: 18, marginTop: 30 }}>
            {["先授权", "标注为合成内容", "不用于身份冒用"].map((item, i) => <div key={item} style={{ opacity: reveal(frame,fps,14+i*5), background: "rgba(17,18,20,.82)", boxShadow: "0 10px 24px rgba(0,0,0,.24)", border: `2px solid ${i === 0 ? accent : "rgba(255,255,255,.7)"}`, color: i === 0 ? accent : "white", padding: "13px 20px", fontSize: 25, fontWeight: 800 }}>{item}</div>)}
          </div>
          <div style={{ width: 260, height: 6, background: accent, marginTop: 30 }} />
        </div>
      </AbsoluteFill>
    );
  }

  return null;
};

// ---------------------------------------------------------------------------
// Position presets for 9:16 (1080x1920) frame
// ---------------------------------------------------------------------------

const POSITION_STYLES: Record<string, React.CSSProperties> = {
  lower_third: {
    position: "absolute",
    bottom: 320, // Above caption area (~1600px)
    left: 40,
    right: 40,
    height: 480,
  },
  upper_third: {
    position: "absolute",
    top: 80,
    left: 40,
    right: 40,
    height: 480,
  },
  left_panel: {
    position: "absolute",
    top: 200,
    left: 40,
    width: 480,
    bottom: 400,
  },
  right_panel: {
    position: "absolute",
    top: 200,
    right: 40,
    width: 560,
    bottom: 400,
  },
  center_top: {
    position: "absolute",
    top: 44,
    left: "23%",
    width: "54%",
    height: 380,
  },
  center_bottom: {
    position: "absolute",
    bottom: 150,
    left: "23%",
    width: "54%",
    height: 330,
  },
  full_overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
};

// ---------------------------------------------------------------------------
// Overlay component dispatcher — maps overlay type to Remotion component
// ---------------------------------------------------------------------------

const OverlayContent: React.FC<{ overlay: TalkingHeadOverlay }> = ({
  overlay,
}) => {
  const bgColor = overlay.backgroundColor || "#0F172A";

  if (overlay.type.startsWith("editorial_")) {
    return <EditorialOverlay overlay={overlay} />;
  }

  if (overlay.type === "text_card" && overlay.text) {
    return (
      <TextCard
        text={overlay.text}
        fontSize={overlay.fontSize}
        color={overlay.color}
        backgroundColor={bgColor}
      />
    );
  }
  if (overlay.type === "stat_card" && overlay.stat) {
    return (
      <StatCard
        stat={overlay.stat}
        subtitle={overlay.subtitle}
        accentColor={overlay.accentColor}
        backgroundColor={bgColor}
      />
    );
  }
  if (overlay.type === "callout" && overlay.text) {
    return (
      <CalloutBox
        text={overlay.text}
        type={overlay.callout_type}
        title={overlay.title}
        borderColor={overlay.accentColor}
        backgroundColor={overlay.backgroundColor}
        textColor={overlay.color}
        containerBackgroundColor={bgColor}
      />
    );
  }
  if (
    overlay.type === "comparison" &&
    overlay.leftLabel &&
    overlay.rightLabel
  ) {
    return (
      <ComparisonCard
        leftLabel={overlay.leftLabel}
        rightLabel={overlay.rightLabel}
        leftValue={overlay.leftValue || ""}
        rightValue={overlay.rightValue || ""}
        title={overlay.title}
        backgroundColor={bgColor}
        textColor={overlay.color}
      />
    );
  }
  if (overlay.type === "bar_chart" && overlay.chartData) {
    return (
      <BarChart
        data={overlay.chartData}
        title={overlay.title}
        colors={overlay.chartColors}
        animationStyle={(overlay.chartAnimation as any) || "grow-up"}
        showValues={overlay.showValues}
        backgroundColor={bgColor}
      />
    );
  }
  if (overlay.type === "line_chart" && overlay.chartSeries) {
    return (
      <LineChart
        series={overlay.chartSeries}
        title={overlay.title}
        colors={overlay.chartColors}
        animationStyle={(overlay.chartAnimation as any) || "draw"}
        showGrid={overlay.showGrid}
        showMarkers={overlay.showMarkers}
        showLegend={overlay.showLegend}
        backgroundColor={bgColor}
      />
    );
  }
  if (overlay.type === "pie_chart" && overlay.chartData) {
    return (
      <PieChart
        data={overlay.chartData}
        title={overlay.title}
        colors={overlay.chartColors}
        animationStyle={(overlay.chartAnimation as any) || "expand"}
        donut={overlay.donut}
        centerLabel={overlay.centerLabel}
        centerValue={overlay.centerValue}
        showLegend={overlay.showLegend}
        backgroundColor={bgColor}
      />
    );
  }
  if (overlay.type === "kpi_grid" && overlay.chartData) {
    return (
      <KPIGrid
        metrics={overlay.chartData}
        title={overlay.title}
        columns={overlay.columns}
        colors={overlay.chartColors}
        animationStyle={(overlay.chartAnimation as any) || "count-up"}
        backgroundColor={bgColor}
      />
    );
  }
  if (overlay.type === "hero_title" && overlay.text) {
    return <HeroTitle title={overlay.text} subtitle={overlay.subtitle} />;
  }
  if (overlay.type === "section_title" && overlay.text) {
    return (
      <SectionTitle
        title={overlay.text}
        subtitle={overlay.subtitle}
        accentColor={overlay.accentColor}
        position="top-left"
      />
    );
  }
  if (overlay.type === "stat_reveal" && overlay.text) {
    return (
      <StatReveal
        stat={overlay.text}
        label={overlay.subtitle}
        accentColor={overlay.accentColor}
        position="bottom-right"
      />
    );
  }
  return null;
};

// ---------------------------------------------------------------------------
// Positioned overlay wrapper — handles position + fade in/out
// ---------------------------------------------------------------------------

const PositionedOverlay: React.FC<{ overlay: TalkingHeadOverlay }> = ({
  overlay,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Fade in over 8 frames (~0.27s), fade out over 8 frames
  const fadeIn = interpolate(frame, [0, 8], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 8, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const opacity = fadeIn * fadeOut;

  const position = overlay.position || "lower_third";
  const posStyle = POSITION_STYLES[position] || POSITION_STYLES.lower_third;
  const isFullOverlay = position === "full_overlay";
  const isEditorial = overlay.type.startsWith("editorial_");

  return (
    <div
      style={{
        ...posStyle,
        zIndex: 20,
        opacity,
        overflow: isEditorial ? "visible" : "hidden",
        borderRadius: isEditorial || isFullOverlay ? 0 : 16,
        boxShadow: isEditorial || isFullOverlay
          ? "none"
          : "0 8px 32px rgba(0, 0, 0, 0.4)",
      }}
    >
      {isFullOverlay && !isEditorial && (
        <AbsoluteFill style={{ background: "rgba(0, 0, 0, 0.7)" }} />
      )}
      <OverlayContent overlay={overlay} />
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main TalkingHead composition
// ---------------------------------------------------------------------------

export interface TalkingHeadProps {
  [key: string]: unknown;
  videoSrc: string;
  captions: WordCaption[];
  overlays?: TalkingHeadOverlay[];
  wordsPerPage?: number;
  fontSize?: number;
  highlightColor?: string;
  editorialMode?: boolean;
  durationSeconds?: number;
  soundSrc?: string;
  soundCueSeconds?: number[];
}

const EditorialCaptions: React.FC<{ captions: EditorialCaption[] }> = ({ captions }) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill style={{ zIndex: 30 }}>
      {captions.map((caption, i) => {
        const from = Math.round((caption.startMs / 1000) * fps);
        const duration = Math.max(1, Math.round(((caption.endMs - caption.startMs) / 1000) * fps));
        return (
          <Sequence key={`${caption.startMs}-${i}`} from={from} durationInFrames={duration} premountFor={fps}>
            <EditorialCaptionLine text={caption.word} highlight={caption.highlight} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};

const EditorialCaptionLine: React.FC<{ text: string; highlight?: string }> = ({ text, highlight }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 10 });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 34 }}>
      <div style={{ opacity: enter, transform: `translateY(${interpolate(enter, [0, 1], [12, 0])}px)`, color: "white", fontFamily: '"Microsoft YaHei", "Noto Sans CJK SC", sans-serif', fontSize: 50, fontWeight: 900, lineHeight: 1.28, textAlign: "center", maxWidth: "86%", textShadow: "0 3px 4px rgba(0,0,0,.98), 0 0 2px #000" }}>
        {highlight && text.includes(highlight) ? <>{text.split(highlight)[0]}<span style={{ color: "#F6E94E", display: "inline-block", transform: `scale(${interpolate(enter,[0,1],[.88,1])})` }}>{highlight}</span>{text.split(highlight).slice(1).join(highlight)}</> : text}
        <div style={{ height: 2, background: "rgba(255,255,255,.52)", margin: "10px auto 0", width: interpolate(enter, [0, 1], [0, 150]) }} />
      </div>
    </AbsoluteFill>
  );
};

export const TalkingHead: React.FC<TalkingHeadProps> = ({
  videoSrc,
  captions,
  overlays,
  wordsPerPage = 4,
  fontSize = 52,
  highlightColor = "#22D3EE",
  editorialMode = false,
  soundSrc,
  soundCueSeconds = [],
}) => {
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {/* Layer 1: Video background */}
      <OffthreadVideo
        src={staticFile(videoSrc)}
        style={{ position: "absolute", inset: 0, zIndex: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />

      {/* Layer 2: Overlays (charts, stats, callouts, etc.) */}
      {overlays?.map((overlay, i) => {
        const from = Math.round(overlay.in_seconds * fps);
        const duration = Math.round(
          (overlay.out_seconds - overlay.in_seconds) * fps
        );
        return (
          <Sequence
            key={overlay.id || `overlay-${i}`}
            from={from}
            durationInFrames={duration}
            premountFor={fps}
          >
            <PositionedOverlay overlay={overlay} />
          </Sequence>
        );
      })}

      {soundSrc && soundCueSeconds.map((cue, i) => (
        <Sequence key={`sound-${i}`} from={Math.round(cue * fps)} durationInFrames={Math.round(.45 * fps)}>
          <Audio src={staticFile(soundSrc)} volume={0.11} />
        </Sequence>
      ))}

      {/* Layer 3: Captions (topmost — always visible above overlays) */}
      {editorialMode ? (
        <EditorialCaptions captions={captions} />
      ) : (
        <CaptionOverlay
          words={captions}
          wordsPerPage={wordsPerPage}
          fontSize={fontSize}
          highlightColor={highlightColor}
          backgroundColor="rgba(0, 0, 0, 0.65)"
          color="#FFFFFF"
        />
      )}
    </AbsoluteFill>
  );
};
