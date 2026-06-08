# FEDDA Hub v16 Breadcrumbs

## 2026-06-05 - UI Consistency System Start

- Started the v16 workflow UI consistency pass.
- Added shared UI standard note:
  - `docs/v16/UI_SYSTEM_STANDARD.md`
- Added shared preview component:
  - `frontend/src/components/layout/WorkflowPreviewBar.tsx`
- Rewired `TopPreviewStrip` to wrap the shared preview component.
- Started moving `Txt2ImgPage`-based workflows toward the shared top preview pattern through `WorkflowShell.preview`.
- Removed the old duplicated inline preview strip from `Txt2ImgPage`.
- Set simple `Txt2ImgPage` workflows to `hideOutputPane`, so the right preview pane is not used when the top preview bar already covers recent/live output.
- Intent:
  - keep workflow pages visually consistent
  - reduce one-off preview strips and oversized panels
  - establish black/grey compact studio layout as the default

## 2026-06-05 - Workflow Audit Checklist

- Added workflow-by-workflow audit file:
  - `docs/v16/WORKFLOW_AUDIT_CHECKLIST.md`
- Captures active UI cards/routes, workflow ids, known status, known issues, common fix patterns, and suggested audit order.
- Intent:
  - test every workflow one by one
  - avoid rediscovering the same output/model/node/UI problems
  - leave a clear handoff trail for future agents

## 2026-06-02 - Workflow Standard Baseline

- Added a reusable workflow standard document:
  - `docs/v16/WORKFLOW_STANDARD.md`
- Added the reusable HuggingFace downloader node template to git:
  - `backend/workflows/HF-downloader/HFdownloadernode.json`
- Added a validator for new app-facing workflow mappings/files:
  - `dev_tools/validate_workflow_standard.py`
- Intent: future workflows, especially Chroma, should start from a consistent pattern:
  - workflow-owned `HuggingFaceDownloader` for model bootstrap
  - observable model status
  - no backend hard-block when the workflow can download its own models
  - stable `config/workflow_api.json` input mapping
  - module ownership through `config/modules.json`

## 2026-06-02 - Chroma1-HD Base Workflow

- Added first Chroma booster workflow:
  - `backend/workflows/chroma/chroma1-hd-txt2img-api.json`
- Added Chroma app mapping:
  - workflow id `chroma1-hd-txt2img`
  - model status via workflow-owned `HuggingFaceDownloader`
  - output prefix `IMAGE/CHROMA/0`
- Added Chroma module ownership:
  - `config/modules.json` module id `chroma-image`
- Added Chroma Image Studio entry:
  - `frontend/src/pages/chroma/ChromaTxt2Img.tsx`
  - `frontend/src/modules/registry.ts`
- First Chroma version intentionally has LoRA UI disabled until the correct Chroma LoRA loader path is tested.
- Verification:
  - `python dev_tools/validate_workflow_standard.py --workflow-id chroma1-hd-txt2img --require-downloader`
  - `python dev_tools/validate_workflow_standard.py --all`
  - `npm run build` in `frontend`
  - backend payload injection smoke test for prompt, negative, size, seed, steps, cfg, sampler, and output prefix.

## 2026-06-02 - Chroma Quality Defaults Fix

- Fixed first Chroma output quality issue caused by inheriting Z-Image's CFG lock.
- `Txt2ImgPage` now accepts workflow-specific defaults:
  - `defaultCfg`
  - `defaultNegative`
  - `quickModes`
  - `maxSteps`
- Chroma now defaults to README-style quality settings:
  - CFG `3.0`
  - steps `40`
  - stronger negative prompt
- Added a one-time browser storage migration for `chroma_txt2img` so earlier test values do not keep forcing weak defaults.
- Verification:
  - Chroma standard validator passed.
  - All workflow standard validation passed.
  - Chroma payload test confirmed CFG `3.0` and steps `40`.
  - Frontend build passed.

## 2026-06-02 - Chroma Weird Anatomy Tuning

- Observed Chroma generating strong organic/body-horror artifacts in wet/swamp prompts.
- Lowered Chroma default CFG from `2.2` to `1.7`.
- Added a compact CFG slider only for Chroma so quality can be tuned without code edits.
- Expanded Chroma negative prompt to discourage:
  - body horror
  - mutated creatures / extra animals
  - malformed arms/hands
  - fused anatomy / melted body
  - muddy skin artifacts
- Added a new `chroma_txt2img_quality_defaults_v3` localStorage migration so browsers that tested old Chroma settings reset to the safer defaults.


This file is the running trail for v16 modularization work. Add a new entry after every meaningful update so another agent can backtrack without guessing.

## 2026-06-01 23:31 Europe/Oslo

- Created safety backup before v16 work:
  - `H:\Fedda-Hub\backup\Fedda_hub_v15_repo_pre_v16_modules_20260601_233127`
- Created clean v16 repo working clone:
  - `H:\Fedda-Hub\Fedda_hub_v16\Fedda_hub_v16_repo`
  - `source-v15` remote points at local v15 source clone.
  - `origin` remote points at `https://github.com/Feddakalkun/Fedda_hub_v16`.
