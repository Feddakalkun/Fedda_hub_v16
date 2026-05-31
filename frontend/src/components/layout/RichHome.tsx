interface RichHomeProps {
  onSelect: (id: string) => void;
}

const CARDS = [
  {
    id: 'image',
    label: 'Image Studio',
    description: 'Text, reference and LoRA-driven image workflows synced with ComfyUI.',
    poster: '/cards/deep-teal/image-studio.jpg',
    video: '/cards/deep-teal/home-image.mp4',
  },
  {
    id: 'video',
    label: 'Video Studio',
    description: 'WAN and LTX motion workflows with a consistent workbench layout.',
    poster: '/cards/deep-teal/video-studio.jpg',
    video: '/cards/deep-teal/home-video.mp4',
  },
  {
    id: 'gallery',
    label: 'Gallery',
    description: 'One unified place for generated images and videos.',
    poster: '/cards/deep-teal/gallery.jpg',
    video: '/cards/deep-teal/home-gallery.mp4',
  },
  {
    id: 'library',
    label: 'LoRA & Character',
    description: 'Install, import and manage LoRA character packs for active workflows.',
    poster: '/cards/deep-teal/lora-character.jpg',
    video: '/cards/deep-teal/home-lora.mp4',
  },
  {
    id: 'ollama',
    label: 'Ollama Models',
    description: 'Download and remove local text and vision models used by FEDDA tools.',
    poster: '/cards/deep-teal/ollama-models.jpg',
    video: '/cards/deep-teal/home-ollama.mp4',
  },
];

export const RichHome = ({ onSelect }: RichHomeProps) => {
  const topCards = CARDS.slice(0, 2);
  const bottomCards = CARDS.slice(2);

  return (
    <div className="h-full overflow-y-auto custom-scrollbar bg-[#050908]">
      <div className="mx-auto flex min-h-full w-full max-w-[1500px] flex-col px-8 py-8">
        <section className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="v14-kicker text-teal-100/45">FEDDA Hub v15</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Workflow-first AI studio</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              A slim distribution base focused on ComfyUI workflows, output review, LoRA characters and local Ollama models.
            </p>
          </div>
          <div className="rounded-xl border border-teal-200/15 bg-teal-950/20 px-4 py-3 text-[11px] uppercase tracking-[0.18em] text-teal-100/50">
            Deep Teal card system
          </div>
        </section>

        <section className="space-y-4">
          <div className="mx-auto grid max-w-[980px] gap-4 md:grid-cols-2">
            {topCards.map(({ id, label, poster, video }) => (
              <button
                key={id}
                onClick={() => onSelect(id)}
                aria-label={label}
                className="group relative aspect-[1168/784] overflow-hidden rounded-xl border border-teal-100/15 bg-[#07100f] transition-all hover:-translate-y-0.5 hover:border-teal-100/35"
              >
                <img
                  src={poster}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
                <video
                  className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
                  src={video}
                  poster={poster}
                  muted
                  loop
                  playsInline
                  autoPlay
                />
              </button>
            ))}
          </div>

          <div className="mx-auto grid max-w-[1240px] gap-4 md:grid-cols-3">
            {bottomCards.map(({ id, label, poster, video }) => (
              <button
                key={id}
                onClick={() => onSelect(id)}
                aria-label={label}
                className="group relative aspect-[1168/784] overflow-hidden rounded-xl border border-teal-100/15 bg-[#07100f] transition-all hover:-translate-y-0.5 hover:border-teal-100/35"
              >
                <img
                  src={poster}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
                <video
                  className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
                  src={video}
                  poster={poster}
                  muted
                  loop
                  playsInline
                  autoPlay
                />
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
