'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import type { VersionConfig } from '@/lib/versionSchema';
import { AnimatedText } from './AnimatedText';

interface StageRendererProps {
  config: VersionConfig;
}

// ── Background helpers ────────────────────────────────────────────────────────

type BgConfig = VersionConfig['background'];

/** Pick the right path from a single-or-array source for the given stage. */
function resolveSrc(source: string | string[], index: number): string {
  return Array.isArray(source) ? (source[index] ?? source[0]) : source;
}

interface BgSrcs {
  desktop: string;
  desktopPosition: string;
  desktopFit: 'cover' | 'contain';
  mobile: string | null;
  mobilePosition: string;
  mobileFit: 'cover' | 'contain';
  backgroundColor: string;
}

/** Returns desktop + optional mobile src and object-position for the current stage. */
function resolveBgSrcs(bg: BgConfig, index: number): BgSrcs {
  if (typeof bg === 'string') {
    return { desktop: bg, desktopPosition: 'center', desktopFit: 'cover', mobile: null, mobilePosition: 'center', mobileFit: 'cover', backgroundColor: 'transparent' };
  }
  if (Array.isArray(bg)) {
    return { desktop: resolveSrc(bg, index), desktopPosition: 'center', desktopFit: 'cover', mobile: null, mobilePosition: 'center', mobileFit: 'cover', backgroundColor: 'transparent' };
  }
  return {
    desktop: resolveSrc(bg.desktop, index),
    desktopPosition: bg.desktopPosition ?? 'center',
    desktopFit: bg.desktopFit ?? 'cover',
    mobile: bg.mobile ? resolveSrc(bg.mobile, index) : null,
    mobilePosition: bg.mobilePosition ?? 'center',
    mobileFit: bg.mobileFit ?? 'cover',
    backgroundColor: bg.backgroundColor ?? 'transparent',
  };
}

