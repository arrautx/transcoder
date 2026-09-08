import DeleteMenu from "./delete-menu";

type VideoResponse = {
  videos: {
    id: string;
    title: string;
    description: string;
    status:
      | "uploaded"
      | "thumbnail-generating"
      | "transcoding"
      | "error"
      | "processed";
  }[];
};

const statusConfig: Record<
  VideoResponse["videos"][number]["status"],
  { label: string; icon: string; color: string }
> = {
  uploaded: { label: "Queued", icon: "\u25CB", color: "#888" },
  "thumbnail-generating": {
    label: "Generating thumbnails",
    icon: "\u25D0",
    color: "#f59e0b",
  },
  transcoding: { label: "Transcoding", icon: "\u25D4", color: "#3b82f6" },
  error: { label: "Error", icon: "\u2716", color: "#ef4444" },
  processed: { label: "Ready", icon: "\u2714", color: "#22c55e" },
};

export default async function Home() {
  const res = await fetch("http://localhost:4000/videos", {
    cache: "no-store",
  });
  const data = (await res.json()) as VideoResponse;

  if (!data.videos.length) {
    return (
      <div style={styles.emptyState}>
        <p style={styles.emptyIcon}>&#9656;</p>
        <h2 style={styles.emptyTitle}>No videos yet</h2>
        <p style={styles.emptySub}>Upload a video to get started</p>
        <a href="/upload" className="uploadButton" style={{ ...styles.uploadButton, marginLeft: 0 }}>
          <span style={styles.uploadButtonIcon}>&#43;</span>
          Upload video
        </a>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.heading}>Videos</h1>
        <span style={styles.count}>{data.videos.length}</span>
        <a href="/upload" className="uploadButton" style={styles.uploadButton}>
          <span style={styles.uploadButtonIcon}>&#43;</span>
          Upload
        </a>
      </header>
      <div style={styles.grid}>
        {data.videos.map((video) => {
          const status = statusConfig[video.status];
          const isReady =
            video.status !== "error" &&
            video.status !== "uploaded" &&
            video.status !== "thumbnail-generating";

          return (
            <a
              key={video.id}
              href={isReady ? `/videos/${video.id}` : undefined}
              style={{
                ...styles.card,
                cursor: isReady ? "pointer" : "default",
                opacity: video.status === "error" ? 0.6 : 1,
              }}
            >
              <div style={styles.thumbnailWrapper}>
                <img
                  src={`/default.jpg`}
                  alt={video.title}
                  style={styles.thumbnail}
                />
                {!isReady && (
                  <div style={styles.overlay}>
                    <span style={styles.overlayIcon}>{status.icon}</span>
                  </div>
                )}
                <DeleteMenu videoId={video.id} />
              </div>
              <div style={styles.info}>
                <h3 style={styles.title}>{video.title}</h3>
                <p style={styles.description}>{video.description}</p>
                <div style={{ ...styles.statusBadge, color: status.color }}>
                  <span>{status.icon}</span>
                  <span style={styles.statusLabel}>{status.label}</span>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 1200,
    margin: "0 auto",
    padding: "40px 24px",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 32,
  },
  uploadButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    marginLeft: "auto",
    borderRadius: 10,
    padding: "10px 18px",
    fontSize: 14,
    fontWeight: 600,
    textDecoration: "none",
    cursor: "pointer",
  },
  uploadButtonIcon: {
    fontSize: 16,
    fontWeight: 600,
    lineHeight: 1,
  },
  heading: {
    fontSize: 24,
    fontWeight: 600,
    color: "var(--foreground)",
  },
  count: {
    fontSize: 13,
    fontWeight: 500,
    color: "#888",
    background: "color-mix(in srgb, var(--foreground) 6%, transparent)",
    borderRadius: 999,
    padding: "2px 10px",
    fontVariantNumeric: "tabular-nums",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: 24,
  },
  card: {
    display: "block",
    borderRadius: 12,
    overflow: "hidden",
    background: "color-mix(in srgb, var(--foreground) 6%, transparent)",
    border: "1px solid transparent",
  },
  thumbnailWrapper: {
    position: "relative",
    width: "100%",
    aspectRatio: "16 / 9",
    overflow: "hidden",
    background: "#111",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0, 0, 0, 0.55)",
    backdropFilter: "blur(4px)",
  },
  overlayIcon: {
    fontSize: 32,
    color: "#fff",
    animation: "pulse 1.5s ease-in-out infinite",
  },
  info: {
    padding: "14px 16px 18px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: 600,
    lineHeight: 1.3,
    color: "var(--foreground)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  description: {
    fontSize: 13,
    lineHeight: 1.4,
    color: "#888",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    fontWeight: 500,
    marginTop: 4,
  },
  statusLabel: {
    textTransform: "uppercase" as const,
    letterSpacing: 0.04,
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "80vh",
    gap: 8,
  },
  emptyIcon: {
    fontSize: 48,
    color: "#555",
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: "var(--foreground)",
  },
  emptySub: {
    fontSize: 14,
    color: "#888",
    marginBottom: 12,
  },
};
