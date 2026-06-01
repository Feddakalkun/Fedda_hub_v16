import { ArrowLeft } from 'lucide-react';
import { IMAGE_WORKFLOW_MODULES } from '../../modules/registry';

interface ImageSectionCardsProps {
  onSelect: (tab: string) => void;
  onBack?: () => void;
}

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
          {IMAGE_WORKFLOW_MODULES.map((module) => (
            <button
              key={module.id}
              onClick={() => onSelect(module.defaultTab)}
              aria-label={module.label}
              className="group relative aspect-[1168/784] overflow-hidden rounded-xl border border-teal-100/15 bg-[#07100f] transition hover:-translate-y-0.5 hover:border-teal-100/35"
            >
              <img
                src={module.card?.poster}
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
