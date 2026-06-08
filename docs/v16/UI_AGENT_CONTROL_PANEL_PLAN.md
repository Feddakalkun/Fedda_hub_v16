# FEDDA v16 UI Agent Control Panel Plan

Date: 2026-06-06

Goal: add a sixth main FEDDA area, tentatively called `UI Agent`, that lets the user talk naturally to FEDDA and have the assistant prepare, route, and run image/video workflows through the existing backend safely.

## Why This Exists

FEDDA now has multiple working workflows, but each still expects the user to know:

- which model family to use
- which LoRA belongs to which model
- what trigger phrase is needed
- what steps/CFG/size are sane
- when to use Z-Image, FLUX2-KLEIN, FireRed, Qwen Rapid, LTX, etc.

The UI Agent should become the natural-language control layer:

> "Create an image using Sara Z-Image LoRA in a clown costume."

The agent should translate that into:

- workflow choice
- LoRA choice
- prompt
- negative prompt
- settings
- a visible plan for user approval
- final `/api/generate` call only after approval

## Current FEDDA Foundations

Already implemented:

- Ollama text generation endpoints.
- Ollama vision caption endpoint.
- Agent chat/session memory backend using SQLite.
- Workflow memory store in `config/workflow_memory.json`.
- Workflow-specific memory drawer in `SimpleImageCockpit`.
- PromptAssistant passes `workflow_id` so workflow memory can inform prompt generation.
- Existing `/api/generate` endpoint can run workflow ids with params.
- Existing workflow registry describes active modules/cards/tabs.

This means UI Agent should not start from scratch. It should orchestrate existing services.

## MemPalace Direction

Use MemPalace as an architecture reference, not as a required install dependency in v1.

Relevant ideas:

- local-first memory
- verbatim storage
- scoped retrieval
- palace hierarchy
- specialist agent roles
- user-visible memory

FEDDA mapping:

- wing = workflow family, such as Z-Image, FLUX2-KLEIN, Qwen, FireRed, LTX, WAN
- room = workflow page, such as txt2img, dual-lora, rapid-edit, img2vid
- hall = topic category, such as prompts, settings, LoRAs, failures, quality notes
- drawer = exact saved prompt/run/failure/user note

Do not require MemPalace in the installer yet. Build a local FEDDA adapter first, then optionally add MemPalace MCP later.

## Main Menu Addition

Add a sixth main card/page:

- Image Studio
- Video Studio
- Gallery
- LoRA & Character
- Ollama Models
- UI Agent

Suggested label: `UI Agent`

Alternative labels:

- `FEDDA Agent`
- `Studio Agent`
- `Command Center`
- `Copilot`

Recommendation: `UI Agent` for now. It is plain, direct, and does not overpromise full autonomy.

## UI Shape

The UI Agent page should be a real control panel, not a generic chat bubble page.

Layout:

- left/main: chat transcript and current user request
- right/top or side: interpreted workflow plan
- right/bottom: memory/context panel
- bottom: command input and quick action buttons

The page should show:

- selected workflow
- selected LoRAs
- trigger phrases
- size
- steps
- CFG
- seed
- prompt
- negative prompt
- expected output type
- warnings
- required missing models/nodes
- approval buttons

Never auto-run without user approval in v1.

## Agent Modes

V1 modes:

- `Plan only`: interpret the user request and propose workflow/settings.
- `Prepare run`: build the payload but do not submit.
- `Run after approval`: user clicks approve/generate.
- `Remember`: save the successful prompt/settings to workflow memory.

Future modes:

- compare two workflows
- generate prompt variants
- inspect last failure
- suggest better settings from history
- build an image-to-video prompt from a generated image
- queue chained workflows

## Backend Interfaces

Add or reuse these endpoints:

Existing:

- `POST /api/chat`
- `POST /api/ollama/prompt`
- `POST /api/ollama/caption`
- `GET /api/workflow-memory/{workflow_id}`
- `POST /api/workflow-memory/{workflow_id}`
- `POST /api/generate`
- `GET /api/workflow/model-status/{workflow_id}`
- `GET /api/workflow/node-map/{workflow_id}`

Recommended new endpoints:

- `GET /api/agent/workflows`
  - returns safe registry of active workflow ids, labels, kinds, accepted params, status, and known working settings

- `POST /api/agent/plan`
  - input: user message, optional image/video refs, current tab, session id
  - output: structured plan, no generation

- `POST /api/agent/prepare`
  - input: approved or edited plan
  - output: exact `workflow_id` and params that would be sent to `/api/generate`

