"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteMenu({ videoId }: { videoId: string }) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(false);
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  async function handleDelete() {
    setDeleting(true);
    setError(false);
    try {
      const res = await fetch(`http://localhost:4000/videos/${videoId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      setOpen(false);
      router.refresh();
    } catch {
      setError(true);
    } finally {
      setDeleting(false);
    }
  }

  return (
    // The card is an <a>; stop the click from bubbling / navigating
    <div
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      style={s.root}
    >
      <button
        type="button"
        aria-label="Video options"
        title="Video options"
        onClick={() => setOpen((v) => !v)}
        style={s.dots}
      >
        &#8942;
      </button>
      {open && (
        <div style={s.menu}>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            style={{
              ...s.menuItem,
              opacity: deleting ? 0.6 : 1,
              cursor: deleting ? "not-allowed" : "pointer",
            }}
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
          {error && <div style={s.menuError}>Delete failed</div>}
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 10,
  },
  dots: {
    width: 30,
    height: 30,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    fontWeight: 700,
    lineHeight: 1,
    color: "#fff",
    background: "rgba(0, 0, 0, 0.6)",
    border: "none",
    borderRadius: 999,
    cursor: "pointer",
    backdropFilter: "blur(4px)",
  },
  menu: {
    position: "absolute",
    top: 36,
    right: 0,
    minWidth: 130,
    background: "var(--background)",
    border: "1px solid color-mix(in srgb, var(--foreground) 12%, transparent)",
    borderRadius: 10,
    padding: 4,
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)",
  },
  menuItem: {
    display: "block",
    width: "100%",
    textAlign: "left",
    fontSize: 13,
    fontWeight: 500,
    color: "#ef4444",
    background: "transparent",
    border: "none",
    borderRadius: 7,
    padding: "8px 12px",
    fontFamily: "inherit",
  },
  menuError: {
    fontSize: 11,
    color: "#ef4444",
    padding: "2px 12px 6px",
  },
};
