"use client";

import {
  AlertDialog,
  BufferingIndicator,
  CaptionsButton,
  Container,
  Controls,
  FullscreenButton,
  MuteButton,
  PiPButton,
  PlayButton,
  PlaybackRateButton,
  Popover,
  Poster,
  RenderProp,
  SeekButton,
  Slider,
  Time,
  TimeSlider,
  Tooltip,
  VolumeSlider,
  createPlayer,
  selectError,
  usePlayer,
} from "@videojs/react";
import { Video, videoFeatures } from "@videojs/react/video";
import {
  ComponentProps,
  ReactNode,
  forwardRef,
  isValidElement,
  useRef,
  type CSSProperties,
} from "react";
import "./player.css";

// ================================================================
// Player
// ================================================================

const SEEK_TIME = 10;

export const Player = createPlayer({ features: videoFeatures });

export interface VideoPlayerProps {
  src: string;
  style?: CSSProperties;
  className?: string;
  poster?: string | RenderProp<Poster.State> | undefined;
  thumbnailSrc?: string;
}

/**
 * @example
 * ```tsx
 * <VideoPlayer
 *   src="https://stream.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/highest.mp4"
 *   poster="https://image.mux.com/BV3YZtogl89mg9VcNBhhnHm02Y34zI1nlMuMQfAbl3dM/thumbnail.webp"
 * />
 * ```
 */
