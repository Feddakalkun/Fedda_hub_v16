# Quick Image Pack Inventory

Date: 2026-06-02

This note captures the first low-risk pass for faster image workflows in v16.

## Ready Now

Z-Image Turbo is the safest quick-results base in the current v16 test install.

Installed in `Fedda_hub_v16_install\app\ComfyUI\models`:

- `clip\qwen_3_4b.safetensors`
- `unet\z_image_turbo_bf16.safetensors`
- `vae\z-image-vae.safetensors`

No LoRA files were found in the fresh v16 install `models\loras` during this pass.

## Found But Not Ready

FLUX2-Klein already has a v16 workflow and page, but the fresh v16 install did not contain its required model files:

- `diffusion_models\flux-2-klein-9b-fp8.safetensors`
- `text_encoders\qwen_3_8b_fp8mixed.safetensors`
- `vae\flux2-vae.safetensors`

The backend now preflights these files before queueing `flux2klein-txt2img`, so missing or gated HuggingFace downloads are reported before ComfyUI fails deep in execution.

Chroma was found in two places:

- Old v14 workflow: `Fedda_hub-v14\backend\workflows\z-image\z-image-chroma-txt2img.json`
- Official Comfy template: `image_chroma_text_to_image.json`

The old v14 workflow uses `ClownModelLoader` / `ClownsharKSampler_Beta`, while the official template expects:

- `Chroma1-HD-fp8mixed.safetensors`
- `t5xxl_fp8_e4m3fn_scaled.safetensors`
- `ae.safetensors`

Chroma should be added as its own booster workflow after converting or rebuilding the official template into API format.

## Next Recommended Step

Polish Z-Image as the first fast-results page, then add Chroma as a separate booster pack once model paths and a clean API workflow are verified.
