import { VideoPlayer } from "../../video-player-2";

type VideoData = {
  id: string;
  title: string;
  description: string;
  status: string;
};

export default async function VideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;

  const res = await fetch(`http://localhost:4000/videos/${id}`, {
    cache: "no-store",
  });
  const data = (await res.json()) as { video: VideoData | null };
  const video = data.video;

  if (!video) {
    return (
      <div style={styles.notFound}>
        <h1 style={styles.notFoundTitle}>Video not found</h1>
        <a href="/" style={styles.backLink}>
          &larr; Back to videos
        </a>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <a href="/" style={styles.backButton}>
        <span style={styles.backArrow}>&#8592;</span>
      </a>
      <div style={styles.playerWrapper}>
        <VideoPlayer
          src={`http://localhost:4000/uploads/${id}_hls/master.m3u8`}
          thumbnailSrc={`http://localhost:4000/uploads/${id}_hls/thumbnails.vtt`}
          style={{ width: "100%", height: "auto" }}
        />
      </div>
      <div style={styles.meta}>
        <h1 style={styles.title}>{video.title}</h1>
        <div style={styles.divider} />
        <p style={styles.description}>{video.description}</p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "24px 24px 60px",
  },
  backButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontSize: 14,
    fontWeight: 500,
    color: "var(--foreground)",
    textDecoration: "none",
    background: "color-mix(in srgb, var(--foreground) 6%, transparent)",
    border: "1px solid color-mix(in srgb, var(--foreground) 10%, transparent)",
    borderRadius: 10,
    padding: "8px 14px",
    marginBottom: 16,
    transition: "background 0.2s",
  },
  backArrow: {
    fontSize: 15,
    lineHeight: 1,
  },
  playerWrapper: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    background: "#000",
  },
  meta: {
    padding: "20px 0 0",
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    lineHeight: 1.3,
    color: "var(--foreground)",
  },
  divider: {
    height: 1,
    background: "color-mix(in srgb, var(--foreground) 12%, transparent)",
    margin: "16px 0",
  },
  description: {
    fontSize: 14,
    lineHeight: 1.6,
    color: "#888",
  },
  notFound: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "80vh",
    gap: 12,
  },
  notFoundTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: "var(--foreground)",
  },
  backLink: {
    fontSize: 14,
    color: "#888",
  },
};