/** True when backgrounds differ between stages (drives AnimatePresence key). */
function isBgMultiStage(bg: BgConfig): boolean {
  if (Array.isArray(bg)) return true;
  if (typeof bg === 'object') {
    return Array.isArray(bg.desktop) || Array.isArray(bg.mobile);
  }
  return false;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function StageRenderer({ config }: StageRendererProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [watermarkError, setWatermarkError] = useState(false);
  const totalStages = config.stages.length;
  const isMultiBg = isBgMultiStage(config.background);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const goNext = useCallback(() => {
    setCurrentStage((prev) => Math.min(prev + 1, totalStages - 1));
  }, [totalStages]);

  const goPrev = useCallback(() => {
    setCurrentStage((prev) => Math.max(prev - 1, 0));
  }, []);

  const goTo = useCallback((index: number) => {
    setCurrentStage(Math.max(0, Math.min(index, totalStages - 1)));
  }, [totalStages]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        goNext();
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;
    // Favour a vertical swipe over a horizontal one
    if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 40) {
      if (dy < 0) goNext();
      else goPrev();
    }
  };

  const stage = config.stages[currentStage];
  const { theme } = config;
  const resolvedTextColor = stage.textColor ?? theme.textColor;
  const resolvedAccentColor = stage.accentColor ?? theme.accentColor;

  const { desktop: bgDesktop, desktopPosition, desktopFit: bgDesktopFit, mobile: bgMobile, mobilePosition, mobileFit: bgMobileFit, backgroundColor } = resolveBgSrcs(
    config.background,
    currentStage,
  );
  const desktopFit = stage.backgroundFit ?? bgDesktopFit;
  const mobileFit = stage.backgroundFit ?? bgMobileFit;

  // Static bg: same key always → AnimatePresence won't re-animate it.
  // Per-stage bg: key changes → fades between backgrounds.
  const bgKey = isMultiBg ? `bg-${currentStage}` : 'bg-static';

  const isLastStage = currentStage === totalStages - 1;
  const hasLocations = !!(stage.locations && stage.locations.length > 0);
  // Grab nav from whichever stage declares it — shown on every page
  const globalNav = config.stages.find(s => s.nav && s.nav.length > 0)?.nav ?? null;

  return (
    <div
      className="relative w-full h-dvh overflow-hidden"
      style={{ color: resolvedTextColor, fontFamily: theme.fontBody }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={isLastStage || hasLocations ? undefined : goNext}
      role="main"
      aria-label={`Wedding invitation — stage ${currentStage + 1} of ${totalStages}`}
    >
      {/* ── Background layer ─────────────────────────────────────────── */}
      <AnimatePresence mode="sync">
        <motion.div
          key={bgKey}
          className="absolute inset-0"
          style={{ backgroundColor }}
          initial={{ opacity: isMultiBg ? 0 : 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: isMultiBg ? 0 : 1 }}
          transition={{ duration: 0.7 }}
        >
          {/* Desktop background
               contain → plain CSS background-image (no aspect-ratio cropping)
               cover   → Next.js Image fill (optimised, fills viewport) */}
          {desktopFit === 'contain' ? (
            <div
              className={`absolute inset-0 ${bgMobile ? 'hidden md:block' : ''}`}
              style={{
                backgroundImage: `url('${bgDesktop}')`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: desktopPosition,
              }}
            />
          ) : (
            <Image
              src={bgDesktop}
              alt=""
              fill
              sizes="100vw"
              className={`object-cover ${bgMobile ? 'hidden md:block' : 'block'}`}
              style={{
                objectPosition: desktopPosition,
                ...(stage.backgroundBlur ? { filter: `blur(${stage.backgroundBlur}px)`, transform: 'scale(1.08)' } : {}),
              }}
              priority={currentStage === 0}
              aria-hidden="true"
            />
          )}

          {/* Mobile background */}
          {bgMobile && (
            mobileFit === 'contain' ? (
              <div
                className="absolute inset-0 block md:hidden"
                style={{
                  backgroundImage: `url('${bgMobile}')`,
                  backgroundSize: 'contain',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: mobilePosition,
                }}
              />
            ) : (
              <Image
                src={bgMobile}
                alt=""
                fill
                sizes="100vw"
                className="object-cover block md:hidden"
                style={{ objectPosition: mobilePosition }}
                priority={currentStage === 0}
                aria-hidden="true"
              />
            )
          )}

          {/* Gradient overlay — stage.overlay overrides theme.overlay */}
          {(() => {
            const activeOverlay = stage.overlay !== undefined ? stage.overlay : theme.overlay;
            if (activeOverlay === 'none') return null;
            return (
              <div
                className="absolute inset-0"
                style={{
                  background:
                    activeOverlay ??
                    'linear-gradient(to bottom, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0.22) 45%, rgba(0,0,0,0.48) 100%)',
                }}
              />
            );
          })()}
        </motion.div>
      </AnimatePresence>

      {/* ── Persistent nav — hidden on the closing stages ────────────── */}
      {globalNav && currentStage < totalStages - 2 && (
        <nav
          className="absolute top-0 left-0 right-0 z-30 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 sm:gap-x-10 px-4 py-4 sm:py-5"
          onClick={(e) => e.stopPropagation()}
          aria-label="Event navigation"
        >
          {globalNav.map((item, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); goTo(item.stageIndex); }}
              className="text-[0.55rem] sm:text-[0.65rem] tracking-[0.28em] uppercase opacity-70 hover:opacity-100 transition-opacity font-medium cursor-pointer"
              style={{ color: resolvedTextColor, fontFamily: theme.fontBody }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      )}

      {/* ── Stage content ─────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`stage-${currentStage}`}
          className="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
        >
          {/* Henna watermark — landing page only */}
          {stage.watermark && !watermarkError && (
            <div
              className="absolute inset-y-0 right-0 w-2/5 pointer-events-none hidden md:block"
              style={{ opacity: 0.18 }}
              aria-hidden="true"
            >
              <Image
                src={stage.watermark}
                alt=""
                fill
                sizes="40vw"
                className="object-cover object-top"
                onError={() => setWatermarkError(true)}
              />
            </div>
          )}

          {stage.preheading && (
              <AnimatedText
                as="p"
                text={stage.preheading}
                preset={stage.animationPreset}
                duration={stage.timing.duration}
                delay={stage.timing.delay}
                className="font-light tracking-[0.28em] uppercase mb-1"
                style={{ fontSize: 'clamp(0.6rem, 1.2vw, 0.8rem)', color: resolvedAccentColor }}
              />
            )}

            {stage.heading && (
              <AnimatedText
                as="h1"
                text={stage.heading}
                preset={stage.animationPreset}
                duration={stage.timing.duration}
                delay={stage.timing.delay + (stage.preheading ? 0.3 : 0)}
                className="font-light leading-tight tracking-wide max-w-[88vw] break-words"
                style={{
                  fontFamily: theme.fontHeading,
                  fontSize: stage.headingSize ?? 'clamp(1.75rem, 5vw, 4.5rem)',
                }}
              />
            )}

            {stage.dividerAfterHeading && (
              <motion.div
                className="w-14 h-px"
                style={{ backgroundColor: resolvedAccentColor }}
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 0.7 }}
                transition={{ duration: 1.0, delay: stage.timing.delay + 0.5, ease: 'easeOut' }}
              />
            )}

            {stage.subheading && (
              <AnimatedText
                as="p"
                text={stage.subheading}
                preset={stage.animationPreset}
                duration={stage.timing.duration}
                delay={stage.timing.delay + 0.6}
                className="font-light tracking-[0.22em] uppercase opacity-85 mt-1 max-w-[80vw] break-words"
                style={{ fontSize: 'clamp(0.75rem, 1.6vw, 1.25rem)' }}
              />
            )}

            {stage.meta && stage.meta.length > 0 && (
              <div className="flex flex-col items-center gap-2 mt-3">
                {stage.meta.map((line, i) => (
                  <AnimatedText
                    key={i}
                    as="p"
                    text={line}
                    preset={stage.animationPreset}
                    duration={stage.timing.duration}
                    delay={stage.timing.delay + 0.5 + i * 0.14}
                    className="text-xs sm:text-sm tracking-widest opacity-70"
                  />
                ))}
              </div>
            )}

            {stage.locations && stage.locations.length > 0 && (
              <div
                className="w-full max-w-sm mt-4 flex flex-col overflow-y-auto"
                style={{ maxHeight: 'clamp(200px, 52vh, 400px)' }}
                onClick={(e) => e.stopPropagation()}
              >
                {stage.locations.map((loc, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: stage.timing.duration,
                      delay: stage.timing.delay + 0.4 + i * 0.18,
                    }}
                    className="flex items-start justify-between gap-4 py-3 border-b last:border-b-0"
                    style={{ borderColor: `${resolvedAccentColor}30` }}
                  >
                    <div className="flex flex-col gap-0.5 text-left flex-1 min-w-0">
                      <span
                        className="text-xs tracking-[0.2em] uppercase font-medium"
                        style={{ color: resolvedAccentColor }}
                      >
                        {loc.event}
                      </span>
                      {loc.date && (
                        <span className="text-[0.7rem] opacity-55 tracking-wide">{loc.date}</span>
                      )}
                      <span className="text-xs sm:text-sm opacity-80 leading-snug break-words">
                        {loc.venue}
                      </span>
                    </div>
                    <a
                      href={loc.mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="shrink-0 self-center text-[0.65rem] tracking-[0.15em] uppercase border px-2.5 py-1.5 transition-opacity opacity-70 hover:opacity-100"
                      style={{ borderColor: `${resolvedAccentColor}70`, color: resolvedAccentColor }}
                    >
                      Map ↗
                    </a>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Decorative accent line */}
            <motion.div
              className="w-10 h-px mt-5"
              style={{ backgroundColor: resolvedAccentColor }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 0.55 }}
              transition={{ duration: 0.9, delay: stage.timing.delay + 0.65, ease: 'easeOut' }}
            />
        </motion.div>
      </AnimatePresence>

      {/* ── Continue / end button ─────────────────────────────────────── */}
      {!isLastStage ? (
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            goNext();
          }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 group cursor-pointer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.5 }}
          aria-label="Next stage"
        >
          <span
            className="text-xs tracking-[0.3em] uppercase transition-opacity duration-200 group-hover:opacity-100 opacity-70"
            style={{ color: resolvedAccentColor }}
          >
            Continue
          </span>
          <span
            className="block w-px h-7 origin-top transition-transform duration-300 group-hover:scale-y-125"
            style={{ backgroundColor: resolvedAccentColor, opacity: 0.45 }}
            aria-hidden="true"
          />
        </motion.button>
      ) : (
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.8 }}
        >
          <span
            className="text-lg"
            style={{ color: resolvedAccentColor, opacity: 0.55 }}
            aria-label="End of invitation"
          >
            ♡
          </span>
        </motion.div>
      )}

      {/* ── Back hint (hidden on first stage) ─────────────────────────── */}
      {currentStage > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            goPrev();
          }}
          className="absolute top-6 left-6 z-20 text-xs tracking-[0.2em] uppercase opacity-40 hover:opacity-70 transition-opacity cursor-pointer"
          style={{ color: resolvedTextColor }}
          aria-label="Previous stage"
        >
          ← Back
        </button>
      )}
    </div>
  );
}
