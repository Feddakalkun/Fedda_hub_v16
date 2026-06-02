# FEDDA Hub v16 Breadcrumbs

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