export function VideoPlayer({
  src,
  className,
  poster,
  thumbnailSrc,
  ...rest
}: VideoPlayerProps): ReactNode {
  return (
    <Player.Provider>
      <Container
        className={`media-minimal-skin media-minimal-skin--video ${className ?? ""}`}
        {...rest}
      >
        <Video src={src} playsInline crossOrigin="anonymous">
          {thumbnailSrc && (
            <track
              kind="metadata"
              label="thumbnails"
              src={thumbnailSrc}
              default
            />
          )}
        </Video>

        {poster && (
          <Poster
            src={isString(poster) ? poster : undefined}
            render={isRenderProp(poster) ? poster : undefined}
          />
        )}

        <BufferingIndicator
          render={(props) => (
            <div {...props} className="media-buffering-indicator">
              <SpinnerIcon className="media-icon" />
            </div>
          )}
        />

        <ErrorDialog />

        <Controls.Root className="media-controls">
          <Tooltip.Provider>
            <div className="media-button-group">
              <Tooltip.Root side="top">
                <Tooltip.Trigger
                  render={
                    <PlayButton
                      className="media-button--play"
                      render={<Button />}
                    >
                      <RestartIcon className="media-icon media-icon--restart" />
                      <PlayIcon className="media-icon media-icon--play" />
                      <PauseIcon className="media-icon media-icon--pause" />
                    </PlayButton>
                  }
                />
                <Tooltip.Popup className="media-tooltip">
                  <PlayLabel />
                </Tooltip.Popup>
              </Tooltip.Root>

              <Tooltip.Root side="top">
                <Tooltip.Trigger
                  render={
                    <SeekButton
                      seconds={-SEEK_TIME}
                      className="media-button--seek"
                      render={<Button />}
                    >
                      <span className="media-icon__container">
                        <SeekIcon className="media-icon media-icon--seek media-icon--flipped" />
                        <span className="media-icon__label">{SEEK_TIME}</span>
                      </span>
                    </SeekButton>
                  }
                />
                <Tooltip.Popup className="media-tooltip">
                  Seek backward {SEEK_TIME} seconds
                </Tooltip.Popup>
              </Tooltip.Root>

              <Tooltip.Root side="top">
                <Tooltip.Trigger
                  render={
                    <SeekButton
                      seconds={SEEK_TIME}
                      className="media-button--seek"
                      render={<Button />}
                    >
                      <span className="media-icon__container">
                        <SeekIcon className="media-icon media-icon--seek" />
                        <span className="media-icon__label">{SEEK_TIME}</span>
                      </span>
                    </SeekButton>
                  }
                />
                <Tooltip.Popup className="media-tooltip">
                  Seek forward {SEEK_TIME} seconds
                </Tooltip.Popup>
              </Tooltip.Root>
            </div>

            <div className="media-time-controls">
              <Time.Group className="media-time-group">
                <Time.Value
                  type="current"
                  className="media-time media-time--current"
                />
                <Time.Separator className="media-time-separator" />
                <Time.Value
                  type="duration"
                  className="media-time media-time--duration"
                />
              </Time.Group>

              <TimeSlider.Root className="media-slider">
                <TimeSlider.Track className="media-slider__track">
                  <TimeSlider.Fill className="media-slider__fill" />
                  <TimeSlider.Buffer className="media-slider__buffer" />
                </TimeSlider.Track>
                <TimeSlider.Thumb className="media-slider__thumb" />

                <div className="media-preview media-slider__preview">
                  <div className="media-preview__thumbnail-wrapper">
                    <Slider.Thumbnail className="media-preview__thumbnail" />
                  </div>
                  <TimeSlider.Value
                    type="pointer"
                    className="media-time media-preview__time"
                  />
                  <SpinnerIcon className="media-preview__spinner media-icon" />
                </div>
              </TimeSlider.Root>
            </div>

            <div className="media-button-group">
              <Tooltip.Root side="top">
                <Tooltip.Trigger
                  render={
                    <PlaybackRateButton
                      className="media-button--playback-rate"
                      render={<Button />}
                    />
                  }
                />
                <Tooltip.Popup className="media-tooltip">
                  Toggle playback rate
                </Tooltip.Popup>
              </Tooltip.Root>

              <VolumePopover />

              <Tooltip.Root side="top">
                <Tooltip.Trigger
                  render={
                    <CaptionsButton
                      className="media-button--captions"
                      render={<Button />}
                    >
                      <CaptionsOffIcon className="media-icon media-icon--captions-off" />
                      <CaptionsOnIcon className="media-icon media-icon--captions-on" />
                    </CaptionsButton>
                  }
                />
                <Tooltip.Popup className="media-tooltip">
                  <CaptionsLabel />
                </Tooltip.Popup>
              </Tooltip.Root>

              <Tooltip.Root side="top">
                <Tooltip.Trigger
                  render={
                    <PiPButton
                      className="media-button--pip"
                      render={<Button />}
                    >
                      <PipEnterIcon className="media-icon media-icon--pip-enter" />
                      <PipExitIcon className="media-icon media-icon--pip-exit" />
                    </PiPButton>
                  }
                />
                <Tooltip.Popup className="media-tooltip">
                  <PiPLabel />
                </Tooltip.Popup>
              </Tooltip.Root>

              <Tooltip.Root side="top">
                <Tooltip.Trigger
                  render={
                    <FullscreenButton
                      className="media-button--fullscreen"
                      render={<Button />}
                    >
                      <FullscreenEnterIcon className="media-icon media-icon--fullscreen-enter" />
                      <FullscreenExitIcon className="media-icon media-icon--fullscreen-exit" />
                    </FullscreenButton>
                  }
                />
                <Tooltip.Popup className="media-tooltip">
                  <FullscreenLabel />
                </Tooltip.Popup>
              </Tooltip.Root>
            </div>
          </Tooltip.Provider>
        </Controls.Root>

        <div className="media-overlay" />
      </Container>
    </Player.Provider>
  );
}

// ================================================================
// Labels
// ================================================================

function PlayLabel(): string {
  const paused = usePlayer((s) => Boolean(s.paused));
  const ended = usePlayer((s) => Boolean(s.ended));
  if (ended) return "Replay";
  return paused ? "Play" : "Pause";
}

function CaptionsLabel(): string {
  const active = usePlayer((s) => Boolean(s.subtitlesShowing));
  return active ? "Disable captions" : "Enable captions";
}

function PiPLabel(): string {
  const pip = usePlayer((s) => Boolean(s.pip));
  return pip ? "Exit picture-in-picture" : "Enter picture-in-picture";
}

function FullscreenLabel(): string {
  const fullscreen = usePlayer((s) => Boolean(s.fullscreen));
  return fullscreen ? "Exit fullscreen" : "Enter fullscreen";
}

// ================================================================
// Components
// ================================================================

const Button = forwardRef<HTMLButtonElement, ComponentProps<"button">>(
  function Button({ className, ...props }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        className={`media-button media-button--subtle media-button--icon ${className ?? ""}`}
        {...props}
      />
    );
  },
);