- Created v16 install test clone:
  - `H:\Fedda-Hub\Fedda_hub_v16\Fedda_hub_v16_install\app`
  - `source-v16-local` remote points at local v16 repo clone.
  - `origin` remote points at `https://github.com/Feddakalkun/Fedda_hub_v16`.

## 2026-06-01 23:40 Europe/Oslo

- Started first modular foundation pass.
- Added frontend module registry at `frontend/src/modules/registry.ts`.
- Moved home cards, image workflow cards, video workflow cards, valid tabs, app version label, and page metadata toward the registry.
- Updated `App.tsx`, `RichHome.tsx`, `ImageSectionCards.tsx`, and `VideoSectionCards.tsx` to consume registry data.
- Intent: modules can later be disabled or moved into booster packs without editing multiple unrelated UI files.

## 2026-06-01 23:47 Europe/Oslo

- Installed frontend dependencies in the v16 repo clone with `npm ci`.
- Ran `npm run build` in `frontend`; TypeScript and Vite build passed.
- NPM audit reported existing dependency issues: 3 moderate and 5 high. No dependency upgrades were made in this pass.

## 2026-06-01 23:52 Europe/Oslo

- Committed first v16 modular foundation:
  - `e6d01cc chore(v16): bootstrap modular foundation`
- Pushed `main` to `https://github.com/Feddakalkun/Fedda_hub_v16`.
- Pulled the same commit into the install test clone at `H:\Fedda-Hub\Fedda_hub_v16\Fedda_hub_v16_install\app`.
- Installed frontend dependencies in the install test clone with `npm ci`.
- Ran `npm run build` in the install test clone; TypeScript and Vite build passed.

## 2026-06-02 00:18 Europe/Oslo

- Added backend/shared module manifest:
  - `config/modules.json`
- Added module ownership loader:
  - `backend/module_service.py`
- Added module metadata to `/api/workflow/list` responses while preserving existing `id`, `name`, and `description` fields.
- Added module API endpoints:
  - `GET /api/modules`
  - `GET /api/modules/{module_id}`
  - `GET /api/modules/workflow/{workflow_id}`
- Current manifest groups workflows into:
  - `core-shell`
  - `z-image-studio`
  - `qwen-image`
  - `wan-video`
  - `ltx-video`
  - `flux-klein`
- Validation run:
  - `python -m py_compile backend\module_service.py backend\server.py`
  - Module manifest check found 6 modules and no missing workflow or custom node config references.

## 2026-06-02 00:34 Europe/Oslo

- Added module-aware custom node resolver:
  - `scripts/module_nodes.ps1`
- Updated installer/update paths to use the resolver when available:
  - `scripts/install_lite.ps1`
  - `scripts/install.ps1`
  - `scripts/update_logic.ps1`
- Behavior:
  - Reads `config/modules.json`.
  - Selects custom nodes referenced by enabled modules.
  - Falls back to full `config/nodes.json` if the manifest/helper cannot be read.
- Validation run:
  - Resolver selected 26 of 50 configured custom nodes from the current enabled modules.
  - `scripts/module_nodes.ps1`, `scripts/install_lite.ps1`, `scripts/install.ps1`, and `scripts/update_logic.ps1` all parsed cleanly with PowerShell parser.
- Updated `README.md` from v15 wording to v16 modular distribution wording.

## 2026-06-02 00:44 Europe/Oslo

- Added backend-manifest bridge metadata to frontend registry:
  - `frontend/src/modules/registry.ts`
- Each UI module/card now declares:
  - `sourceModuleId`
  - optional `workflows`
- Intent:
  - Keep detailed UI cards while still pointing each card back to the owning backend/install module.
  - Make later module toggles safer because frontend cards can be matched to `config/modules.json` ownership.
- Validation run:
  - `npm run build` in `frontend` passed.
  - `python -m py_compile backend\module_service.py backend\server.py` passed.
  - Vite still warns that the main JS chunk is larger than 500 kB; no code-splitting change was made in this pass.

## 2026-06-02 00:58 Europe/Oslo

- Fixed the one-click installer for v16:
  - `FEDDA_Installer.bat` now points to `https://github.com/Feddakalkun/Fedda_hub_v16`.
  - Added full standalone `FEDDA_v16_Installer.bat` in the repo.
  - Copied standalone test installer to `H:\Fedda-Hub\Fedda_hub_v16\FEDDA_v16_Installer.bat`.
  - Copied standalone test installer to `H:\Fedda-Hub\Fedda_hub_v16\Fedda_hub_v16_install\FEDDA_v16_Installer.bat`.
- Validation run:
  - Searched installer/readme files for stale `v15`, `Fedda_hub_v15`, and `FEDDA_v15`; no matches remained in checked files.
  - Confirmed installer text, log file, and repo URL now use v16.

## 2026-06-02 01:12 Europe/Oslo

- Started the shared workflow-page base pass.
- Added reusable workflow run hook:
  - `frontend/src/hooks/useWorkflowRun.ts`
- Added reusable v16 workflow layout pieces:
  - `frontend/src/components/layout/WorkflowWorkbench.tsx`
  - `frontend/src/components/layout/WorkflowVideoPreviewStrip.tsx`
