# FEDDA v16 Workflow Audit Checklist

Purpose: walk every active FEDDA workflow one by one, confirm whether it works, capture exact failure modes, and reuse common fixes instead of rediscovering them per page.

Status legend:

- `Not started` - not tested in this audit pass yet.
- `Works` - generated usable output through FEDDA UI.
- `Partial` - queues/runs but UI, quality, preview, model, or node issues remain.
- `Blocked` - cannot run because of missing node/model/runtime issue.
- `Needs redesign` - workflow may run, but UI is too confusing or inconsistent.

## Audit Rules

- Test from the FEDDA UI first, not native ComfyUI only.
- For every workflow, record:
  - UI route/card
  - workflow id
  - whether model preflight is clear
  - whether missing custom nodes are clearly reported
  - whether generation queues
  - whether ComfyUI produces output
  - whether FEDDA preview/history shows output
  - whether Gallery sees output
  - whether params are injected into the expected workflow nodes
- If native ComfyUI works but FEDDA UI fails, treat it as a UI/backend mapping issue, not a model issue.
- If output lands in a nested ComfyUI output folder but UI does not show it, check output discovery/copy/view URL handling.
- If multiple workflows fail the same way, add it to `Common Fix Patterns`.

## Core / System Pages

| # | Page | Route / tab | Status | Notes |
|---|------|-------------|--------|-------|
| 1 | Image Studio | `image` | Partial | Card/menu works. Needs final consistency review after workflow pages settle. |
| 2 | Video Studio | `video` | Partial | Card/menu works. Needs final consistency review after video workflow pages settle. |
| 3 | Gallery | `gallery` | Partial | Unified images/videos exists. Needs output-source audit per workflow. |
| 4 | LoRA & Character | `library` | Not started | Needs install/import/delete/download smoke test. |
| 5 | Ollama Models | `ollama` | Partial | Page exists. Ollama resolver/model selection was recently improved in backend; test pull/delete/list. |

## Image Workflows

| # | Card | UI route / tab | Workflow id(s) | Status | Known state / next check |
|---|------|----------------|----------------|--------|--------------------------|
| 6 | Z-Image Txt2Img | `z-image-txt2img` | `z-image` | Works / UI golden sample | User confirmed it works very well. UI now uses `SimpleImageCockpit`, full-width shell, top preview bar, no right output pane, and hash route `#/tab/z-image-txt2img`. Re-test actual generation preview/history after the cockpit pass. |
| 7 | Z-Image Dual LoRA | `z-image-dual-lora` | `z-image-dual-lora` | Works | User confirmed the single-run FEDDA UI now works well. Current baseline uses Person 1/Person 2 LoRAs, gender-aware left/right detection phrase, prompts, and seed in one run. Advanced mask/bbox control can be revisited later. |
| 8 | Chroma1-HD | `chroma-txt2img` | `chroma1-hd-txt2img` | Partial | Runs were producing strange/poor images. Needs workflow/settings comparison, CFG/steps sanity, possibly alternate official Chroma workflow. Do not claim quality yet. |
| 9 | Chroma Simple | `chroma-simple-txt2img` | `chroma-simple-txt2img` | Partial | Added for comparison. Needs side-by-side test against Chroma1-HD. |
| 10 | FLUX2-KLEIN | `flux-txt2img` | `flux2klein-txt2img` | Works / Optimize | User confirmed Klein LoRA works on latest runs. Current better baseline: around 8 steps and CFG 1.2. Backend rgthree LoRA verification passes, selected LoRA is visible in UI, and Character / Trigger field helps LoRA binding. Next pass: tune defaults and Ollama prompt help. |
| 11 | FireRed Edit | `firered-image-edit` | `firered-image-edit` | Works | User confirmed it works from the FEDDA UI after the latest UI/output passes. Keep on polish list only for layout consistency. |
| 12 | Qwen Image | `qwen-txt2img` | `qwen-edit-2512` | Hidden / Parked | Workflow JSON exists, but this is not a useful dedicated Qwen Txt2Img baseline. Hidden from cards/sidebar and removed from the active Qwen module workflow list. Direct `qwen-txt2img` route falls back to Qwen Reference. |
| 13 | Qwen Reference | `qwen-image-ref` | `qwen-edit-2509-image-reference` | Partial / Retest needed | Same prompt-helper dependency removed preemptively; prompt now maps directly to `TextEncodeQwenImageEditPlus` node `10.prompt`. Needs reference upload smoke test. |
| 14 | Qwen Rapid Edit | `qwen-rapid-edit-v23` | `qwen-rapid-edit-v23` | Works | User confirmed it works from the FEDDA UI. Earlier nested-output preview issue appears resolved. |
| 15 | Qwen Multi Angle | `qwen-multi-angle` | `qwen-multi-angles`, `qwen-multi-angles-fast` | Works / Needs polish | User confirmed it generates images. Latest pass registers Comfy node-map/client id for top progress, removes lower duplicate output preview, and locks zoom to safer `3-8` range. Continue UI/quality polish. |

## Video Workflows

