# FEDDA v16 UI + LLM Memory Redesign Plan

Date: 2026-06-05

Goal: make FEDDA feel like one coherent local AI studio, with workflow pages that are easier to operate and an LLM helper that remembers workflow-specific decisions instead of acting like a one-off prompt button.

## Research Notes

Sources checked:

- MemPalace GitHub: https://github.com/mempalace/mempalace
- MemPalace official docs: https://mempalaceofficial.com/
- MemPalace palace concept: https://mempalaceofficial.com/concepts/the-palace
- MemPalace MCP tools reference: https://mempalaceofficial.com/reference/mcp-tools.html
- MemPalace memory stack docs: https://mempalaceofficial.com/concepts/memory-stack.html
- MemPalace specialist agents docs: https://mempalaceofficial.com/concepts/agents.html
- MemPalace knowledge graph docs: https://mempalaceofficial.com/concepts/knowledge-graph.html
- Critical MemPalace analysis: https://arxiv.org/abs/2604.21284
- Agent memory survey: https://arxiv.org/abs/2603.07670
- Modular LLM memory survey: https://arxiv.org/abs/2604.01707

Important takeaways for FEDDA:

- MemPalace is useful as a design pattern even before adopting it as a dependency.
- The strongest practical idea is not the palace metaphor itself, but local-first verbatim storage plus scoped retrieval.
- The spatial hierarchy can map cleanly to FEDDA:
  - wing = workflow family, such as Z-Image, Qwen, WAN, LTX
  - room = task mode, such as txt2img, edit, dual-lora, steady-dancer
  - hall = facts, settings, prompts, failures, user preferences, model notes
  - drawer = exact remembered event, prompt, setting, output note, failure log, user preference
- Specialist agent diaries map well to FEDDA helper roles:
  - prompt architect
  - workflow troubleshooter
  - quality reviewer
  - install/runtime ops
- Memory must not be a hidden magic layer. The UI should show what the helper knows, what it is using, and let the user pin or delete memories.

## UI Direction

The core page shape should be:

1. Global system header
2. Workflow identity row
3. Top preview/history bar
4. One contained cockpit frame
5. Generate/apply action

Simple image workflow cockpit:

- Prompt first, full width.
- LoRAs second, compact and horizontal when possible.
- Settings third, in a dense control grid:
  - size
  - steps
  - CFG if relevant
  - seed
  - negative prompt / advanced
- Generate button full width at the bottom.
- No right preview pane.
- No quick-preset strip unless the workflow has a proven, useful mode toggle.

Complex workflow cockpit:

- Use staged vertical sections when the workflow has dependency order:
  - source
  - preparation
  - generated intermediate
  - approval
  - final run
- Keep top preview/history, but use a large work surface only for:
  - masks
  - video trim
  - pose/camera controls
  - comparison
  - approval of intermediate images

## FEDDA Memory / Prompt Copilot Direction

Phase 1: local workflow notes, no new dependency.

- Add a backend memory store as simple JSON or SQLite.
- Store per workflow:
  - successful prompts
  - bad prompts
  - working settings
  - known crashes
  - model/node fixes
  - user preferences
  - quality notes
- Expose in UI as a small "Copilot memory" drawer, not a large panel.
- Let user:
  - pin current prompt/settings
  - mark output as good/bad
  - ask "why did this fail?"
  - ask "suggest settings for this workflow"

Phase 2: MemPalace-compatible architecture.

- Add a local memory adapter with the same conceptual structure:
  - wing
  - room
  - hall
  - drawer
- Keep adapter pluggable:
  - built-in SQLite first
  - MemPalace MCP optional later
- Do not make install depend on MemPalace until it is proven stable in FEDDA.

Phase 3: workflow-aware assistant.

- Prompt helper should receive:
  - active workflow id
  - chosen model family
  - LoRA names and trigger words
  - recent successful settings
  - user style preferences
  - known model constraints
- It should return:
  - prompt
  - negative prompt
  - recommended settings
  - short explanation
  - optional "remember this" recommendation

## Migration Order

Simple image pages first:

1. Z-Image Txt2Img
2. FireRed Edit
3. Qwen Rapid Edit
4. Qwen Image
5. Qwen Reference
6. Chroma Simple
7. Chroma1-HD
8. FLUX2-KLEIN

Complex/staged pages later:

1. Qwen Multi Angle
2. Z-Image Dual LoRA
3. Steady Dancer
4. WAN Story
5. LTX First / Last

## Quality Gates

For every migrated workflow page:

- no right preview pane unless justified
- top preview/history present
- no giant inactive model-stack panel
- no quick setup block unless it changes workflow behavior meaningfully
- prompt and generate action visible without hunting
- direct settings controls visible
- browser Back and app Back both behave naturally
- TypeScript build passes
- actual generation preview appears in the top bar

## Current Implementation State

- `SimpleImageCockpit` exists and is the base for `Txt2ImgPage`.
- `ZImageTxt2Img` uses the cockpit base.
- Quick setup presets were removed from `Txt2ImgPage` consumers.
- App hash navigation exists.
- Back button exists.
- Phase 1 memory store has started:
  - backend stores workflow memory in local `config/workflow_memory.json`
  - `GET /api/workflow-memory/{workflow_id}`
  - `POST /api/workflow-memory/{workflow_id}`
  - `DELETE /api/workflow-memory/{workflow_id}/{entry_id}`
  - `PromptAssistant` sends `workflow_id` to `/api/ollama/prompt`
  - Ollama prompt generation prepends recent workflow memory when entries exist
  - `SimpleImageCockpit` has a compact "Remember setup" action for saving prompt/settings/LoRAs
  - `SimpleImageCockpit` now includes a compact memory drawer with recent entries, refresh, empty state, and delete action
- Next best work:
  - verify Z-Image generation preview after the revised vertical cockpit
  - restart backend before testing the memory endpoints in the live app
  - migrate FireRed and Qwen Rapid visually using the same cockpit
  - then evaluate whether a MemPalace MCP adapter is worth adding