- Added shared CSS for neutral black/grey workflow workbench and stable top video preview dimensions:
  - `frontend/src/index.css`
- Migrated first two workflow pages onto the new base:
  - `frontend/src/pages/ltx/LtxImg2VidPage.tsx`
  - `frontend/src/pages/ltx/LtxFlfPage.tsx`
- Kept LTX workflow payloads intentionally unchanged:
  - `ltx-img2vid`
  - `ltx-flf`
- Validation run:
  - `npm run build` in `frontend` passed.
  - Vite still warns that the main JS chunk is larger than 500 kB; no code-splitting change was made in this pass.
- Browser tooling was unavailable in this Codex turn, and no localhost dev server was running during validation.

## 2026-06-02 01:30 Europe/Oslo

- Fixed LTX custom node import failure after user hit:
  - `Node 'LTXV Img To Video Condition Only' not found`
- Root cause:
  - `ComfyUI-LTXVideo` was installed, but failed to import with Kornia 0.8.3 because `kornia.geometry.transform.pyramid` no longer exports `pad`.
  - ComfyUI therefore did not register any LTXVideo nodes.
- Added compatibility patch script:
  - `scripts/patch_ltxvideo_kornia.ps1`
- Wired the patch into:
  - `scripts/install_lite.ps1`
  - `scripts/install.ps1`
  - `scripts/update_logic.ps1`
- Applied the patch directly to the current install test app:
  - `H:\Fedda-Hub\Fedda_hub_v16\Fedda_hub_v16_install\app\ComfyUI\custom_nodes\ComfyUI-LTXVideo\pyramid_blending.py`
- Validation run:
  - PowerShell parser passed for all changed scripts.
  - Embedded Python import test passed for `ComfyUI-LTXVideo`.
  - Import test confirmed `LTXVImgToVideoConditionOnly` is registered in `NODE_CLASS_MAPPINGS`.
- Required manual follow-up:
  - Restart ComfyUI/app after applying the patch so ComfyUI reloads custom nodes.

## 2026-06-05 18:10 Europe/Oslo

- Started the FEDDA v16 UI Cockpit + Navigation pass.
- Added shared simple image cockpit base:
  - `frontend/src/components/workflows/SimpleImageCockpit.tsx`
- Rebuilt `ZImageTxt2Img` / shared `Txt2ImgPage` render path around the cockpit base:
  - prompt as the main top section
  - compact LoRA row
  - compact size/steps/CFG/seed/negative controls
  - no quick-preset block
  - no right output pane
  - top preview bar remains the only normal preview surface
- Added lightweight app hash navigation:
  - `#/home`
  - `#/image`
  - `#/video`
  - `#/tab/{workflow-tab}`
- Added real Back button next to Home in the app header.
- Validation:
  - `npm run build` passed in repo frontend.
  - Synced frontend source into v16 install-test and v17 staging.
  - `npm run build` passed in both synced frontend copies.
  - Browser DOM check confirmed `#/tab/z-image-txt2img` renders Back/Home, top preview bar, cockpit, and no visible right output pane.

## 2026-06-05 18:45 Europe/Oslo

- Continued the UI cockpit refinement after user pushed for less horizontal/sidebar layout and better LLM planning.
- Researched MemPalace and current LLM memory architecture sources.
- Added FEDDA-specific UI + LLM memory plan:
  - `docs/v16/UI_LLM_MEMORY_REDESIGN_PLAN.md`
- Updated UI standard with vertical task rhythm guidance:
  - prompt
  - LoRA/input
  - compact settings grid
  - generate
- Reworked `SimpleImageCockpit` again:
  - removed permanent side-column structure
  - changed to one vertical stack inside the cockpit frame
  - moved size/steps/CFG/seed/negative prompt into a compact responsive control grid
  - expanded LoRA layout to three columns when width allows
- Validation:
  - `npm run build` passed in repo frontend.
  - Synced frontend/docs into v16 install-test and v17 staging.
  - `npm run build` passed in both synced frontend copies.
  - Hash check confirmed key source/docs files match across repo, v16 install, and v17 staging.
  - Browser DOM check confirmed the revised Z-Image cockpit stack, compact control grid, top preview, Back button, and no visible right output pane.

## 2026-06-05 19:20 Europe/Oslo

- Started Phase 1 of FEDDA workflow memory, inspired by the MemPalace research but without adding a new dependency.
- Added local workflow memory storage:
  - `config/workflow_memory.json` at runtime
  - `GET /api/workflow-memory/{workflow_id}`
  - `POST /api/workflow-memory/{workflow_id}`
  - `DELETE /api/workflow-memory/{workflow_id}/{entry_id}`
- Connected memory to Ollama prompt generation:
  - `OllamaPromptRequest` now accepts `workflow_id`
  - recent workflow memory is prepended to the Ollama prompt instruction when available
- Connected simple image cockpit to memory:
  - `PromptAssistant` accepts and sends `workflowId`
  - `SimpleImageCockpit` shows a compact "Remember setup" row
  - "Remember setup" saves prompt, negative prompt, size, steps, CFG, seed, and LoRAs for the active workflow
