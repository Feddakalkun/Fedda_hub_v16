# FEDDA Hub v16 Module Strategy

## Core Build

Core should stay small and stable:

- app shell and status strip
- Image Studio entrypoint
- Video Studio entrypoint
- Gallery
- LoRA & Character library
- Ollama Models
- shared ComfyUI execution, upload, media, and output plumbing

## Booster Modules

Booster modules should be optional and self-described:

- workflow UI routes
- workflow API JSON
- required custom nodes
- required model specs and preflight rules
- card artwork
- installer/runtime dependency notes

## First Implementation Rule

Do not move heavy workflow code until the manifest/registry layer can hide or expose modules cleanly. The first pass should centralize ownership and make the app tolerate missing modules. The second pass can physically move feature families.

