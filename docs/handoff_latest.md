# Handoff Latest

Date: 2026-06-02

The current direction is to pause heavy WAN/LTX work and focus on faster image wins, especially Z-Image, Chroma, and Flux/Flex-style workflows.

## What Changed In This Pass

- Added FLUX2-Klein model preflight support in `backend\model_downloader.py`.
- Added server-side required-model checks for `flux2klein-txt2img` in `backend\server.py`.
- Added `/api/workflow/model-status/flux2klein-txt2img` reporting for the exact three FLUX2-Klein files.
- Added generation-time blocking before queueing Flux2/Klein if required files are missing.
- Polished the Z-Image txt2img page with model status, Fast/Balanced/Detail step presets, and a clear empty LoRA state for fresh installs.
- Replaced the default `z-image` workflow mapping with `backend\workflows\z-image\z-image-txt2img-core.json`, a minimal core-node API workflow. This removes the broken `String Literal` prompt nodes, style concat nodes, FaceDetailer, SAM, and Ultralytics dependencies from basic Z-Image txt2img.
- Wrote `docs\quick-image-pack-inventory.md` with local findings.

## Important Findings

Fresh v16 install currently has Z-Image core models only:

- `qwen_3_4b.safetensors`
- `z_image_turbo_bf16.safetensors`
- `z-image-vae.safetensors`

Fresh v16 install does not currently have LoRAs under `ComfyUI\models\loras`.

FLUX2-Klein exists as an app page and workflow, but the model files are not present in the fresh install. The main model URL may require HuggingFace access, so do not assume auto-download will work for every user.

Chroma official Comfy templates exist locally, but Chroma is not wired into v16 yet. The old v14 Chroma graph uses different custom nodes and should not be copied blindly.

## Next LLM Should Do

Start with Z-Image polish for quick wins. If adding Chroma, first convert/rebuild the official `image_chroma_text_to_image.json` template into a minimal API workflow, then add model preflight and only then expose the page/card.