function VolumePopover(): ReactNode {
  const volumeUnsupported = usePlayer(
    (s) => s.volumeAvailability === "unsupported",
  );

  const muteButton = (
    <MuteButton className="media-button--mute" render={<Button />}>
      <VolumeOffIcon className="media-icon media-icon--volume-off" />
      <VolumeLowIcon className="media-icon media-icon--volume-low" />
      <VolumeHighIcon className="media-icon media-icon--volume-high" />
    </MuteButton>
  );

  if (volumeUnsupported) return muteButton;

  return (
    <Popover.Root openOnHover delay={200} closeDelay={100} side="top">
      <Popover.Trigger render={muteButton} />
      <Popover.Popup className="media-popover media-popover--volume">
        <VolumeSlider.Root
          className="media-slider"
          orientation="vertical"
          thumbAlignment="edge"
        >
          <VolumeSlider.Track className="media-slider__track">
            <VolumeSlider.Fill className="media-slider__fill" />
          </VolumeSlider.Track>
          <VolumeSlider.Thumb className="media-slider__thumb media-slider__thumb--persistent" />
        </VolumeSlider.Root>
      </Popover.Popup>
    </Popover.Root>
  );
}

// ================================================================
// Error Dialog
// ================================================================

function ErrorDialog(): ReactNode {
  const errorState = usePlayer(selectError);
  const lastError = useRef(errorState?.error);

  if (!errorState) return null;

  if (errorState?.error) lastError.current = errorState.error;

  return (
    <AlertDialog.Root
      open={Boolean(errorState.error)}
      onOpenChange={(open) => {
        if (!open) errorState.dismissError();
      }}
    >
      <AlertDialog.Popup className="media-error">
        <div className="media-error__dialog">
          <div className="media-error__content">
            <AlertDialog.Title className="media-error__title">
              Something went wrong.
            </AlertDialog.Title>
            <AlertDialog.Description className="media-error__description">
              {lastError.current?.message ??
                "An error occurred. Please try again."}
            </AlertDialog.Description>
          </div>
          <div className="media-error__actions">
            <AlertDialog.Close className="media-button media-button--primary">
              OK
            </AlertDialog.Close>
          </div>
        </div>
      </AlertDialog.Popup>
    </AlertDialog.Root>
  );
}

// ================================================================
// Utilities
// ================================================================

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isRenderProp(value: unknown): value is RenderProp<any> {
  return typeof value === "function" || isValidElement(value);
}

// ================================================================
// Icons
// ================================================================

function CaptionsOffIcon(props: ComponentProps<"svg">): ReactNode {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      fill="none"
      aria-hidden="true"
      viewBox="0 0 18 18"
      {...props}
    >
      <rect
        width="16.5"
        height="12.5"
        x=".75"
        y="2.75"
        stroke="currentColor"
        strokeWidth="1.5"
        rx="3"
      />
      <rect width="3" height="1.5" x="3" y="8.5" fill="currentColor" rx=".75" />
      <rect
        width="2"
        height="1.5"
        x="13"
        y="8.5"
        fill="currentColor"
        rx=".75"
      />
      <rect
        width="4"
        height="1.5"
        x="11"
        y="11.5"
        fill="currentColor"
        rx=".75"
      />
      <rect width="5" height="1.5" x="7" y="8.5" fill="currentColor" rx=".75" />
      <rect
        width="7"
        height="1.5"
        x="3"
        y="11.5"
        fill="currentColor"
        rx=".75"
      />
    </svg>
  );
}

function CaptionsOnIcon(props: ComponentProps<"svg">): ReactNode {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      fill="none"
      aria-hidden="true"
      viewBox="0 0 18 18"
      {...props}
    >
      <path
        fill="currentColor"
        d="M15 2a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3zM3.75 11.5a.75.75 0 0 0 0 1.5h5.5a.75.75 0 0 0 0-1.5zm8 0a.75.75 0 0 0 0 1.5h2.5a.75.75 0 0 0 0-1.5zm-8-3a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5zm4 0a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5zm6 0a.75.75 0 0 0 0 1.5h.5a.75.75 0 0 0 0-1.5z"
      />
    </svg>
  );
}