- Validation:
  - `npm run build` passed in repo frontend.
  - `python -m py_compile backend/server.py` passed in repo.
  - temporary-file smoke test confirmed memory add/list/context generation works without writing runtime memory into the repo.
  - synced backend/frontend/docs to v16 install-test and v17 staging.
  - frontend builds passed in both synced copies.
  - backend `server.py` compiled in both synced copies.
  - hash checks confirmed backend and cockpit source match across repo, v16 install, and v17 staging.
  - browser DOM check confirmed the Z-Image page renders the memory row, top preview, Back button, and no right output pane.

## 2026-06-05 19:45 Europe/Oslo

- Extended the Phase 1 workflow memory UI so saved memory is visible and controllable.
- Added compact memory drawer in `SimpleImageCockpit`:
  - `Memory` toggle button
  - recent memory list
  - refresh action
  - empty state
  - delete action per memory entry
- Kept drawer intentionally small and inline with the cockpit instead of adding a large side panel.
- Validation:
  - `npm run build` passed in repo frontend.
  - `python -m py_compile backend/server.py` passed in repo.
  - synced backend/frontend to v16 install-test and v17 staging.
  - frontend builds passed in both synced copies.
  - backend `server.py` compiled in both synced copies.
  - browser DOM check confirmed `Remember setup`, `Memory`, drawer open state, top preview, Back button, and no right output pane.

## 2026-06-05 20:05 Europe/Oslo

- Fixed Qwen Multi Angle camera orbit preview direction.
- Changed horizontal orbit math so:
  - `0` / Front renders at the bottom of the orbit, toward the user.
  - `180` / Back renders at the top of the orbit.
  - negative angles render left.
  - positive angles render right.
- Updated drag inverse math to match the new visual orientation.
- Improved the SVG preview readability:
  - FRONT/BACK/LEFT/RIGHT labels
  - center guide lines
  - clearer subject plane
  - front-facing direction arrow
  - slightly taller preview area
- Validation:
  - `npm run build` passed in repo frontend.
  - synced frontend to v16 install-test and v17 staging.
  - frontend builds passed in both synced copies.
  - hash check confirmed `QwenMultiAnglesPage.tsx` matches across repo, v16 install, and v17 staging.
  - Browser automation timed out while navigating, so final visual inspection should be done manually in the running app after reload.

## 2026-06-05 23:20 Europe/Oslo

- Tightened the Qwen Multi Angle camera widget again after user feedback that the visual itself still felt wrong.
- Added compact shot summary text in each card header and inside the preview:
  - direction (`Front`, `Left`, `Right`, `Back`)
  - tilt (`Eye level`, `High`, `Low`)
  - zoom value
- Fixed SVG drag coordinate mapping after the preview was enlarged from 170 to 186 viewBox height.
- Made the orbit view more readable:
  - front label is physically lower/toward-user
  - camera marker includes a small direction wedge
  - camera-to-subject guide line added
  - orbit line is less dominant
- Validation:
  - `npm run build` passed in repo frontend.
  - synced frontend source to v16 install-test and v17 staging.
  - frontend builds passed in both synced copies.
  - hash check confirmed `QwenMultiAnglesPage.tsx` matches across repo, v16 install, and v17 staging.
  - Browser connection reached the right URL but timed out on DOM snapshot/evaluation, so final visual check still needs manual reload in the app.

## 2026-06-05 23:30 Europe/Oslo

- Continued the UI cockpit goal by tightening the shared simple image workflow base instead of editing only one page.
- Updated `SimpleImageCockpit` so image-upload workflows use a compact inline upload row instead of a large dominant upload box.
- Tightened cockpit CSS:
  - smaller outer padding/gaps
  - denser control grid
  - smaller size preset buttons
  - smaller width/height/seed inputs
  - shorter negative prompt panel
  - compact uploaded-image preview row
- This affects shared simple image pages that route through `Txt2ImgPage`, including Z-Image Txt2Img, FireRed Edit, Qwen Rapid Edit, Chroma, Chroma Simple, and similar configured simple pages.
- Validation:
  - `npm run build` passed in repo frontend.
  - synced frontend source to v16 install-test and v17 staging.
  - frontend builds passed in both synced copies.
  - hash check confirmed `SimpleImageCockpit.tsx` and `index.css` match across repo, v16 install, and v17 staging.
  - Browser visual check failed due to the existing in-app browser CDP timeout, so manual reload is still needed for final visual review.

## 2026-06-05 23:38 Europe/Oslo

- Continued the UI consistency pass on the complex `ZImageDualLoraPage`.
- Reduced one-off layout clutter by merging separate pipeline/seed and LoRA setup areas into one compact `LoRA + Seed` control strip.
- Tightened spacing and sizing:
  - smaller seed buttons
  - tighter LoRA grid columns
  - smaller range spacing
  - reduced main workspace gap
  - reduced empty/base-image canvas minimum height
  - narrower target aside
  - reduced target/status card padding
