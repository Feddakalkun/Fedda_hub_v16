import { useEffect, useRef, useState } from 'react';
import { Loader2, Play, RefreshCw, Upload } from 'lucide-react';
import { PromptAssistant } from '../../components/ui/PromptAssistant';
import { LoraSelector } from '../../components/ui/LoraSelector';
import { useToast } from '../../components/ui/Toast';
import { BACKEND_API } from '../../config/api';
import { usePersistentState } from '../../hooks/usePersistentState';
import { useWorkflowRun } from '../../hooks/useWorkflowRun';
import { comfyService } from '../../services/comfyService';
import { FeddaButton, FeddaSectionTitle } from '../../components/ui/FeddaPrimitives';
import { WorkflowWorkbench } from '../../components/layout/WorkflowWorkbench';
import { WorkflowVideoPreviewStrip } from '../../components/layout/WorkflowVideoPreviewStrip';

function RefImageSlot({ preview, uploading, onFile }: {
  preview: string | null;
  uploading: boolean;
  onFile: (file: File) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div
      onClick={() => ref.current?.click()}
      onDrop={(event) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        if (file?.type.startsWith('image/')) onFile(file);
      }}
      onDragOver={(event) => event.preventDefault()}
      className={`relative cursor-pointer overflow-hidden rounded-xl border border-dashed transition-all group ${
        preview ? 'border-zinc-500/40 bg-black/40' : 'border-white/[0.08] bg-white/[0.02] hover:border-white/25'
      }`}
      style={{ height: 220 }}
    >
      {preview ? (
        <>
          <img src={preview} alt="Reference" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-all group-hover:opacity-100">
            <span className="text-[8px] font-black uppercase tracking-widest text-white/70">Replace reference</span>
          </div>
        </>
      ) : (
        <div className="flex h-full flex-col items-center justify-center gap-2">
          {uploading ? <Loader2 className="h-6 w-6 animate-spin text-white/45" /> : <Upload className="h-6 w-6 text-white/15" />}
          <span className="text-[10px] font-black uppercase tracking-widest text-white/25">
            {uploading ? 'Uploading...' : 'Reference Image'}
          </span>
          <span className="text-[9px] text-white/[0.12]">Click or drop jpg/png</span>
        </div>
      )}
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => event.target.files?.[0] && onFile(event.target.files[0])}
      />
    </div>
  );
}