function FullscreenEnterIcon(props: ComponentProps<"svg">): ReactNode {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      fill="none"
      aria-hidden="true"
      viewBox="0 0 18 18"
      {...props}
    >
      <path
        fill="currentColor"
        d="M15.25 2a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0V3.5h-3.75a.75.75 0 0 1-.743-.648L10 2.75a.75.75 0 0 1 .75-.75z"
      />
      <path
        fill="currentColor"
        d="M14.72 2.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 1 1-1.06-1.06zM2.75 10a.75.75 0 0 1 .75.75v3.75h3.75a.75.75 0 0 1 .743.648L8 15.25a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 1 .75-.75"
      />
      <path
        fill="currentColor"
        d="M6.72 10.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06z"
      />
    </svg>
  );
}

function FullscreenExitIcon(props: ComponentProps<"svg">): ReactNode {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      fill="none"
      aria-hidden="true"
      viewBox="0 0 18 18"
      {...props}
    >
      <path
        fill="currentColor"
        d="M10.75 2a.75.75 0 0 1 .75.75V6.5h3.75a.75.75 0 0 1 .743.648L16 7.25a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 1 .75-.75"
      />
      <path
        fill="currentColor"
        d="M14.72 2.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 1 1-1.06-1.06zM7.25 10a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0V11.5H2.75a.75.75 0 0 1-.743-.648L2 10.75a.75.75 0 0 1 .75-.75z"
      />
      <path
        fill="currentColor"
        d="M6.72 10.22a.75.75 0 1 1 1.06 1.06l-4.5 4.5a.75.75 0 0 1-1.06-1.06z"
      />
    </svg>
  );
}

function PauseIcon(props: ComponentProps<"svg">): ReactNode {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      fill="none"
      aria-hidden="true"
      viewBox="0 0 18 18"
      {...props}
    >
      <rect width="4" height="12" x="3" y="3" fill="currentColor" rx="1.75" />
      <rect width="4" height="12" x="11" y="3" fill="currentColor" rx="1.75" />
    </svg>
  );
}

function PipEnterIcon(props: ComponentProps<"svg">): ReactNode {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      fill="none"
      aria-hidden="true"
      viewBox="0 0 18 18"
      {...props}
    >
      <path
        fill="currentColor"
        d="M13 2a4 4 0 0 1 4 4v2.645a3.5 3.5 0 0 0-1-.145h-.5V6A2.5 2.5 0 0 0 13 3.5H4A2.5 2.5 0 0 0 1.5 6v6A2.5 2.5 0 0 0 4 14.5h2.5v.5c0 .347.05.683.145 1H4a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4z"
      />
      <rect width="10" height="7" x="8" y="10" fill="currentColor" rx="2" />
      <path
        fill="currentColor"
        d="M7.25 10A.75.75 0 0 0 8 9.25v-3.5a.75.75 0 0 0-1.5 0V8.5H3.75a.75.75 0 0 0-.743.648L3 9.25c0 .414.336.75.75.75z"
      />
      <path
        fill="currentColor"
        d="M6.72 9.78a.75.75 0 0 0 1.06-1.06l-3.5-3.5a.75.75 0 0 0-1.06 1.06z"
      />
    </svg>
  );
}

function PipExitIcon(props: ComponentProps<"svg">): ReactNode {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      fill="none"
      aria-hidden="true"
      viewBox="0 0 18 18"
      {...props}
    >
      <path
        fill="currentColor"
        d="M13 2a4 4 0 0 1 4 4v2.646a3.5 3.5 0 0 0-1-.146h-.5V6A2.5 2.5 0 0 0 13 3.5H4A2.5 2.5 0 0 0 1.5 6v6A2.5 2.5 0 0 0 4 14.5h2.5v.5q.002.523.146 1H4a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4z"
      />
      <rect width="10" height="7" x="8" y="10" fill="currentColor" rx="2" />
      <path
        fill="currentColor"
        d="M3.75 5a.75.75 0 0 0-.75.75v3.5a.75.75 0 0 0 1.5 0V6.5h2.75a.75.75 0 0 0 .743-.648L8 5.75A.75.75 0 0 0 7.25 5z"
      />
      <path
        fill="currentColor"
        d="M4.28 5.22a.75.75 0 0 0-1.06 1.06l3.5 3.5a.75.75 0 0 0 1.06-1.06z"
      />
    </svg>
  );
}