- Kept workflow behavior unchanged; this was a layout-only pass.
- Validation:
  - `npm run build` passed in repo frontend.
  - synced frontend source to v16 install-test and v17 staging.
  - frontend builds passed in both synced copies.
  - hash check confirmed `ZImageDualLoraPage.tsx` matches across repo, v16 install, and v17 staging.

## 2026-06-05 23:45 Europe/Oslo

- Continued the complex workflow UI pass on `QwenMultiAnglesPage`.
- Moved Qwen recent-angle previews into the `WorkflowWorkbench` preview slot instead of keeping a separate top preview section inside the page body.
- Compact layout changes:
  - reference upload preview reduced from large card to compact reference strip
  - main page now uses one cockpit frame instead of separate preview/body/output sections
  - seed, prompt/camera toggles, steps, CFG, and denoise merged into one compact `Run Settings` panel
  - current output moved inside the main cockpit under the generate button
  - output empty state reduced from a large 280px panel to a compact status area
- Kept workflow behavior unchanged; this was a layout-only pass.
- Validation:
  - `npm run build` passed in repo frontend.
  - synced frontend source to v16 install-test and v17 staging.
  - frontend builds passed in both synced copies.
  - hash check confirmed `QwenMultiAnglesPage.tsx` matches across repo, v16 install, and v17 staging.

## 2026-06-05 23:52 Europe/Oslo

- Reworked the Qwen Multi Angle mini camera widget after user feedback that the card itself still looked wrong.
- Simplified the visual into a clearer top-down orbit:
  - subject is centered with a clear physical `SUBJECT FRONT` direction toward the bottom
  - `FRONT` is now visibly the lower/toward-user side, `BACK` is top
  - removed the confusing slanted plane/screen look
  - camera marker now points toward the subject instead of reading like a loose dot
  - orbit front/back depth is visually separated with muted rear arc and stronger front arc
- Added and installed `scripts/patch_kjnodes_ltx_audio_vae.ps1`.
- Root cause fixed for the LTX VAE error:
  - KJNodes detected audio VAEs by `vocoder.*` keys
  - LTX 2.3 audio VAE uses `audio_vae.vocoder.*` keys
  - KJNodes then treated the audio VAE as a normal image VAE and raised `ERROR: VAE is invalid: None`
- The patch extends KJNodes audio-VAE detection to include `audio_vae.vocoder.*`.
- Hooked the patch into:
  - `scripts/install_lite.ps1`
  - `scripts/install.ps1`
  - `scripts/update_logic.ps1`
- Applied the patch directly to the current v16 test install and v17 staging where KJNodes exists.
- Validation:
  - `npm run build` passed in repo frontend.
  - synced frontend source/scripts to v16 install-test and v17 staging.
  - frontend builds passed in both synced copies.
  - hash check confirmed `QwenMultiAnglesPage.tsx` matches across repo, v16 install, and v17 staging.
  - hash check confirmed `patch_kjnodes_ltx_audio_vae.ps1` matches across repo, v16 install, and v17 staging.
  - ComfyUI must be restarted for the KJNodes patch to take effect in a running server.

## 2026-06-06 00:00 Europe/Oslo

- Continued the shared simple image cockpit cleanup toward the full UI consistency goal.
- Updated `SimpleImageCockpit`:
  - moved workflow memory actions from a separate explanatory row into a compact cockpit toolbar
  - shortened button labels from `Remember setup`/long helper copy to compact `Remember`/`Memory`
  - kept memory drawer behavior unchanged
- Tightened cockpit CSS in `index.css`:
  - smaller cockpit padding and stack gaps
  - wider shared control grid
  - four-column LoRA grid on wide screens
  - compact toolbar button styling
- This affects simple image workflows routed through `Txt2ImgPage`, including Z-Image Txt2Img, FireRed Edit, Qwen Rapid Edit, Chroma, Chroma Simple, Flux, Qwen, and Qwen Reference style pages.
- Validation:
  - `npm run build` passed in repo frontend.
  - synced frontend source to v16 install-test and v17 staging.
  - frontend builds passed in both synced copies.
  - hash check confirmed `SimpleImageCockpit.tsx` and `index.css` match across repo, v16 install, and v17 staging.
  - Browser reached `http://localhost:5173/#/tab/z-image-txt2img`, but DOM/snapshot inspection timed out again through CDP; manual visual reload is still needed.

## 2026-06-06 00:12 Europe/Oslo

- Fixed the second half of the LTX/KJNodes audio VAE issue after testing showed the first compatibility patch still failed.
- Root cause:
  - first patch made KJNodes detect `audio_vae.vocoder.*` keys
  - but KJNodes still wrapped the LTX audio VAE as a normal Comfy `VAE`, which stayed invalid
  - LTX needs a real `comfy.ldm.lightricks.vae.audio_vae.AudioVAE`
- Updated `scripts/patch_kjnodes_ltx_audio_vae.ps1` so detected audio VAEs return `AudioVAE(sd, metadata)` and only call `throw_exception_if_invalid()` when the object supports it.
- Applied upgraded patch directly to:
  - current v16 install-test KJNodes
  - v17 staging KJNodes
