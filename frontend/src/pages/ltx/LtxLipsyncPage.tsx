import { useState, useEffect } from 'react';
import { Upload, Play, Loader2, Volume2, Image as ImageIcon, Mic } from 'lucide-react';
import { BACKEND_API } from '../../config/api';
import { useToast } from '../../components/ui/Toast';
import { useComfyExecution } from '../../contexts/ComfyExecutionContext';
import { usePersistentState } from '../../hooks/usePersistentState';
import { WorkflowShell } from '../../components/layout/WorkflowShell';
import { WorkflowPreviewBar } from '../../components/layout/WorkflowPreviewBar';
import { WorkflowChat } from '../../components/ui/WorkflowChat';

const inputBase = 'w-full rounded-lg border border-white/10 bg-black/35 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-white/25 placeholder:text-zinc-600';
const smallLabel = 'text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500';
const panel = 'rounded-xl border border-white/10 bg-[#09090b] p-4 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]';

function comfyViewUrl(filename: string | null, type: 'input' | 'output' = 'input', subfolder = '') {
  if (!filename) return null;
  return `/comfy/view?filename=${encodeURIComponent(filename)}&subfolder=${encodeURIComponent(subfolder)}&type=${type}`;
}

export const LtxLipsyncPage = () => {
  const [image, setImage] = usePersistentState<string | null>('ltx_lipsync_image', null);
  const [imageName, setImageName] = usePersistentState<string | null>('ltx_lipsync_image_name', null);
  const [audio, setAudio] = usePersistentState<string | null>('ltx_lipsync_audio', null);
  const [audioName, setAudioName] = usePersistentState<string | null>('ltx_lipsync_audio_name', null);

  const [audioStart, setAudioStart] = usePersistentState('ltx_lipsync_audio_start', 0);
  const [audioDur, setAudioDur] = usePersistentState('ltx_lipsync_audio_dur', 15);

  const [prompt, setPrompt] = usePersistentState('ltx_lipsync_prompt', 'woman singing, expressive performance');
  const [negative, setNegative] = usePersistentState('ltx_lipsync_negative', 'blurry, low quality, still frame, frames, watermark, overlay, titles, has blurbox, has subtitles');

  const [seed, setSeed] = usePersistentState('ltx_lipsync_seed', -1);
  const [cfg, setCfg] = usePersistentState('ltx_lipsync_cfg', 1.0);
  const [loraStrength, setLoraStrength] = usePersistentState('ltx_lipsync_lora', 0.7);

  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pendingPromptId, setPendingPromptId] = useState<string | null>(null);
  const [currentVideo, setCurrentVideo] = usePersistentState<string | null>('ltx_lipsync_current', null);
  const [_history, setHistory] = usePersistentState<string[]>('ltx_lipsync_history', []);

  // Text-to-Audio (local Fish Speech - fast + high quality realistic voices)
  const [ttsText, setTtsText] = usePersistentState('ltx_lipsync_tts_text', '');
  const [fishModels, setFishModels] = useState<Array<{name: string; path?: string}>>([]);
  const [selectedFishModel, setSelectedFishModel] = usePersistentState<string>('ltx_lipsync_fish_model', '');
  const [isGeneratingTts, setIsGeneratingTts] = useState(false);

  // Download more Fish voices helper
  const [recommendedVoices, setRecommendedVoices] = useState<Array<{model: string; label: string; desc: string; downloaded: boolean}>>([]);
  const [downloadingVoice, setDownloadingVoice] = useState<string | null>(null);

  const { toast } = useToast();
  const { state: execState, lastOutputVideos, registerNodeMap } = useComfyExecution();

  const workflowId = 'ltx-lipsync';

  const uploadFile = async (file: File, type: 'image' | 'audio') => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'input');

      const res = await fetch(`${BACKEND_API.BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (!data.success) throw new Error(data.detail || 'Upload failed');

      const filename = data.filename || data.name;

      if (type === 'image') {
        setImage(filename);
        setImageName(file.name);
      } else {
        setAudio(filename);
        setAudioName(file.name);
      }

      toast(type + ' uploaded: ' + file.name);
    } catch (e: any) {
      toast('Upload failed: ' + String(e?.message || e));
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file, 'image');
  };

  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file, 'audio');
  };

  // Load available Fish Speech models (fast, realistic local TTS with tons of community voices)
  const loadFishModels = async () => {
    try {
      const res = await fetch(`${BACKEND_API.BASE_URL}${BACKEND_API.ENDPOINTS.CHAT_FISH_MODELS}`);
      const data = await res.json();
      if (data?.success && Array.isArray(data.models)) {
        const models = data.models.map((m: any) => typeof m === 'string' ? { name: m } : m);
        setFishModels(models);
        if (!selectedFishModel && models.length > 0) {
          // Prefer a good default if available
          const preferred = models.find((m: any) => /fish|base|1\.4|1\.5|default/i.test(m.name || '')) || models[0];
          setSelectedFishModel(preferred.name || preferred);
        }
      }
      // Also load recommended when refreshing models
      loadRecommendedVoices();
    } catch (e) {
      // silent
    }
  };

  // Expose a way for UI to know if Fish TTS is ready
  const fishTtsReady = fishModels.length > 0;

  const loadRecommendedVoices = async () => {
    try {
      const res = await fetch(`${BACKEND_API.BASE_URL}${BACKEND_API.ENDPOINTS.CHAT_FISH_RECOMMENDED}`);
      const data = await res.json();
      if (data?.success && Array.isArray(data.recommended)) {
        setRecommendedVoices(data.recommended);
      }
    } catch (e) {
      // optional helper, fail silently
    }
  };

  useEffect(() => {
    loadFishModels();
    loadRecommendedVoices();
  }, []);

  const generateTts = async () => {
    const text = ttsText.trim();
    if (!text) {
      toast('Enter the text/dialogue you want spoken');
      return;
    }
    if (!fishTtsReady) {
      toast('Fish TTS is not available — install the ComfyUI-FishAudioS2 node first (see instructions above).');
      return;
    }
    setIsGeneratingTts(true);
    try {
      const payload: any = {
        text,
        tts_engine: 'fish',
        voice_name: selectedFishModel || 'default',
        model_path: selectedFishModel || undefined,
      };

      const res = await fetch(`${BACKEND_API.BASE_URL}${BACKEND_API.ENDPOINTS.CHAT_TTS}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!data?.success) {
        const errMsg = data?.error || 'TTS generation failed';
        const help = data?.help ? `\n\n${data.help}` : '';
        throw new Error(errMsg + help);
      }

      // The response contains the generated audio info
      const audioInfo = data.audio || {};
      const filename = audioInfo.filename || data.filename;
      if (filename) {
        setAudio(filename);
        setAudioName(`TTS: ${text.slice(0, 50)}${text.length > 50 ? '...' : ''}`);
        toast('Audio generated with Fish Speech and loaded for lipsync!');
      } else if (data.audio_url) {
        // Fallback: at least give visual feedback
        toast('TTS audio generated (check ComfyUI output folder if not auto-loaded)');
      }
    } catch (e: any) {
      const msg = e?.message || 'Unknown error';
      // If backend returned structured error with help, show it
      toast('Text-to-audio failed: ' + msg);
    } finally {
      setIsGeneratingTts(false);
    }
  };

  const downloadFishVoice = async (model: string) => {
    setDownloadingVoice(model);
    try {
      const res = await fetch(`${BACKEND_API.BASE_URL}${BACKEND_API.ENDPOINTS.CHAT_FISH_DOWNLOAD}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model_path: model }),
      });
      const data = await res.json();
      if (data?.success) {
        toast(`Download started for ${model}. This can take 1-5 minutes (check ComfyUI console for progress).`);
        // Refresh lists after a delay (download is async in Comfy)
        setTimeout(() => {
          loadFishModels();
          loadRecommendedVoices();
        }, 8000);
      } else {
        toast(`Download request failed: ${data?.error || 'Unknown error'}`);
      }
    } catch (e: any) {
      toast('Download failed: ' + (e?.message || e));
    } finally {
      setDownloadingVoice(null);
    }
  };

  const generate = async () => {
    if (!image || !audio) {
      toast('Missing inputs: Upload a reference image and driving audio first.');
      return;
    }

    setIsGenerating(true);
    setPendingPromptId(null);

    try {
      const payload: any = {
        image,
        audio,
        audio_start_time: audioStart,
        audio_duration: audioDur,
        prompt,
        negative,
        seed: seed === -1 ? Math.floor(Math.random() * 1e10) : seed,
        cfg,
        lora_strength: loraStrength,
      };

      const res = await fetch(`${BACKEND_API.BASE_URL}${BACKEND_API.ENDPOINTS.GENERATE}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflow_id: workflowId, params: payload }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.detail || 'Generation request failed');

      const promptId = data.prompt_id;
      setPendingPromptId(promptId);
      registerNodeMap(promptId);

      toast('Started: LTX Lipsync generation running...');
    } catch (e: any) {
      setIsGenerating(false);
      toast('Start failed: ' + String(e?.message || e));
    }
  };

  // Auto-collect video output
  if (pendingPromptId && lastOutputVideos && lastOutputVideos.length && execState === 'done') {
    const latest = lastOutputVideos[lastOutputVideos.length - 1];
    const url = `/comfy/view?filename=${encodeURIComponent(latest.filename)}&subfolder=${encodeURIComponent(latest.subfolder || '')}&type=${latest.type || 'output'}`;
    if (url !== currentVideo) {
      setCurrentVideo(url);
      setHistory((prev) => [url, ...prev.filter((u) => u !== url)].slice(0, 20));
      setIsGenerating(false);
      setPendingPromptId(null);
    }
  }

  if (execState === 'error' && pendingPromptId) {
    setIsGenerating(false);
    setPendingPromptId(null);
    toast('Generation error - check ComfyUI logs.');
  }

  const imagePreview = image ? comfyViewUrl(image, 'input') : null;
  // Audio can be uploaded (input) or freshly generated by TTS (usually output)
  const getAudioPreviewUrl = (filename: string | null) => {
    if (!filename) return null;
    // Try input first (uploads), fall back to output (TTS generations)
    return comfyViewUrl(filename, 'input') || comfyViewUrl(filename, 'output');
  };
  const audioPreview = getAudioPreviewUrl(audio);

  const outputVideo = currentVideo ? (
    <div className="space-y-2">
      <video src={currentVideo} controls className="w-full rounded border border-white/10" />
      <a href={currentVideo} target="_blank" className="text-xs text-zinc-400 hover:text-white">Open video in new tab</a>
    </div>
  ) : null;

  return (
    <WorkflowShell
      title="LTX 2.3 Lipsync"
      description="Image + audio driven lipsync / talking head video"
      output={outputVideo}
      hideOutputPane={!currentVideo}
    >
      <WorkflowPreviewBar
        title="Recent Lipsyncs"
        images={_history}
        currentImage={currentVideo}
        onSelectImage={(url) => setCurrentVideo(url)}
        emptyHint="Generate a lipsync to see previews here."
      />

      <div className="space-y-6 max-w-3xl">
        {/* Reference Image */}
        <div className={panel}>
          <div className="mb-3 flex items-center gap-2">
            <ImageIcon className="h-4 w-4" />
            <span className={smallLabel}>Reference Image (the person)</span>
          </div>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-black/40 p-4 transition hover:border-white/30">
            <Upload className="h-5 w-5" />
            <div className="text-sm">Upload reference image</div>
            <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
          </label>
          {imageName && <div className="mt-1 text-xs text-emerald-400">Loaded: {imageName}</div>}

          {imagePreview && (
            <div className="mt-3">
              <div className={smallLabel}>Preview</div>
              <img src={imagePreview} alt="Reference preview" className="mt-1 max-h-48 rounded border border-white/10 object-contain" />
            </div>
          )}
        </div>

        {/* Driving Audio + Edit */}
        <div className={panel}>
          <div className="mb-3 flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            <span className={smallLabel}>Driving Audio (speech / singing)</span>
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-black/40 p-4 transition hover:border-white/30">
            <Upload className="h-5 w-5" />
            <div className="text-sm">Upload audio file (MP3 / WAV recommended)</div>
            <input type="file" accept="audio/*" onChange={handleAudioSelect} className="hidden" />
          </label>
          {audioName && <div className="mt-1 text-xs text-emerald-400">Loaded: {audioName}</div>}

          {audioPreview && (
            <div className="mt-3">
              <div className={smallLabel}>Preview Audio</div>
              <audio controls src={audioPreview} className="mt-1 w-full" />
            </div>
          )}

          {/* Text to Audio - using local Fish Speech (fast + very realistic, great character voices) */}
          <div className="mt-4 border-t border-white/10 pt-4">
            <div className="mb-2 flex items-center gap-2">
              <Mic className="h-4 w-4" />
              <span className={smallLabel}>Text → Audio (local Fish Speech)</span>
            </div>

            {!fishTtsReady && (
              <div className="mb-3 rounded-lg border border-amber-500/30 bg-amber-950/20 p-3 text-xs text-amber-300">
                <div className="font-semibold mb-1">Fish TTS node not detected</div>
                <div className="mb-2">
                  The ComfyUI-FishAudioS2 custom node is required for local text-to-speech.
                  It provides the FishS2TTS model options.
                </div>
                <div className="font-mono text-[10px] bg-black/40 p-2 rounded">
                  1. Stop ComfyUI<br />
                  2. cd ComfyUI/custom_nodes<br />
                  3. git clone https://github.com/Saganaki22/ComfyUI-FishAudioS2.git<br />
                  4. (optional) pip install -r ComfyUI-FishAudioS2/requirements.txt<br />
                  5. Restart ComfyUI completely<br />
                  6. Click "Refresh models" below
                </div>
                <button
                  onClick={() => { loadFishModels(); loadRecommendedVoices(); }}
                  className="mt-2 text-xs underline hover:no-underline"
                >
                  Refresh models / check again
                </button>
              </div>
            )}

            <p className="mb-2 text-[10px] text-zinc-500">
              Fast, high-quality local TTS. Community voices include expressive/cartoon/character styles (Shrek, Fiona, various "shades" etc. are common in Fish model packs).
            </p>

            {fishTtsReady && (
              <>
                <textarea
                  value={ttsText}
                  onChange={(e) => setTtsText(e.target.value)}
                  className={inputBase}
                  rows={2}
                  placeholder="Hello... I've been waiting for you. Say it with a low, breathy voice."
                />

                {fishModels.length > 0 && (
                  <div className="mt-2">
                    <div className={smallLabel}>Fish Model / Voice</div>
                    <select
                      value={selectedFishModel}
                      onChange={(e) => setSelectedFishModel(e.target.value)}
                      className={inputBase}
                    >
                      {fishModels.map((m, i) => (
                        <option key={i} value={m.name || m}>
                          {m.name || m}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}

            {/* Download more Fish voices helper / quick list */}
            {recommendedVoices.length > 0 && (
              <div className="mt-3 border border-white/10 rounded-lg p-3 bg-black/20">
                <div className="flex items-center justify-between mb-2">
                  <span className={smallLabel}>Download more Fish voices</span>
                  <button
                    onClick={() => { loadFishModels(); loadRecommendedVoices(); }}
                    className="text-[10px] text-zinc-400 hover:text-white underline"
                  >
                    Refresh list
                  </button>
                </div>
                <div className="space-y-1.5 text-xs">
                  {recommendedVoices.map((v, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 rounded bg-white/5 px-2 py-1">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{v.label}</div>
                        <div className="text-[10px] text-zinc-500 truncate">{v.desc}</div>
                      </div>
                      {v.downloaded ? (
                        <span className="text-emerald-400 text-[10px] px-2 py-0.5 rounded bg-emerald-950/50">Downloaded</span>
                      ) : (
                        <button
                          onClick={() => downloadFishVoice(v.model)}
                          disabled={!!downloadingVoice}
                          className="shrink-0 rounded bg-white/10 px-2.5 py-0.5 text-[10px] hover:bg-white/20 disabled:opacity-50"
                        >
                          {downloadingVoice === v.model ? "Downloading..." : "Download"}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-[10px] text-zinc-500">
                  Base models first. Many Shrek/Fiona/expressive "shades" &amp; character voices are community fine-tunes on top of these (search Civitai/HF for "fish speech [character]").
                  Downloads run via ComfyUI — watch the console for progress (can take minutes).
                </p>
              </div>
            )}

            {fishTtsReady && (
              <>
                <button
                  onClick={generateTts}
                  disabled={isGeneratingTts || !ttsText.trim()}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 py-2 text-sm font-medium transition hover:bg-white/10 disabled:opacity-50"
                >
                  {isGeneratingTts ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Generating speech with Fish...</>
                  ) : (
                    <>Generate Audio from Text</>
                  )}
                </button>
                <p className="mt-1 text-[10px] text-zinc-500">Generated audio will be set as the driving audio for lipsync above.</p>
              </>
            )}
          </div>

          {/* Audio Editing */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <div className={smallLabel}>Start Time (seconds)</div>
              <input
                type="number"
                step="0.1"
                min="0"
                value={audioStart}
                onChange={(e) => setAudioStart(parseFloat(e.target.value) || 0)}
                className={inputBase}
              />
            </div>
            <div>
              <div className={smallLabel}>Duration (seconds)</div>
              <input
                type="number"
                step="0.1"
                min="1"
                value={audioDur}
                onChange={(e) => setAudioDur(parseFloat(e.target.value) || 5)}
                className={inputBase}
              />
            </div>
          </div>
          <p className="mt-1 text-[10px] text-zinc-500">Trim the audio for the exact lipsync segment (maps to VHS_LoadAudioUpload).</p>
        </div>

        {/* Prompts */}
        <div className={panel}>
          <div className="mb-3">
            <span className={smallLabel}>Positive Prompt</span>
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className={inputBase}
            rows={3}
            placeholder="woman singing, expressive performance, clear lip movements..."
          />

          <div className="mt-4 mb-3">
            <span className={smallLabel}>Negative Prompt</span>
          </div>
          <textarea
            value={negative}
            onChange={(e) => setNegative(e.target.value)}
            className={inputBase}
            rows={2}
          />
        </div>

        {/* Advanced conversation for this lipsync card — freeform thoughts, persistent memory, apply suggestions */}
        <WorkflowChat
          workflowId={workflowId}
          context="ltx-lipsync"
          accent="sky"
          currentPrompt={prompt}
          currentSettings={{ cfg, seed, loraStrength, audioStart, audioDur }}
          onApplyPrompt={(text) => setPrompt(text)}
          compact
          className="mt-1"
        />

        {/* Advanced Controls */}
        <div className={panel}>
          <div className="mb-3">
            <span className={smallLabel}>Generation Controls</span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <div className={smallLabel}>Seed (-1 = random)</div>
              <input type="number" value={seed} onChange={(e) => setSeed(parseInt(e.target.value) || -1)} className={inputBase} />
            </div>
            <div>
              <div className={smallLabel}>CFG</div>
              <input type="number" step="0.1" value={cfg} onChange={(e) => setCfg(parseFloat(e.target.value) || 1)} className={inputBase} />
            </div>
            <div>
              <div className={smallLabel}>Distilled LoRA Strength</div>
              <input type="number" step="0.1" min="0" max="2" value={loraStrength} onChange={(e) => setLoraStrength(parseFloat(e.target.value) || 0.7)} className={inputBase} />
            </div>
          </div>
        </div>

        <button
          onClick={generate}
          disabled={isGenerating || isUploading || !image || !audio}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-semibold text-black transition active:scale-[0.985] disabled:opacity-60"
        >
          {isGenerating ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Generating LTX lipsync video...</>
          ) : (
            <><Play className="h-4 w-4" /> Generate LTX 2.3 Lipsync Video</>
          )}
        </button>

        <p className="text-[10px] text-zinc-500">
          The workflow includes its own HF downloader for all required LTX models and audio VAE. Audio trimming (start/duration) is applied inside the workflow.
        </p>
      </div>
    </WorkflowShell>
  );
};