function PlayIcon(props: ComponentProps<"svg">): ReactNode {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      fill="none"
      aria-hidden="true"
      viewBox="0 0 18 18"
      {...props}
    >
      <path
        fill="currentColor"
        d="m13.473 10.476-6.845 4.256a1.697 1.697 0 0 1-2.364-.547 1.77 1.77 0 0 1-.264-.93v-8.51C4 3.78 4.768 3 5.714 3c.324 0 .64.093.914.268l6.845 4.255a1.763 1.763 0 0 1 0 2.953"
      />
    </svg>
  );
}

function RestartIcon(props: ComponentProps<"svg">): ReactNode {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      fill="none"
      aria-hidden="true"
      viewBox="0 0 18 18"
      {...props}
    >
      <path
        fill="currentColor"
        d="M9 17a8 8 0 0 1-8-8h1.5a6.5 6.5 0 1 0 1.43-4.07l1.643 1.643A.25.25 0 0 1 5.396 7H1.25A.25.25 0 0 1 1 6.75V2.604a.25.25 0 0 1 .427-.177l1.438 1.438A8 8 0 1 1 9 17"
      />
      <path
        fill="currentColor"
        d="m11.61 9.639-3.331 2.07a.826.826 0 0 1-1.15-.266.86.86 0 0 1-.129-.452V6.849C7 6.38 7.374 6 7.834 6c.158 0 .312.045.445.13l3.331 2.071a.858.858 0 0 1 0 1.438"
      />
    </svg>
  );
}

function SeekIcon(props: ComponentProps<"svg">): ReactNode {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      fill="none"
      aria-hidden="true"
      viewBox="0 0 18 18"
      {...props}
    >
      <path
        fill="currentColor"
        d="M1 9c0 2.21.895 4.21 2.343 5.657l1.06-1.06a6.5 6.5 0 1 1 9.665-8.665l-1.641 1.641a.25.25 0 0 0 .177.427h4.146a.25.25 0 0 0 .25-.25V2.604a.25.25 0 0 0-.427-.177l-1.438 1.438A8 8 0 0 0 1 9"
      />
    </svg>
  );
}

function SpinnerIcon(props: ComponentProps<"svg">): ReactNode {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      fill="currentColor"
      aria-hidden="true"
      viewBox="0 0 18 18"
      {...props}
    >
      <rect width="2" height="5" x="8" y=".5" opacity=".5" rx="1">
        <animate
          attributeName="opacity"
          begin="0s"
          calcMode="linear"
          dur="1s"
          repeatCount="indefinite"
          values="1;0"
        />
      </rect>
      <rect
        width="2"
        height="5"
        x="12.243"
        y="2.257"
        opacity=".45"
        rx="1"
        transform="rotate(45 13.243 4.757)"
      >
        <animate
          attributeName="opacity"
          begin="0.125s"
          calcMode="linear"
          dur="1s"
          repeatCount="indefinite"
          values="1;0"
        />
      </rect>
      <rect width="5" height="2" x="12.5" y="8" opacity=".4" rx="1">
        <animate
          attributeName="opacity"
          begin="0.25s"
          calcMode="linear"
          dur="1s"
          repeatCount="indefinite"
          values="1;0"
        />
      </rect>
      <rect
        width="5"
        height="2"
        x="10.743"
        y="12.243"
        opacity=".35"
        rx="1"
        transform="rotate(45 13.243 13.243)"
      >
        <animate
          attributeName="opacity"
          begin="0.375s"
          calcMode="linear"
          dur="1s"
          repeatCount="indefinite"
          values="1;0"
        />
      </rect>
      <rect width="2" height="5" x="8" y="12.5" opacity=".3" rx="1">
        <animate
          attributeName="opacity"
          begin="0.5s"
          calcMode="linear"
          dur="1s"
          repeatCount="indefinite"
          values="1;0"
        />
      </rect>
      <rect
        width="2"
        height="5"
        x="3.757"
        y="10.743"
        opacity=".25"
        rx="1"
        transform="rotate(45 4.757 13.243)"
      >
        <animate
          attributeName="opacity"
          begin="0.625s"
          calcMode="linear"
          dur="1s"
          repeatCount="indefinite"
          values="1;0"
        />
      </rect>
      <rect width="5" height="2" x=".5" y="8" opacity=".15" rx="1">
        <animate
          attributeName="opacity"
          begin="0.75s"
          calcMode="linear"
          dur="1s"
          repeatCount="indefinite"
          values="1;0"
        />
      </rect>
      <rect
        width="5"
        height="2"
        x="2.257"
        y="3.757"
        opacity=".1"
        rx="1"
        transform="rotate(45 4.757 4.757)"
      >
        <animate
          attributeName="opacity"
          begin="0.875s"
          calcMode="linear"
          dur="1s"
          repeatCount="indefinite"
          values="1;0"
        />
      </rect>
    </svg>
  );
}