| # | Card | UI route / tab | Workflow id(s) | Status | Known state / next check |
|---|------|----------------|----------------|--------|--------------------------|
| 16 | WAN 2.2 Img2Vid | `wan22-img2vid` | `wan22-img2vid` | Not started | Needs upload, queue, model/node preflight, output video preview. |
| 17 | WAN 2.2 Vid2Vid | `wan22-vid2vid` | `wan22-vid2vid` | Not started | Needs video upload, queue, output preview. |
| 18 | WAN Story | `wan22-img2vid-6frames` | `wan22-img2vid-6frames` | Not started | Needs multi-frame upload/order test and payload injection check. |
| 19 | Steady Dancer | `wan21-steady-dancer` | `wan21-steady-dancer`, `z-image-controlnet-pose` | Works | Complex but solid staged builder (motion trim + capture + optional Z-Image character pose approval + final transfer). Backend has strong preflight + filename injection verification. UI now surfaces live node progress, has one-click skip-pose, full reset, and hardened downstream clears. Long GGUF run benefits from the ComfyExecution live node/%. |
| 20 | LTX Img2Vid | `ltx-img2vid` | `ltx-img2vid` | Works | User confirmed it works from the FEDDA UI. Added `Build From Reference` Ollama helper for image-to-motion prompt drafting. |
| 21 | LTX First / Last | `ltx-flf` | `ltx-flf` | Works | User confirmed LTX First / Last works after the KJNodes LTX audio VAE patch. |

## Supporting / Hidden Workflow Assets

| Workflow / file | Status | Notes |
|-----------------|--------|-------|
| `z-image-controlnet-pose` | Partial | Used by Steady Dancer pose stage. Needs LoRA injection + captured-frame usage verification. |
| `HF-downloader/HFdownloadernode.json` | Important | Reusable HF downloader node template. Use for future workflows when model links are known. |
| `Influencer/*` | Not active | Existing workflow files, not currently wired in active registry. Audit later if re-enabled. |
| `other/REMOVE-BG.json` | Not active | Existing workflow file, not currently wired in active registry. Audit later if re-enabled. |

## Common Fix Patterns

### 1. Output Exists In ComfyUI But Not FEDDA UI

Symptoms:

- ComfyUI output folder contains generated image/video.
- FEDDA preview/history stays empty.
- Output may be under nested folders like `IMAGE/QWEN-RAPID` or `IMAGE/Z-IMAGE`.

Check:

- `/api/generate/status/{prompt_id}?workflow_id=...`
- workflow output prefix mapping
- `comfyService.getImageUrl`
- backend output discovery for nested `subfolder`
- whether generated output must be copied from `output` to `input` for a later staged workflow

Reusable fix:

- Preserve filename + subfolder + type from ComfyUI history.
- Return correct `images` / `videos` in status response.
- Use `/comfy/view?filename=...&subfolder=...&type=output`.

### 2. Native ComfyUI Works, FEDDA UI Does Not

Symptoms:

- Direct workflow in ComfyUI generates.
- FEDDA queues wrong image/video/prompt/LoRA or uses stale files.

Check:

- `config/workflow_api.json` node IDs and input keys.
- `backend/workflow_service.py` payload injection.
- browser state/localStorage stale filenames.
- final UI preview filename matches backend-injected filename.

Reusable fix:

- Add payload verification log for critical inputs.
- Fail before queueing if referenced ComfyUI input file does not exist.
- Reset stale staged state when source image/video changes.

### 3. Missing Custom Node

Symptoms:

- ComfyUI says `Node '...' not found`.

Check:

- `config/nodes.json`
- `config/modules.json`
- `scripts/module_nodes.ps1`
- module ownership for workflow.
- whether node pack import fails after install due dependency mismatch.

Reusable fix:

- Add custom node repo to module manifest.
- Add install patch if custom node import is broken by dependency version.
- Restart ComfyUI after node install/patch.

### 4. Model Downloader vs Hard Preflight

Symptoms:

- UI blocks because model is missing.
- Workflow contains `HuggingFaceDownloader` node that could download it.

Check:

- whether model is workflow-owned and public.
- whether HF token is required.
- whether preflight should be warning-only or blocking.

Reusable fix:

- If workflow has reliable downloader nodes, show missing model status but allow queue.
- If model requires license/token or downloader cannot resolve it, block with exact path/link.

### 5. UI Layout Is Fighting The Workflow

Symptoms:

- huge boxes
- duplicated preview zones
- right output pane used even though top preview exists
- controls hidden below fold unnecessarily

Reusable fix:

- Simple image workflows: full-width `WorkflowShell` with `hideOutputPane`.
- Simple image workflows: shared `SimpleImageCockpit` under `WorkflowPreviewBar`; no quick-preset block and no right output pane.
- Complex staged workflows: `WorkflowWorkbench`.
- Top preview: `WorkflowPreviewBar`.
- Right/large preview only for masking, comparison, staged approval, or video.

## Suggested Audit Order

1. Z-Image Txt2Img
2. FireRed Edit
3. Qwen Rapid Edit
4. Qwen Multi Angle
5. Z-Image Dual LoRA
6. Qwen Image
7. Qwen Reference
8. Chroma Simple
9. Chroma1-HD
10. FLUX2-KLEIN
11. LTX Img2Vid
12. LTX First / Last
13. WAN 2.2 Img2Vid
14. WAN 2.2 Vid2Vid
15. WAN Story
16. Steady Dancer

## Per-Workflow Audit Template

Copy this block under the relevant workflow when testing:

```text
Date:
Tester:
Install path:
Workflow:
UI route:
Input files:
Prompt/settings:
Queued successfully: yes/no
ComfyUI output exists: yes/no
FEDDA preview shows output: yes/no
Gallery shows output: yes/no
Missing nodes:
Missing models:
Console error:
Quality notes:
Fix needed:
Reusable pattern:
Final status:
```
