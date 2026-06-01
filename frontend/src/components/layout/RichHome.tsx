import { APP_VERSION_LABEL, HOME_MODULES } from '../../modules/registry';

interface RichHomeProps {
  onSelect: (id: string) => void;
}

export const RichHome = ({ onSelect }: RichHomeProps) => {
  const cards = HOME_MODULES.filter((module) => module.card);
  const topCards = cards.slice(0, 2);
  const bottomCards = cards.slice(2);

  return (
    <div className="h-full overflow-y-auto custom-scrollbar bg-[#050908]">
      <div className="mx-auto flex min-h-full w-full max-w-[1500px] flex-col px-8 py-8">
        <section className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="v14-kicker text-teal-100/45">{APP_VERSION_LABEL}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">Workflow-first AI studio</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              A modular distribution base focused on ComfyUI workflows, output review, LoRA characters and local Ollama models.
            </p>
          </div>
          <div className="rounded-xl border border-teal-200/15 bg-teal-950/20 px-4 py-3 text-[11px] uppercase tracking-[0.18em] text-teal-100/50">
            Modular core + booster packs
          </div>
        </section>

        <section className="space-y-4">
          <div className="mx-auto grid max-w-[980px] gap-4 md:grid-cols-2">
            {topCards.map((module) => (
              <button
                key={module.id}
                onClick={() => onSelect(module.defaultTab)}
                aria-label={module.label}
                className="group relative aspect-[1168/784] overflow-hidden rounded-xl border border-teal-100/15 bg-[#07100f] transition-all hover:-translate-y-0.5 hover:border-teal-100/35"
              >
                <img
                  src={module.card?.poster}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
                {module.card?.video ? (
                  <video
                    className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
                    src={module.card.video}
                    poster={module.card.poster}
                    muted
                    loop
                    playsInline
                    autoPlay
                  />
                ) : null}
              </button>
            ))}
          </div>

          <div className="mx-auto grid max-w-[1240px] gap-4 md:grid-cols-3">
            {bottomCards.map((module) => (
              <button
                key={module.id}
                onClick={() => onSelect(module.defaultTab)}
                aria-label={module.label}
                className="group relative aspect-[1168/784] overflow-hidden rounded-xl border border-teal-100/15 bg-[#07100f] transition-all hover:-translate-y-0.5 hover:border-teal-100/35"
              >
                <img
                  src={module.card?.poster}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                />
                {module.card?.video ? (
                  <video
                    className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-100"
                    src={module.card.video}
                    poster={module.card.poster}
                    muted
                    loop
                    playsInline
                    autoPlay
                  />
                ) : null}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
