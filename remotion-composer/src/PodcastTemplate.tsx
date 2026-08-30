import {
  AbsoluteFill,
  Easing,
  interpolate,
  OffthreadVideo,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const clips = [
  "scene-01-random-02m.mp4",
  "scene-02-random-08m.mp4",
  "scene-03-random-14m.mp4",
  "scene-04-random-20m.mp4",
];

const CLIP_FRAMES = 15 * 30;

const PodcastScene: React.FC<{ src: string; index: number }> = ({ src, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const motionPeak = index === 1 ? 1.035 : index === 2 ? 1.02 : index === 3 ? 1.02 : 1;
  const scale = index === 0
    ? 1
    : index === 3
      ? interpolate(frame, [0, CLIP_FRAMES], [motionPeak, 1], {
          easing: Easing.inOut(Easing.quad), extrapolateLeft: "clamp", extrapolateRight: "clamp",
        })
      : interpolate(frame, [0, CLIP_FRAMES / 2, CLIP_FRAMES], [1, motionPeak, index === 2 ? 1 : motionPeak], {
          easing: Easing.inOut(Easing.quad), extrapolateLeft: "clamp", extrapolateRight: "clamp",
        });
  const volume = (localFrame: number) => {
    const fadeIn = index === 0
      ? interpolate(localFrame, [0, Math.round(0.2 * fps)], [0, 1], { extrapolateRight: "clamp" })
      : 1;
    const fadeOut = index === clips.length - 1
      ? interpolate(localFrame, [CLIP_FRAMES - Math.round(0.25 * fps), CLIP_FRAMES], [1, 0], { extrapolateLeft: "clamp" })
      : 1;
    return fadeIn * fadeOut;
  };

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
      <OffthreadVideo
        muted
        src={staticFile(src)}
        style={{
          width: "100%", height: "100%", objectFit: "cover",
          transform: "scale(1.08)", filter: "blur(18px) brightness(42%) saturate(78%)",
        }}
      />
      <div style={{ position: "absolute", left: 0, top: 656, width: 1080, height: 607, overflow: "hidden", boxShadow: "0 18px 40px rgba(0,0,0,0.35)" }}>
        <OffthreadVideo
          src={staticFile(src)}
          volume={volume}
          style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${scale})`, transformOrigin: "center center" }}
        />
      </div>
    </AbsoluteFill>
  );
};

export const PodcastTemplate: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeToBlack = interpolate(frame, [1800 - 8, 1800], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", fontFamily: "Microsoft YaHei, Arial, sans-serif" }}>
      {clips.map((src, index) => (
        <Sequence key={src} from={index * CLIP_FRAMES} durationInFrames={CLIP_FRAMES}>
          <PodcastScene src={src} index={index} />
        </Sequence>
      ))}
      <div style={{ position: "absolute", left: 72, top: 126, height: 52, padding: "0 16px", display: "flex", alignItems: "center", backgroundColor: "rgba(15,23,42,0.84)", color: "#fff", fontSize: 28, fontWeight: 500, letterSpacing: 0.4 }}>
        随机片段 / NAVAL
      </div>
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: fadeToBlack }} />
    </AbsoluteFill>
  );
};
