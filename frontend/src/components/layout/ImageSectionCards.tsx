import { ArrowLeft } from 'lucide-react';

interface ImageSectionCardsProps {
  onSelect: (tab: string) => void;
  onBack?: () => void;
}

const WORKFLOWS = [
  {
    tab: 'z-image-txt2img',
    label: 'Z-Image Txt2Img',
    description: 'Fast core text-to-image generation.',
    image: '/cards/deep-teal/z-image-txt2img.jpg',
  },
  {
    tab: 'z-image-dual-lora',
    label: 'Z-Image Dual LoRA',
    description: 'Two-LoRA character/detail workflow.',
    image: '/cards/deep-teal/z-image-dual-lora.jpg',
  },
  {
    tab: 'flux-txt2img',
    label: 'FLUX2-KLEIN',
    description: 'FLUX2-KLEIN 9B image generation.',
    image: '/cards/deep-teal/flux2-klein.jpg',
  },
  {
    tab: 'qwen-txt2img',
    label: 'Qwen Txt2Img',
    description: 'Qwen image generation workspace.',
    image: '/cards/deep-teal/qwen-txt2img.jpg',
  },
  {
    tab: 'qwen-image-ref',
    label: 'Qwen Reference',
    description: 'Image-reference generation and edits.',
    image: '/cards/deep-teal/qwen-reference.jpg',
  },
  {
    tab: 'qwen-multi-angle',
    label: 'Qwen Multi Angle',
    description: 'Generate angle variants from one input.',
    image: '/cards/deep-teal/qwen-multi-angle.jpg',
  },
];

export const ImageSectionCards = ({ onSelect, onBack }: ImageSectionCardsProps) => {
  return (
    <div className="h-full overflow-y-auto custom-scrollbar bg-[#050908] px-8 py-8">
      <div className="mx-auto max-w-[1400px] space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="v14-kicker text-teal-100/45">Image Studio</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">Choose an image workflow</h1>
          </div>
          {onBack && (
            <button onClick={onBack} className="v15-home-btn inline-flex items-center gap-2">
              <ArrowLeft className="h-3.5 w-3.5" /> Home
            </button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {WORKFLOWS.map(({ tab, label, description, image }) => (
            <button
              key={tab}
              onClick={() => onSelect(tab)}
              className="group relative min-h-[310px] overflow-hidden rounded-xl border border-teal-100/15 bg-[#07100f] text-left transition hover:-translate-y-0.5 hover:border-teal-100/35"
            >
              <img
                src={image}
                alt=""
                className="absolute inset-0 h-full w-full object-cover opacity-95 transition duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <h2 className="text-lg font-semibold text-white">{label}</h2>
                <p className="mt-2 max-w-md text-sm leading-5 text-teal-50/65">{description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
