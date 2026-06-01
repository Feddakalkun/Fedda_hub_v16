import { Bot, Film, Images, LayoutDashboard, Sparkles, Video, type LucideIcon } from 'lucide-react';

export type ModulePack = 'core' | 'booster';
export type ModuleArea = 'home' | 'image' | 'video' | 'system';
export type SourceModuleId = 'core-shell' | 'z-image-studio' | 'qwen-image' | 'wan-video' | 'ltx-video' | 'flux-klein';

export interface FeddaModule {
  id: string;
  sourceModuleId: SourceModuleId;
  label: string;
  description: string;
  area: ModuleArea;
  pack: ModulePack;
  enabled: boolean;
  tabs: string[];
  workflows?: string[];
  defaultTab: string;
  Icon: LucideIcon;
  card?: {
    poster: string;
    video?: string;
  };
}

export const APP_VERSION_LABEL = 'FEDDA Hub v16';
export const ACTIVE_TAB_STORAGE_KEY = 'fedda_v16_active_tab';

export const FEDDA_MODULES: FeddaModule[] = [
  {
    id: 'image-studio',
    sourceModuleId: 'z-image-studio',
    label: 'Image Studio',
    description: 'Text, reference and LoRA-driven image workflows synced with ComfyUI.',
    area: 'home',
    pack: 'core',
    enabled: true,
    tabs: ['image'],
    defaultTab: 'image',
    Icon: Sparkles,
    card: { poster: '/cards/deep-teal/image-studio.jpg', video: '/cards/deep-teal/home-image.mp4' },
  },
  {
    id: 'video-studio',
    sourceModuleId: 'wan-video',
    label: 'Video Studio',
    description: 'WAN and LTX motion workflows with a consistent workbench layout.',
    area: 'home',
    pack: 'core',
    enabled: true,
    tabs: ['video'],
    defaultTab: 'video',
    Icon: Video,
    card: { poster: '/cards/deep-teal/video-studio.jpg', video: '/cards/deep-teal/home-video.mp4' },
  },
  {
    id: 'gallery',
    sourceModuleId: 'core-shell',
    label: 'Gallery',
    description: 'One unified place for generated images and videos.',
    area: 'system',
    pack: 'core',
    enabled: true,
    tabs: ['gallery'],
    defaultTab: 'gallery',
    Icon: Images,
    card: { poster: '/cards/deep-teal/gallery.jpg', video: '/cards/deep-teal/home-gallery.mp4' },
  },
  {
    id: 'lora-character',
    sourceModuleId: 'core-shell',
    label: 'LoRA & Character',
    description: 'Install, import and manage LoRA character packs for active workflows.',
    area: 'system',
    pack: 'core',
    enabled: true,
    tabs: ['library'],
    defaultTab: 'library',
    Icon: LayoutDashboard,
    card: { poster: '/cards/deep-teal/lora-character.jpg', video: '/cards/deep-teal/home-lora.mp4' },
  },
  {
    id: 'ollama-models',
    sourceModuleId: 'core-shell',
    label: 'Ollama Models',
    description: 'Download and remove local text and vision models used by FEDDA tools.',
    area: 'system',
    pack: 'core',
    enabled: true,
    tabs: ['ollama'],
    defaultTab: 'ollama',
    Icon: Bot,
    card: { poster: '/cards/deep-teal/ollama-models.jpg', video: '/cards/deep-teal/home-ollama.mp4' },
  },
  {
    id: 'z-image-basic',
    sourceModuleId: 'z-image-studio',
    label: 'Z-Image Txt2Img',
    description: 'Fast core text-to-image generation.',
    area: 'image',
    pack: 'core',
    enabled: true,
    tabs: ['z-image', 'z-image-txt2img'],
    workflows: ['z-image'],
    defaultTab: 'z-image-txt2img',
    Icon: Sparkles,
    card: { poster: '/cards/deep-teal/z-image-txt2img.jpg' },
  },
  {
    id: 'z-image-dual-lora',
    sourceModuleId: 'z-image-studio',
    label: 'Z-Image Dual LoRA',
    description: 'Two-LoRA character/detail workflow.',
    area: 'image',
    pack: 'booster',
    enabled: true,
    tabs: ['z-image-dual-lora'],
    workflows: ['z-image-dual-base', 'z-image-dual-detail'],
    defaultTab: 'z-image-dual-lora',
    Icon: Sparkles,
    card: { poster: '/cards/deep-teal/z-image-dual-lora.jpg' },
  },
  {
    id: 'flux2-klein',
    sourceModuleId: 'flux-klein',
    label: 'FLUX2-KLEIN',
    description: 'FLUX2-KLEIN 9B image generation.',
    area: 'image',
    pack: 'booster',
    enabled: true,
    tabs: ['flux', 'flux-txt2img'],
    workflows: ['flux2klein-txt2img'],
    defaultTab: 'flux-txt2img',
    Icon: Sparkles,
    card: { poster: '/cards/deep-teal/flux2-klein.jpg' },
  },
  {
    id: 'qwen-image',
    sourceModuleId: 'qwen-image',
    label: 'Qwen Image',
    description: 'Qwen text, reference and multi-angle image tools.',
    area: 'image',
    pack: 'booster',
    enabled: true,
    tabs: ['qwen', 'qwen-txt2img', 'qwen-image-ref', 'qwen-multi-angle'],
    workflows: ['qwen-edit-2512'],
    defaultTab: 'qwen-txt2img',
    Icon: Sparkles,
    card: { poster: '/cards/deep-teal/qwen-txt2img.jpg' },
  },
  {
    id: 'qwen-reference',
    sourceModuleId: 'qwen-image',
    label: 'Qwen Reference',
    description: 'Image-reference generation and edits.',
    area: 'image',
    pack: 'booster',
    enabled: true,
    tabs: ['qwen-image-ref'],
    workflows: ['qwen-edit-2509-image-reference'],
    defaultTab: 'qwen-image-ref',
    Icon: Sparkles,
    card: { poster: '/cards/deep-teal/qwen-reference.jpg' },
  },
  {
    id: 'qwen-multi-angle',
    sourceModuleId: 'qwen-image',
    label: 'Qwen Multi Angle',
    description: 'Generate angle variants from one input.',
    area: 'image',
    pack: 'booster',
    enabled: true,
    tabs: ['qwen-multi-angle'],
    workflows: ['qwen-multi-angles', 'qwen-multi-angles-fast'],
    defaultTab: 'qwen-multi-angle',
    Icon: Sparkles,
    card: { poster: '/cards/deep-teal/qwen-multi-angle.jpg' },
  },
  {
    id: 'wan22-img2vid',
    sourceModuleId: 'wan-video',
    label: 'WAN 2.2 Img2Vid',
    description: 'Animate a still image with WAN 2.2.',
    area: 'video',
    pack: 'booster',
    enabled: true,
    tabs: ['wan22-img2vid'],
    workflows: ['wan22-img2vid'],
    defaultTab: 'wan22-img2vid',
    Icon: Video,
    card: { poster: '/cards/deep-teal/wan22-img2vid.jpg' },
  },
  {
    id: 'wan22-vid2vid',
    sourceModuleId: 'wan-video',
    label: 'WAN 2.2 Vid2Vid',
    description: 'Transform and extend a video clip.',
    area: 'video',
    pack: 'booster',
    enabled: true,
    tabs: ['wan22-vid2vid'],
    workflows: ['wan22-vid2vid'],
    defaultTab: 'wan22-vid2vid',
    Icon: Video,
    card: { poster: '/cards/deep-teal/wan22-vid2vid.jpg' },
  },
  {
    id: 'wan22-story',
    sourceModuleId: 'wan-video',
    label: 'WAN Story',
    description: 'Build video from a six-frame story sequence.',
    area: 'video',
    pack: 'booster',
    enabled: true,
    tabs: ['wan22-img2vid-6frames'],
    workflows: ['wan22-img2vid-6frames'],
    defaultTab: 'wan22-img2vid-6frames',
    Icon: Video,
    card: { poster: '/cards/deep-teal/wan-story.jpg' },
  },
  {
    id: 'steady-dancer',
    sourceModuleId: 'wan-video',
    label: 'Steady Dancer',
    description: 'Transfer dance motion from reference video.',
    area: 'video',
    pack: 'booster',
    enabled: true,
    tabs: ['wan21-steady-dancer'],
    workflows: ['wan21-steady-dancer', 'z-image-controlnet-pose'],
    defaultTab: 'wan21-steady-dancer',
    Icon: Video,
    card: { poster: '/cards/deep-teal/steady-dancer.jpg' },
  },
  {
    id: 'ltx-img2vid',
    sourceModuleId: 'ltx-video',
    label: 'LTX Img2Vid',
    description: 'Animate one reference image with LTX.',
    area: 'video',
    pack: 'booster',
    enabled: true,
    tabs: ['ltx', 'ltx-img2vid'],
    workflows: ['ltx-img2vid'],
    defaultTab: 'ltx-img2vid',
    Icon: Film,
    card: { poster: '/cards/deep-teal/ltx-img2vid.jpg' },
  },
  {
    id: 'ltx-first-last',
    sourceModuleId: 'ltx-video',
    label: 'LTX First / Last',
    description: 'Interpolate motion between two keyframes.',
    area: 'video',
    pack: 'booster',
    enabled: true,
    tabs: ['ltx-flf'],
    workflows: ['ltx-flf'],
    defaultTab: 'ltx-flf',
    Icon: Film,
    card: { poster: '/cards/deep-teal/ltx-first-last.jpg' },
  },
];

export const ENABLED_MODULES = FEDDA_MODULES.filter((module) => module.enabled);
export const HOME_MODULES = ENABLED_MODULES.filter((module) => module.card && (module.area === 'home' || module.area === 'system'));
export const IMAGE_WORKFLOW_MODULES = ENABLED_MODULES.filter((module) => module.area === 'image' && module.card);
export const VIDEO_WORKFLOW_MODULES = ENABLED_MODULES.filter((module) => module.area === 'video' && module.card);

export const VALID_TABS = new Set(ENABLED_MODULES.flatMap((module) => module.tabs));

export const PAGE_META = Object.fromEntries(
  ENABLED_MODULES.flatMap((module) =>
    module.tabs.map((tab) => [tab, { label: module.label, Icon: module.Icon }]),
  ),
);

export const DEFAULT_TAB = IMAGE_WORKFLOW_MODULES[0]?.defaultTab || 'image';
