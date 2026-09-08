"use client";

import { type ChangeEvent, type FormEvent, useRef, useState } from "react";

type UploadFormData = {
  title: string;
  description: string;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes;
  let unit = -1;
  do {
    value /= 1024;
    unit++;
  } while (value >= 1024 && unit < units.length - 1);
  return `${value.toFixed(1)} ${units[unit]}`;
}

function uploadWithProgress(
  body: FormData,
  onProgress: (fraction: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:4000/upload");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded / e.total);
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Upload failed (${xhr.status})`));
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(body);
  });
}

export default function UploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState<UploadFormData>({
    title: "",
    description: "",
  });
  const [errors, setErrors] = useState<Partial<UploadFormData>>({});
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  function validate(): boolean {
    const next: Partial<UploadFormData> = {};
    if (form.title.length < 10) next.title = "At least 10 characters";
    if (form.description.length < 20)
      next.description = "At least 20 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    if (selected && !form.title) {
      setForm((f) => ({ ...f, title: selected.name }));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!file || !validate()) return;

    setSubmitting(true);
    setProgress(0);
    const body = new FormData();
    body.append("video", file);
    body.append("title", form.title);
    body.append("description", form.description);

    try {
      await uploadWithProgress(body, setProgress);
      setDone(true);
    } catch {
      setErrors({ title: "Upload failed. Please try again." });
    } finally {
      setSubmitting(false);
      setProgress(null);
    }
  }

  if (done) {
    return (
      <div style={s.page}>
        <div style={s.card}>
          <a href="/" style={s.backButton}>
            <span style={s.backArrow}>&#8592;</span>
            Back to videos
          </a>
          <div style={s.successIcon}>&#10003;</div>
          <h2 style={s.cardTitle}>Upload complete</h2>
          <p style={s.cardSub}>
            Your video is being processed. Check the{" "}
            <a href="/" style={s.link}>
              videos page
            </a>{" "}
            for progress.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <div style={s.card}>
        <a href="/" style={s.backButton}>
          <span style={s.backArrow}>&#8592;</span>
        </a>
        <h2 style={s.cardTitle}>Upload Video</h2>
        <p style={s.cardSub}>Choose a video and add some details</p>

        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.dropZone} onClick={() => fileInputRef.current?.click()}>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              style={s.fileInput}
            />
            {file ? (
              <div style={s.fileInfo}>
                <span style={s.fileIcon}>&#9656;</span>
                <div>
                  <div style={s.fileName}>{file.name}</div>
                  <div style={s.fileSize}>
                    {(file.size / (1024 * 1024)).toFixed(1)} MB
                  </div>
                </div>
              </div>
            ) : (
              <div style={s.placeholder}>
                <span style={s.placeholderIcon}>&#43;</span>
                <span>Click to select a video</span>
              </div>
            )}
          </div>

          <label style={s.label}>
            Title
            <input
              type="text"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="Give your video a title"
              style={{
                ...s.input,
                borderColor: errors.title ? "#ef4444" : undefined,
              }}
            />
            {errors.title && <span style={s.error}>{errors.title}</span>}
          </label>

          <label style={s.label}>
            Description
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="What is this video about?"
              rows={3}
              style={{
                ...s.input,
                ...s.textarea,
                borderColor: errors.description ? "#ef4444" : undefined,
              }}
            />
            {errors.description && (
              <span style={s.error}>{errors.description}</span>
            )}
          </label>

          {progress !== null && file && (
            <div style={s.progressBlock}>
              <div style={s.progressHeader}>
                <span>
                  {formatBytes(progress * file.size)} of {formatBytes(file.size)}
                </span>
                <span style={s.progressPct}>
                  {Math.round(progress * 100)}%
                </span>
              </div>
              <div style={s.progressTrack}>
                <div
                  style={{ ...s.progressFill, width: `${Math.round(progress * 100)}%` }}
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="uploadButton"
            disabled={submitting || !file}
            style={{
              ...s.button,
              opacity: submitting || !file ? 0.5 : 1,
              cursor: submitting || !file ? "not-allowed" : "pointer",
            }}
          >
            {submitting
              ? progress !== null
                ? `Uploading… ${Math.round(progress * 100)}%`
                : "Uploading..."
              : "Upload"}
          </button>
        </form>
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 480,
    background: "color-mix(in srgb, var(--foreground) 5%, transparent)",
    border: "1px solid color-mix(in srgb, var(--foreground) 8%, transparent)",
    borderRadius: 16,
    padding: "32px 28px",
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
  cardTitle: {
    fontSize: 20,
    fontWeight: 600,
    color: "var(--foreground)",
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 14,
    color: "#888",
    marginBottom: 24,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },
  dropZone: {
    border: "2px dashed color-mix(in srgb, var(--foreground) 15%, transparent)",
    borderRadius: 12,
    padding: "28px 20px",
    cursor: "pointer",
    transition: "border-color 0.2s",
  },
  fileInput: {
    display: "none",
  },
  placeholder: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    fontSize: 14,
    color: "#888",
  },
  placeholderIcon: {
    fontSize: 28,
    lineHeight: 1,
    color: "#666",
  },
  fileInfo: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  fileIcon: {
    fontSize: 22,
    color: "#22c55e",
    flexShrink: 0,
  },
  fileName: {
    fontSize: 14,
    fontWeight: 500,
    color: "var(--foreground)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  fileSize: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    fontSize: 13,
    fontWeight: 500,
    color: "var(--foreground)",
  },
  input: {
    background: "color-mix(in srgb, var(--foreground) 4%, transparent)",
    border: "1px solid color-mix(in srgb, var(--foreground) 10%, transparent)",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 14,
    color: "var(--foreground)",
    outline: "none",
    fontFamily: "inherit",
    transition: "border-color 0.2s",
  },
  textarea: {
    resize: "vertical",
    minHeight: 72,
  },
  error: {
    fontSize: 12,
    color: "#ef4444",
  },
  button: {
    borderRadius: 10,
    padding: "12px 20px",
    fontSize: 14,
    fontWeight: 600,
    fontFamily: "inherit",
    transition: "opacity 0.2s",
  },
  progressBlock: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 13,
    color: "#888",
  },
  progressPct: {
    fontWeight: 600,
    color: "var(--foreground)",
    fontVariantNumeric: "tabular-nums",
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
    background: "color-mix(in srgb, var(--foreground) 10%, transparent)",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    background: "var(--accent)",
    transition: "width 0.2s ease",
  },
  link: {
    color: "#3b82f6",
    textDecoration: "underline",
    textUnderlineOffset: 2,
  },
  successIcon: {
    fontSize: 40,
    color: "#22c55e",
    marginBottom: 12,
  },
};
