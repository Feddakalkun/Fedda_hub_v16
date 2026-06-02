# FEDDA Hub v16 Handoff

## Latest Update - Workflow Standard Baseline

- New workflows should follow `docs/v16/WORKFLOW_STANDARD.md`.
- Use `backend/workflows/HF-downloader/HFdownloadernode.json` as the reusable downloader template for model-backed workflows.
- Update its `download_links` with exact HuggingFace URLs and Comfy target folders.
- Do not hard-block `/api/generate` before Comfy can run a workflow-owned `HuggingFaceDownloader` node.
- Validate new workflows with `python dev_tools/validate_workflow_standard.py --workflow-id <id>` and use `--require-downloader` for model-backed workflows.
- Chroma should be added next as a booster-style workflow/module using this standard.

## Latest Update - Chroma1-HD Base

- Chroma1-HD base txt2img has been added as workflow id `chroma1-hd-txt2img`.
- Workflow file: `backend/workflows/chroma/chroma1-hd-txt2img-api.json`.
- Uses official Lodestones Chroma1-HD full model URL because the fp8 rev2 URL embedded in the official markdown currently resolves 404.
- Required downloader links:
  - `Chroma1-HD.safetensors` -> `models/diffusion_models`
  - `flan-t5-xxl_float8_e4m3fn_scaled_stochastic.safetensors` -> `models/text_encoders`
  - `ae.safetensors` -> `models/vae`
- Frontend page: `frontend/src/pages/chroma/ChromaTxt2Img.tsx`.
- Chroma LoRA UI is disabled in this first pass; add it only after testing the correct Chroma LoRA loader.

## Latest Update - Chroma Quality Defaults Fix

- Chroma initially looked bad because `Txt2ImgPage` had a hard-coded `cfg = 1.0` meant for Z-Image.
- `Txt2ImgPage` now supports workflow-specific CFG, negative prompt, quick modes, and max steps.
- Chroma now sends CFG `3.0` and defaults to `40` steps.
- There is a one-time localStorage migration for `chroma_txt2img` to replace early bad defaults in browsers that already tested Chroma.

## Current Goal

Turn FEDDA Hub into a modular core + booster-pack architecture while preserving the working v15 behavior.

## Current State

- v16 repo clone exists at `H:\Fedda-Hub\Fedda_hub_v16\Fedda_hub_v16_repo`.
- v16 install test clone exists at `H:\Fedda-Hub\Fedda_hub_v16\Fedda_hub_v16_install\app`.
- v15 backup exists at `H:\Fedda-Hub\backup\Fedda_hub_v15_repo_pre_v16_modules_20260601_233127`.
- First frontend module registry has been added at `frontend/src/modules/registry.ts`.
- App/home/workflow-card navigation now reads from the registry.
- Backend/shared module manifest has been added at `config/modules.json`.
- Backend module loader has been added at `backend/module_service.py`.
- `/api/workflow/list` now includes module metadata for every workflow.
- `/api/modules`, `/api/modules/{module_id}`, and `/api/modules/workflow/{workflow_id}` expose module ownership and validation.
- Installer/update scripts now use `scripts/module_nodes.ps1` to select custom nodes from enabled modules when `config/modules.json` is available.
- Frontend registry cards now include `sourceModuleId` and workflow ownership hints that point back to `config/modules.json`.
- The v16 one-click installer has been corrected from v15 and is available as `FEDDA_v16_Installer.bat`.
- First shared workflow-page base exists:
  - `frontend/src/hooks/useWorkflowRun.ts`
  - `frontend/src/components/layout/WorkflowWorkbench.tsx`
  - `frontend/src/components/layout/WorkflowVideoPreviewStrip.tsx`
- LTX Img2Vid and LTX First/Last Frame now use the shared workflow run/layout base.
- LTXVideo Kornia 0.8.x compatibility patch exists at `scripts/patch_ltxvideo_kornia.ps1` and is called by install/update scripts.
- Frontend dependencies were installed in the v16 repo clone and `npm run build` passed.
- First modular foundation commit is `e6d01cc`.
- `main` was pushed to `https://github.com/Feddakalkun/Fedda_hub_v16`.
- The install clone was fast-forwarded to the same commit and its frontend build passed.

## Important Constraints

- Preserve a working core build even when booster modules are disabled or not installed.
- Do not move runtime folders into git: ComfyUI, embedded Python, Ollama, models, outputs, cache, logs, venvs, and node_modules stay local/runtime only.
- Keep breadcrumbs updated in `docs/v16/BREADCRUMBS.md`.
- Update this handoff after every meaningful implementation step.

## Next Recommended Steps

1. Restart the app/ComfyUI after the LTXVideo patch, then retest the LTX Img2Vid page.
2. Manually inspect the two migrated LTX pages in the browser.
3. If LTX feels good, migrate one simple WAN page next, preferably `WAN 2.2 Img2Vid`.
4. Add module-aware model/preflight specs next to workflow ownership.
5. Add a small module validation command/script that checks frontend `sourceModuleId` values against backend `config/modules.json`.
6. Replace or bridge `frontend/src/config/navigation.ts` with the new module registry.
7. Only after the registry is stable, begin moving individual workflow families into module folders.
8. Keep repo clone and install clone synchronized after each commit.

## Known Loose Ends

- `frontend/src/config/navigation.ts` still exists and may duplicate registry concepts for secondary navigation helpers.
- `frontend/public/cards/industrial/` remains untracked in v15 and was intentionally not copied from untracked git state.
- GitHub repo `Feddakalkun/Fedda_hub_v16` may need to be created before first push.
- `npm audit` currently reports 3 moderate and 5 high issues inherited from the existing dependency set.
- `scripts/module_nodes.ps1` now filters custom nodes by enabled modules, but model preflight/download behavior is not module-filtered yet.
- Browser tooling was unavailable during the first workflow base migration, so visual QA still needs a manual pass.