- Validation:
  - Python smoke test loaded `LTX23_audio_vae_bf16.safetensors`, constructed `AudioVAE`, confirmed `decode` exists, confirmed `autoencoder` exists, and reported sampling rate `16000`.
  - ComfyUI must still be restarted after the patch because KJNodes is imported in-process.

## 2026-06-06 14:30 Europe/Oslo

- Added a first-pass Ollama prompt helper for `LTX Img2Vid`.
- `PromptAssistant` now accepts the dedicated `ltx-img2vid` context instead of forcing Img2Vid through `ltx-flf`.
- `LtxImg2VidPage` now has a compact `Build From Reference` action:
  - reads the currently uploaded reference image from Comfy input preview
  - sends it to `/api/ollama/caption` with `context=ltx-img2vid`
  - fills the motion prompt with an LTX-specific image-to-video prompt
- Backend prompt focus now includes `ltx-img2vid` for text prompt enhance/generate calls.
- Synced frontend/backend changes to v16 install-test and v17 staging.
- Validation:
  - `npm run build` passed in repo frontend, v16 install-test frontend, and v17 staging frontend.
  - `python -m py_compile backend/server.py` passed in repo, v16 install-test, and v17 staging.

## 2026-06-06 14:36 Europe/Oslo

- User confirmed these workflows work from the FEDDA UI:
  - `LTX Img2Vid`
  - `FireRed Edit`
  - `LTX First / Last` was already confirmed working after the LTX audio VAE patch
- Updated `docs/v16/WORKFLOW_AUDIT_CHECKLIST.md` so old blocked/partial notes no longer hide the current working status.

## 2026-06-06 15:20 Europe/Oslo

- User confirmed `Qwen Rapid Edit` works from the FEDDA UI.
- User confirmed `Qwen Multi Angle` generates images, but still needs polish.
- Qwen Multi Angle fixes applied:
  - registers the active workflow node-map before generation so the top Comfy progress strip can show current node/job position
  - sends Comfy `client_id` with the generation payload so websocket progress can associate with the run
  - removes the lower duplicate `Current Output` preview area; outputs now belong in the top preview bar
  - clears stale Comfy outputs at run start
  - locks camera zoom to a safer `3-8` range instead of allowing extreme `1-12` values that could produce no output
- Updated `docs/v16/WORKFLOW_AUDIT_CHECKLIST.md`:
  - `Qwen Rapid Edit` -> `Works`
  - `Qwen Multi Angle` -> `Works / Needs polish`

## 2026-06-06 15:40 Europe/Oslo

- Started a focused `Z-Image Dual LoRA` usability pass.
- Kept workflow behavior/mapping stable; this was a UI language and flow cleanup.
- Replaced confusing internal workflow terms:
  - `Base LoRA` -> `Person 1 LoRA`
  - `Detail LoRA` -> `Person 2 LoRA`
  - `Generate Base` -> `1. Create First Image`
  - `Target` -> `2. Choose Person To Refine`
  - `Final Detail Pass` -> `3. Refine Selected Person`
  - `Main Prompt` -> `Full Scene Prompt`
  - `Detail Prompt` -> `Selected Person Prompt`
- Reduced target choices to clear `Person 1 (left side)` and `Person 2 (right side)` buttons.
- Updated empty/error/notice text so the page reads like a user-facing two-person editor instead of a node-pipeline UI.
- Validation:
  - `npm run build` passed in repo frontend.

## 2026-06-06 15:55 Europe/Oslo

- Fixed a Z-Image Dual LoRA selected-person refinement bug.
- Root issue:
  - the UI could display/select a detected person box
  - but the second pass always sent `selected_box_index: 0`
  - so ComfyUI could refine the wrong detected box, or a broad/wrong mask, even when the UI showed another selected person
- Updated `ZImageDualLoraPage.tsx` so the detail pass sends the currently selected detected box index.
- Tightened the selected-person prompt so it explicitly says to refine only the selected person and preserve the other person unchanged.
- Important remaining caveat:
  - manual/fallback boxes are still UI-side helpers; the Comfy workflow currently relies on Florence/SAM detection for the actual second-pass mask.
  - if manual boxes need to be authoritative, the workflow/backend must be extended with explicit bbox/mask injection.
- Validation:
  - `npm run build` passed in repo frontend.

## 2026-06-06 16:15 Europe/Oslo

- User identified that the single `backend/workflows/z-image/z-image-dual-lora.json` runs smoothly in ComfyUI, while the split FEDDA base/detail approach was the wrong direction.
- Switched FEDDA integration back to the single-run workflow:
  - added `z-image-dual-lora` to `config/workflow_api.json`
  - changed the Z-Image module/registry to use `z-image-dual-lora` instead of `z-image-dual-base` + `z-image-dual-detail`
  - added `z-image-dual-lora` to backend Z-Image model preflight group
  - patched `z-image-dual-lora.json` with real Z-Image model filenames instead of placeholder UNET/CLIP/VAE names
- Reworked `ZImageDualLoraPage.tsx` so it runs the whole workflow once:
  - one generate button: `Create Dual LoRA Image`
  - no FEDDA-side first-pass/second-pass orchestration
  - Person 1 / Person 2 keep gender selectors
  - selected side sends a gender-aware Florence phrase like `left woman`, `right man`