function VolumeHighIcon(props: ComponentProps<"svg">): ReactNode {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      fill="none"
      aria-hidden="true"
      viewBox="0 0 18 18"
      {...props}
    >
      <path
        fill="currentColor"
        d="M15.6 3.3c-.4-.4-1-.4-1.4 0s-.4 1 0 1.4C15.4 5.9 16 7.4 16 9s-.6 3.1-1.8 4.3c-.4.4-.4 1 0 1.4.2.2.5.3.7.3.3 0 .5-.1.7-.3C17.1 13.2 18 11.2 18 9s-.9-4.2-2.4-5.7"
      />
      <path
        fill="currentColor"
        d="M.714 6.008h3.072l4.071-3.857c.5-.376 1.143 0 1.143.601V15.28c0 .602-.643.903-1.143.602l-4.071-3.858H.714c-.428 0-.714-.3-.714-.752V6.76c0-.451.286-.752.714-.752m10.568.59a.91.91 0 0 1 0-1.316.91.91 0 0 1 1.316 0c1.203 1.203 1.47 2.216 1.522 3.208q.012.255.011.51c0 1.16-.358 2.733-1.533 3.803a.7.7 0 0 1-.298.156c-.382.106-.873-.011-1.018-.156a.91.91 0 0 1 0-1.316c.57-.57.995-1.551.995-2.487 0-.944-.26-1.667-.995-2.402"
      />
    </svg>
  );
}

function VolumeLowIcon(props: ComponentProps<"svg">): ReactNode {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      fill="none"
      aria-hidden="true"
      viewBox="0 0 18 18"
      {...props}
    >
      <path
        fill="currentColor"
        d="M.714 6.008h3.072l4.071-3.857c.5-.376 1.143 0 1.143.601V15.28c0 .602-.643.903-1.143.602l-4.071-3.858H.714c-.428 0-.714-.3-.714-.752V6.76c0-.451.286-.752.714-.752m10.568.59a.91.91 0 0 1 0-1.316.91.91 0 0 1 1.316 0c1.203 1.203 1.47 2.216 1.522 3.208q.012.255.011.51c0 1.16-.358 2.733-1.533 3.803a.7.7 0 0 1-.298.156c-.382.106-.873-.011-1.018-.156a.91.91 0 0 1 0-1.316c.57-.57.995-1.551.995-2.487 0-.944-.26-1.667-.995-2.402"
      />
    </svg>
  );
}

function VolumeOffIcon(props: ComponentProps<"svg">): ReactNode {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      fill="none"
      aria-hidden="true"
      viewBox="0 0 18 18"
      {...props}
    >
      <path
        fill="currentColor"
        d="M.714 6.008h3.072l4.071-3.857c.5-.376 1.143 0 1.143.601V15.28c0 .602-.643.903-1.143.602l-4.071-3.858H.714c-.428 0-.714-.3-.714-.752V6.76c0-.451.286-.752.714-.752M14.5 7.586l-1.768-1.768a1 1 0 1 0-1.414 1.414L13.085 9l-1.767 1.768a1 1 0 0 0 1.414 1.414l1.768-1.768 1.768 1.768a1 1 0 0 0 1.414-1.414L15.914 9l1.768-1.768a1 1 0 0 0-1.414-1.414z"
      />
    </svg>
  );
}