- `POST /api/agent/run`
  - input: prepared payload id or exact approved payload
  - validates and calls `/api/generate`

## Structured Plan Schema

The agent should return JSON like:

```json
{
  "intent": "create_image",
  "workflow_id": "z-image",
  "workflow_label": "Z-Image Txt2Img",
  "confidence": 0.86,
  "reason": "User asked for an image and named a Z-Image LoRA.",
  "params": {
    "prompt": "cinematic portrait of Sara wearing a clown costume...",
    "negative": "blurry, low quality, deformed hands...",
    "width": 1024,
    "height": 1024,
    "steps": 11,
    "cfg": 1,
    "seed": -1,
    "loras": [
      {
        "name": "zimage_turbo/sara-zimageturbo-120526_copy_0.safetensors",
        "strength": 1
      }
    ]
  },
  "memory_used": [
    "Sara Z-Image LoRA works best with direct face/hair identity words."
  ],
  "warnings": [],
  "requires_approval": true
}
```

## Workflow Choice Rules

Initial routing:

- Z-Image Txt2Img:
  - fastest working image generation
  - Z-Image character LoRAs
  - general image requests

- FLUX2-KLEIN:
  - user explicitly says Flux/Klein
  - selected LoRA is under `flux2klein/`
  - current baseline: around 8 steps, CFG around 1.2

- FireRed Edit:
  - user wants image editing/instruction edit with uploaded image

- Qwen Rapid Edit:
  - user wants rapid image edit, especially where FireRed is weak

- Qwen Multi Angle:
  - user wants angle variants from a reference image

- LTX Img2Vid:
  - user wants to animate one image
  - use Ollama vision caption to draft motion prompt

- LTX First / Last:
  - user has first and last keyframes

Avoid using:

- parked Qwen Txt2Img
- Chroma unless explicitly requested, until quality is improved
- WAN/Steady Dancer unless user knows it is still in build/test state

## Memory Strategy

V1 memory sources:

- workflow memory JSON
- agent chat session memory SQLite
- workflow audit checklist
- module registry statuses
- recent successful prompts/settings saved by user

Memory should be visible:

- show which memories influenced the plan
- allow user to remove bad memory
- allow user to pin a good run
- allow user to mark output as good/bad

Do not silently learn every chat line. Store only:

- successful prompts/settings
- confirmed LoRA trigger words
- known bad settings
- workflow-specific quality notes
- user-approved preferences

## Prompting Pattern

The agent system prompt should include:

- active workflow registry
- current verified/lab/parked statuses
- workflow constraints
- available LoRAs
- recent workflow memory
- user request

The agent should respond with:

1. short natural language summary
2. structured plan JSON
3. editable fields in UI
4. approval action

## Safety / Reliability Rules

- Never auto-run v1 plans.
- Never use a LoRA from the wrong model family.
- Never use parked workflows unless user explicitly asks.
- If a LoRA is selected, verify the file exists.
- If a model is missing, show exact missing file/status.
- If confidence is low, ask one concise clarification.
- Keep all runtime data local.
- Do not make MemPalace a hard installer dependency yet.

## First Implementation Slice

Build only this first:

1. Add `UI Agent` main card and route.
2. Create `UIAgentPage.tsx` with chat + plan preview.
3. Add `GET /api/agent/workflows`.
4. Add `POST /api/agent/plan`.
5. Agent can plan but not run.
6. Support these workflows first:
   - Z-Image Txt2Img
   - FLUX2-KLEIN
   - FireRed Edit
   - Qwen Rapid Edit
   - LTX Img2Vid
7. Show generated plan with editable fields.
8. Add `Approve & Generate` later after plan quality is stable.

## Acceptance Test

User enters:

> create a image using sara zimage lora and in a clown costume

Expected:

- UI Agent selects Z-Image Txt2Img.
- It picks a Z-Image/Sara LoRA only if installed.
- It writes a prompt with clown costume, identity details, and good image language.
- It sets safe Z-Image defaults.
- It shows memory used.
- It asks for approval before running.

User enters:

> make Aurora with flux klein, fashion photo, red dress

Expected:

- UI Agent selects FLUX2-KLEIN.
- It picks `flux2klein/auroraskonberg_flux2-klein-base9b_000001250.safetensors` if installed.
- It uses about 8 steps and CFG 1.2.
- It puts Aurora identity/trigger words into the character/trigger field.
- It asks for approval before running.

## Handoff Note

This is a major feature. Do not implement it as a loose chat page. The value is structured workflow planning, visible memory, editable payloads, and safe approval before generation.