- Validation:
  - `npm run build` passed in repo frontend
  - config JSON parses with `utf-8-sig`
  - `python -m py_compile backend/server.py` passed

## 2026-06-06 16:30 Europe/Oslo

- User confirmed `Z-Image Dual LoRA` now works well from FEDDA UI after switching to the single-run workflow.
- Updated workflow audit status to `Works`.
- Keep future enhancement note: advanced explicit mask/bbox control can be revisited later, but the current baseline is functioning.

## 2026-06-06 17:50 Europe/Oslo

- Fixed Qwen Image missing prompt-node error:
  - ComfyUI reported `Node 'PROMPT' not found`, node `13`, class `String Literal`
  - `String Literal` was only used as a prompt helper in `qwen-edit-2512.json`
  - removed the `String Literal` and `Text Concatenate` prompt-helper nodes
  - wired the positive prompt directly into `TextEncodeQwenImageEditPlus` node `10.prompt`
- Applied the same dependency removal to `qwen-edit-2509-image-reference.json` before testing Qwen Reference, because it used the same `String Literal` prompt pattern.
- Updated `config/workflow_api.json` mappings:
  - `qwen-edit-2512.prompt` -> node `10.prompt`
  - `qwen-edit-2509-image-reference.prompt` -> node `10.prompt`
- Synced workflow/config changes to v16 install-test and v17 staging.
- Validation:
  - repo frontend build passed
  - Qwen workflow/config JSON parses in repo, v16 install-test, and v17 staging

## 2026-06-06 18:05 Europe/Oslo

- User confirmed `Qwen Image` now runs, but output quality is not good enough yet.
- Updated `QwenTxt2Img` to stop inheriting generic Z-Image defaults:
  - default steps now match the workflow's `Qwen-Image-Lightning-4steps` LoRA
  - CFG starts at `1` with a narrow visible control range
  - Qwen gets its own negative prompt
  - existing browser state migrates once to the new Qwen Lightning defaults
- Audit state is now `Works / Quality needs tuning`; next quality pass should compare against Qwen Rapid and newer Qwen 2511-style settings before deeper workflow edits.

## 2026-06-06 18:20 Europe/Oslo

- Parked the misleading `Qwen Txt2Img` entry.
- Reason:
  - `qwen-edit-2512.json` exists, but it is not a strong or necessary dedicated Qwen Txt2Img baseline.
  - Qwen Rapid, Qwen Reference, and Qwen Multi Angle are the useful active Qwen pages for now.
- UI changes:
  - disabled the `Qwen Image` registry card
  - removed `Qwen Txt2Img` from sidebar navigation
  - direct `qwen` / `qwen-txt2img` routes now fall back to Qwen Reference instead of loading the parked page
  - removed `qwen-edit-2512` from the active `qwen-image` module workflow list
- Kept workflow JSON and API mapping in place as parked assets, so the route can be revived later without rediscovering the prior prompt-node fix.

## 2026-06-06 18:35 Europe/Oslo

- User decided to pause deeper workflow debugging and focus on optimizing known-working workflows.
- Added card-level workflow status badges in the Image Studio and Video Studio card grids:
  - `Verified` in green for workflows confirmed working from FEDDA UI
  - `Lab`, `Test`, `Tuning`, `Setup`, or `Build` for active workflows that still need review
- Status source now lives in `frontend/src/modules/registry.ts` through `status` / `statusLabel` metadata per module.
- Current verified cards include:
  - Z-Image Txt2Img
  - Z-Image Dual LoRA
  - FireRed Edit
  - Qwen Rapid Edit
  - Qwen Multi Angle
  - LTX Img2Vid
  - LTX First / Last
- Parked/disabled workflows remain hidden rather than shown as active construction cards.

## 2026-06-06 18:55 Europe/Oslo

- Started FLUX2-KLEIN optimization because user has good native ComfyUI results but FEDDA output was not picking up the character LoRA strongly.
- Verified:
  - `flux2klein-txt2img` maps LoRAs to rgthree Power Lora Loader node `205:522`
  - `backend/test_flux2klein_injection.py` passes in repo, v16 install-test, and v17 staging
  - selected LoRAs are filtered to `flux2klein/` only
- Changed rgthree injection to write nested LoRA paths with Windows separators, matching the native ComfyUI export format (`flux2klein\\name.safetensors`).
- Added a compact `Character / Trigger` field to the shared simple image cockpit, enabled on FLUX2-KLEIN:
  - field is appended to the main prompt before queueing
  - intended for character identity, trigger phrase, face/hair/body/outfit details
- FLUX2-KLEIN UI defaults now expose CFG in a narrow safe range and use a modest step range.
- Validation:
  - FLUX2-KLEIN injection test passed
  - `python -m py_compile backend/workflow_service.py backend/test_flux2klein_injection.py` passed
  - repo frontend build passed

## 2026-06-06 20:45 Europe/Oslo

- User confirmed FLUX2-KLEIN works with a proper Klein LoRA after earlier accidental Qwen LoRA testing.
- Current observed better FLUX2-KLEIN baseline:
  - about `8` steps
  - about `1.2` CFG
  - Klein LoRA selected under `flux2klein/`
