import { ArrowLeft } from 'lucide-react';

interface VideoSectionCardsProps {
  onSelect: (tab: string) => void;
  onBack?: () => void;
}

const WORKFLOWS = [
  {
    tab: 'wan22-img2vid',
    label: 'WAN 2.2 Img2Vid',
    description: 'Animate a still image with WAN 2.2.',
    image: '/cards/deep-teal/wan22-img2vid.jpg',
  },
  {
    tab: 'wan22-vid2vid',
    label: 'WAN 2.2 Vid2Vid',
    description: 'Transform and extend a video clip.',
    image: '/cards/deep-teal/wan22-vid2vid.jpg',
  },
  {
    tab: 'wan22-img2vid-6frames',
    label: 'WAN Story',
    description: 'Build video from a six-frame story sequence.',
    image: '/cards/deep-teal/wan-story.jpg',
  },
  {
    tab: 'wan21-steady-dancer',
    label: 'Steady Dancer',
    description: 'Transfer dance motion from reference video.',
    image: '/cards/deep-teal/steady-dancer.jpg',
  },
  {
    tab: 'ltx-img2vid',
    label: 'LTX Img2Vid',
    description: 'Animate one reference image with LTX.',
    image: '/cards/deep-teal/ltx-img2vid.jpg',
  },
  {
    tab: 'ltx-flf',
    label: 'LTX First / Last',
    description: 'Interpolate motion between two keyframes.',
    image: '/cards/deep-teal/ltx-first-last.jpg',
  },
];

export const VideoSectionCards = ({ onSelect, onBack }: VideoSectionCardsProps) => {
  return (
    <div className="h-full overflow-y-auto custom-scrollbar bg-[#050908] px-8 py-8">
      <div className="mx-auto max-w-[1400px] space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="v14-kicker text-teal-100/45">Video Studio</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white">Choose a video workflow</h1>
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
