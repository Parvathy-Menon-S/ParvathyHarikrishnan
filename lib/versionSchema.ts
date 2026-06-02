import { z } from 'zod';

export const AnimationPresetSchema = z.enum(['fade', 'fade-up', 'blur-to-clear']);

export const TimingSchema = z.object({
  duration: z.number().positive(),
  delay: z.number().min(0),
});

const LocationSchema = z.object({
  event: z.string(),
  date: z.string().optional(),
  venue: z.string(),
  mapUrl: z.string().url(),
});

const NavItemSchema = z.object({
  label: z.string(),
  stageIndex: z.number().int().min(0),
});

export const StageSchema = z.object({
  heading: z.string().optional(),
  preheading: z.string().optional(),
  subheading: z.string().optional(),
  meta: z.array(z.string()).optional(),
  locations: z.array(LocationSchema).optional(),
  nav: z.array(NavItemSchema).optional(),
  watermark: z.string().optional(),
  textColor: z.string().optional(),
  accentColor: z.string().optional(),
  card: z.boolean().optional(),
  animationPreset: AnimationPresetSchema,
  timing: TimingSchema,
  // Any valid CSS font-size value, e.g. "3rem", "clamp(2rem,5vw,4rem)", "48px".
  // Omit to use the default fluid clamp size.
  headingSize: z.string().optional(),
  // Per-stage overlay override. Same values as theme.overlay.
  // Omit to inherit the theme-level overlay.
  overlay: z.string().optional(),
  // Per-stage background fit override: 'cover' or 'contain'.
  // Omit to use the background-level desktopFit / mobileFit setting.
  backgroundFit: z.enum(['cover', 'contain']).optional(),
  // Gaussian blur in px applied to the background image (0 = no blur).
  backgroundBlur: z.number().optional(),
  // Renders a thin accent divider between the heading and subheading.
  dividerAfterHeading: z.boolean().optional(),
});

export const ThemeSchema = z.object({
  primaryColor: z.string(),
  textColor: z.string(),
  accentColor: z.string(),
  fontHeading: z.string(),
  fontBody: z.string(),
  // CSS `background` value painted over the image to aid text legibility.
  // Set to "none" to remove the overlay entirely.
  // Defaults to a dark-to-bottom gradient if omitted.
  overlay: z.string().optional(),
});

// A background source is either a single image path or one path per stage.
const BackgroundSourceSchema = z.union([
  z.string().min(1),
  z.array(z.string().min(1)).min(1),
]);

export const VersionConfigSchema = z.object({
  id: z
    .string()
    .regex(/^[a-z0-9-_]+$/, 'ID must be lowercase alphanumeric with hyphens or underscores'),
  title: z.string().min(1),
  theme: ThemeSchema,
  // Accepted forms:
  //   string                       — same image for all devices & stages
  //   string[]                     — per-stage, same for all devices
  //   { desktop, mobile? }         — separate landscape / portrait images;
  //                                  each value can itself be a string or string[].
  //   desktopPosition / mobilePosition — CSS object-position value (e.g. "center top")
  //                                       controls which part of the image stays
  //                                       visible when object-cover crops.
  //   desktopFit / mobileFit           — "cover" (default, fills viewport, may crop)
  //                                       "contain" (shows full image, may letterbox)
  //   backgroundColor                  — fill colour shown behind a contained image
  background: z.union([
    BackgroundSourceSchema,
    z.object({
      desktop: BackgroundSourceSchema,
      mobile: BackgroundSourceSchema.optional(),
      desktopPosition: z.string().optional(),
      mobilePosition: z.string().optional(),
      desktopFit: z.enum(['cover', 'contain']).optional(),
      mobileFit: z.enum(['cover', 'contain']).optional(),
      backgroundColor: z.string().optional(),
    }),
  ]),
  stages: z.array(StageSchema).min(1).max(10),
});

export type VersionConfig = z.infer<typeof VersionConfigSchema>;
export type Stage = z.infer<typeof StageSchema>;
export type Theme = z.infer<typeof ThemeSchema>;
export type AnimationPreset = z.infer<typeof AnimationPresetSchema>;