export const LtxImg2VidPage = () => {
  const [prompt, setPrompt] = usePersistentState('ltx_img2vid_prompt', '');
  const [negative, setNegative] = usePersistentState('ltx_img2vid_negative', 'blurry, low quality, deformed, jitter, artifacts');
  const [seed, setSeed] = usePersistentState('ltx_img2vid_seed', -1);
  const [loraName, setLoraName] = usePersistentState('ltx_img2vid_lora_name', '');
  const [loraStrength, setLoraStrength] = usePersistentState('ltx_img2vid_lora_strength', 0.65);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [imageFilename, setImageFilename] = usePersistentState<string | null>('ltx_img2vid_image_file', null);
  const [imageUploading, setImageUploading] = useState(false);
  const [availableLoras, setAvailableLoras] = useState<string[]>([]);

  const { toast } = useToast();
  const run = useWorkflowRun({
    workflowId: 'ltx-img2vid',
    currentKey: 'ltx_img2vid_current_video',
    historyKey: 'ltx_img2vid_history',
    outputKind: 'video',
    readyMessage: 'Video ready',
  });

  const imagePreview = imageFilename ? `/comfy/view?filename=${encodeURIComponent(imageFilename)}&type=input` : null;

  useEffect(() => {
    comfyService.getLoras().then((loras) => {
      const filtered = loras.filter((lora) => {
        const normalized = lora.replace(/\\/g, '/').toLowerCase();
        return normalized.startsWith('ltx/') || normalized.includes('ltx');
      });
      setAvailableLoras(filtered);
    }).catch(() => {});
  }, []);

  const uploadImage = async (file: File) => {
    setImageUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const response = await fetch(`${BACKEND_API.BASE_URL}/api/upload`, { method: 'POST', body: form });
      const data = await response.json();
      if (!data.success) throw new Error(data.detail || 'Upload failed');
      setImageFilename(data.filename);
    } catch (err: any) {
      toast(err.message || 'Upload failed', 'error');
    } finally {
      setImageUploading(false);
    }
  };

  const handleGenerate = () => {
    if (!imageFilename || !prompt.trim() || run.isGenerating) return;
    run.start({
      image: imageFilename,
      prompt: prompt.trim(),
      negative: negative.trim(),
      seed: seed === -1 ? Math.floor(Math.random() * 10_000_000_000) : seed,
      ...(loraName ? { lora_name: loraName, lora_strength: loraStrength } : {}),
    });
  };

  const canGenerate = !!imageFilename && !!prompt.trim() && !run.isGenerating;

  return (
    <WorkflowWorkbench
      title="LTX Img2Vid"
      eyebrow="LTX Video 2.3"
      description="Animate one reference image into a cinematic motion clip."
      icon={Play}
      isGenerating={run.isGenerating}
      canGenerate={canGenerate}
      preview={(
        <WorkflowVideoPreviewStrip
          currentVideo={run.currentMedia}
          history={run.history}
          onSelectVideo={run.setCurrentMedia}
          isGenerating={run.isGenerating}
          title="LTX Img2Vid Output"
          emptyHint="Upload an image and generate to see motion results here."
        />
      )}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(280px,420px)_minmax(0,1fr)]">
        <section className="workflow-section">
          <div className="workflow-section-header">
            <FeddaSectionTitle className="text-white/30">Reference Image</FeddaSectionTitle>
          </div>
          <RefImageSlot preview={imagePreview} uploading={imageUploading} onFile={uploadImage} />
          {imageFilename && <p className="mt-2 truncate font-mono text-[8px] text-white/35">{imageFilename}</p>}
        </section>

        <section className="workflow-section">
          <PromptAssistant
            context="ltx-flf"
            value={prompt}
            onChange={setPrompt}
            placeholder="Describe the motion, camera movement, and life you want in the video..."
            minRows={4}
            accent="violet"
            label="Motion Prompt"
            enableCaption
          />
        </section>
      </div>

      <section className="workflow-section">
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[8px] font-black uppercase tracking-widest text-white/25">Negative Prompt</p>
              <button
                onClick={() => setNegative('blurry, low quality, deformed, jitter, artifacts')}
                className="text-[8px] text-white/35 hover:text-white/70"
              >
                Reset
              </button>
            </div>
            <textarea
              value={negative}
              onChange={(event) => setNegative(event.target.value)}
              className="min-h-[88px] w-full resize-y rounded-lg border border-white/10 bg-black/40 p-3 text-sm text-white/80 focus:border-white/25 focus:outline-none"
              placeholder="Artifacts to avoid..."
            />
          </div>

          <div className="space-y-2">
            <FeddaSectionTitle className="text-white/30">LoRA</FeddaSectionTitle>
            <LoraSelector
              options={availableLoras}
              value={loraName}
              onChange={setLoraName}
              strength={loraStrength}
              onStrengthChange={setLoraStrength}
              accent="violet"
              label="LTX LoRA"
            />
            {loraName && (
              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-white/35">Strength</span>
                <input
                  type="range"
                  min={0}
                  max={1.5}
                  step={0.01}
                  value={loraStrength}
                  onChange={(event) => setLoraStrength(parseFloat(event.target.value))}
                  className="flex-1 accent-zinc-400"
                />
                <span className="w-10 text-right font-mono text-white/65">{loraStrength.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="workflow-section">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="mb-3 flex items-center gap-1 text-[10px] uppercase tracking-widest text-white/35 hover:text-white/70"
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced
          <RefreshCw className={`h-3 w-3 transition ${showAdvanced ? 'rotate-180' : ''}`} />
        </button>

        {showAdvanced && (
          <div>
            <p className="mb-1 text-[8px] font-black uppercase tracking-widest text-white/25">Seed (-1 = random)</p>
            <div className="flex gap-2">
              <input
                type="number"
                value={seed}
                onChange={(event) => setSeed(parseInt(event.target.value) || -1)}
                className="flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 font-mono text-sm text-white/80 focus:border-white/25 focus:outline-none"
              />
              <button onClick={() => setSeed(-1)} className="rounded-lg bg-white/5 px-3 py-2 text-xs hover:bg-white/10">
                Random
              </button>
            </div>
          </div>
        )}

        <div className="mt-4">
          <FeddaButton
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="h-11 w-full bg-zinc-200 text-base text-black hover:bg-white disabled:bg-white/10 disabled:text-white/30"
          >
            {run.isGenerating ? (
              <span className="flex items-center justify-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Generating...</span>
            ) : (
              <span className="flex items-center justify-center gap-2"><Play className="h-4 w-4" /> Generate Video</span>
            )}
          </FeddaButton>
          {!canGenerate && (
            <p className="mt-2 text-center text-[10px] text-white/25">Upload a reference image and enter a motion prompt</p>
          )}
        </div>
      </section>
    </WorkflowWorkbench>
  );
};