- Updated audit to `Works / Optimize`.
- Added a dedicated future-feature instruction/spec:
  - `docs/v16/UI_AGENT_CONTROL_PANEL_PLAN.md`
- The new spec defines a sixth main menu area, `UI Agent`, as a structured workflow control panel using Ollama + visible memory + workflow planning.
- Important decision:
  - MemPalace is useful as an architectural reference, but should not become a required installer dependency in v1.
  - First implementation slice should be plan-only, then approval-based generation later.

## 2026-06-06 21:21 Europe/Oslo

- Implemented the first `UI Agent` control panel slice as a plan-only workflow planner.
- Added backend planner service:
  - `backend/ui_agent_service.py`
  - `GET /api/ui-agent/workflows`
  - `POST /api/ui-agent/plan`
  - kept existing `/api/agent/run` filesystem/tool-agent API untouched
- Added deterministic planner safeguards:
  - V1 allowlist only: `z-image`, `flux2klein-txt2img`, `firered-image-edit`, `qwen-rapid-edit-v23`, `ltx-img2vid`
  - parked Qwen Txt2Img, Chroma, WAN, Steady Dancer, and Qwen Multi Angle are not exposed in UI Agent V1
  - Z-Image LoRAs must come from Z-Image folders
  - FLUX2-KLEIN LoRAs must come from `flux2klein/`
  - image-edit/video workflows warn when no source image filename is supplied
  - planning requires a local Ollama text model and never calls `/api/generate`
- Added frontend UI:
  - sixth home card/tab `ui-agent`
  - `frontend/src/pages/UIAgentPage.tsx`
  - chat transcript, editable structured plan, model/memory context, LoRA editing, image filename attachment field
  - no approve/generate action in V1
- Added smoke test:
  - `backend/test_ui_agent_service.py`
  - verifies the Sara Z-Image and Aurora FLUX2-KLEIN acceptance routes without needing live Ollama
- Mirrored the implementation into v17 staging app.
- Validation:
  - `python -m py_compile backend/server.py backend/ui_agent_service.py backend/test_ui_agent_service.py` passed in v16 repo and v17 staging
  - `python backend/test_ui_agent_service.py` passed in v16 repo and v17 staging
  - `npm run build` passed in v16 repo frontend and v17 staging frontend
  - live `/api/ui-agent/workflows` returned exactly the five V1 workflows
  - live browser smoke at `#/tab/ui-agent` produced an editable FLUX2-KLEIN plan from the Aurora prompt and showed no generate action

## 2026-06-07 00:30 Europe/Oslo

- Stabilized `UI Agent` into a guarded approve-and-run agent surface.
- Added a local MemPalace-compatible memory adapter:
  - `backend/ui_agent_service.py` now keeps a FEDDA local palace hierarchy in `config/ui_agent_mempalace.json`
  - memory stays local-first and dependency-free, while reporting whether the upstream `mempalace` package is available
  - approved UI Agent runs are stored as visible palace drawers instead of silently saving chat lines
- Added UI Agent execution endpoints under the existing safe namespace:
  - `POST /api/ui-agent/prepare`
  - `POST /api/ui-agent/run`
  - `GET /api/ui-agent/mempalace/status`
- Kept `/api/agent/run` untouched for the existing filesystem/tool AgentRuntime.
- Frontend `UIAgentPage` now supports:
  - structured planning
  - editable payload fields
  - deterministic validation
  - `Approve & Generate`
  - queued prompt id feedback
  - MemPalace/local-palace status in the context panel
- Validation:
  - `python -m py_compile backend/server.py backend/ui_agent_service.py backend/test_ui_agent_service.py` passed
  - `python backend/test_ui_agent_service.py` passed, including prepare/blocked-image/wrong-family-LoRA checks
  - `npm run build` passed in repo frontend

## 2026-06-07 - UI Agent / MemPalace Paused

- User decided not to spend more time on the dedicated `UI Agent` direction for now.
- What was attempted:
  - Added `UI Agent` as a sixth main area/home card.
  - Added a structured planner page instead of a loose chat page.
  - Added guarded UI Agent endpoints under `/api/ui-agent/*`.
  - Added `Approve & Generate` through the normal `/api/generate` path after deterministic validation.
  - Added a local MemPalace-compatible adapter in `backend/ui_agent_service.py`.
  - Kept upstream `MemPalace/mempalace` as optional inspiration rather than a required installer dependency.
  - Synced the route/card fixes into v16 install and v17 after discovering the page existed but install navigation did not expose it.
- Current state:
  - Code is left in place.
  - The feature is not the active focus.
  - Treat UI Agent as parked/experimental until the user explicitly wants to resume it.
  - Do not spend more debugging time on MemPalace/UI Agent before the core workflow UX and generation flows are worth the extra control layer.
- Suggested future resume point:
  - Only revisit after the main verified workflows feel smooth enough that a natural-language control panel is clearly worth maintaining.
  - If resumed, start with one workflow only, probably Z-Image or FLUX2-KLEIN, and prove end-to-end value before broadening.
