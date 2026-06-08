# FEDDA v16 UI System Standard

FEDDA workflow pages should feel like one compact local AI studio, not separate themed mini-apps.

## Core Layout

- Global app header stays fixed and owns system status, ComfyUI status, Ollama status, VRAM, tokens, and purge actions.
- Each workflow should use a shared workflow shell where possible.
- Put recent/live outputs in a compact top preview bar.
- Keep the main controls in the scrollable work area.
- Use a right output pane only when the workflow needs a large active work surface, comparison view, masking, staged approval, or video inspection.
- Simple txt2img/edit workflows should run full-width with no right preview pane.

## Visual Language

- Base palette: black, near-black, charcoal, grey, white.
- Use color only for functional meaning: ready, running, selected, warning, error, online/offline.
- Avoid page-specific purple, green, or cyan themes as dominant surfaces.
- Use 6-8px radii for tool panels and controls.
- Avoid huge empty boxes, nested cards, and fixed model-stack panels when the user cannot act on them.

## Required Shared Pieces

- `WorkflowShell` for two-pane workflow pages.
- `WorkflowShell` with `hideOutputPane` for simple full-width image pages.
- `WorkflowWorkbench` for full-width staged workflow pages.
- `WorkflowPreviewBar` for recent/live image previews.
- `SimpleImageCockpit` for simple txt2img/edit workflows with prompt, LoRA, size, steps, CFG, seed, negative prompt, and generate in one compact frame.
- `ImageOutputPanel` / `VideoOutputPanel` for final output review.
- Compact parameter sections instead of one-off large panels.

## Workflow Page Rules

- The user should immediately see:
  - what input is required
  - where the prompt lives
  - what settings matter
  - where generation starts
  - where output appears
- Advanced/debug controls should be collapsed or hidden until needed.
- Every image workflow should prefer the shared top preview bar.
- Do not keep a right-side preview panel just because the old layout had one.
- Avoid custom preview implementations inside individual pages unless the workflow truly needs special behavior.
- Simple image workflows should use one studio cockpit frame below the top preview bar, with prompt as the main first section and generation as the final full-width action.
- Prefer vertical task rhythm over permanent sidebars on simple pages:
  - prompt
  - LoRA/input
  - compact settings grid
  - generate
- Keep workflow helper actions such as memory/save in a compact cockpit toolbar, not in explanatory rows that consume page height.
- Avoid visible copy that explains UI features when a compact label or icon-like action is enough.
- See `docs/v16/UI_LLM_MEMORY_REDESIGN_PLAN.md` for the wider UI + LLM memory direction.
- Browser/app navigation should use lightweight hash state:
  - `#/home`
  - `#/image`
  - `#/video`
  - `#/tab/{workflow-tab}`
  - Back button should move workflow -> section -> home.

## Current First Pass

- Added `WorkflowPreviewBar`.
- Rewired `TopPreviewStrip` to use the shared preview bar.
- Added `SimpleImageCockpit` as the shared base for simple image workflows.
- Rebuilt `ZImageTxt2Img` / `Txt2ImgPage` around the cockpit base.
- Removed the quick preset block from simple image pages.
- Simple `Txt2ImgPage` workflows now use the full-width shell, hide the old right output pane, and keep output review in the top preview bar.
- Added app-level Back + Home controls and hash navigation without adding a router dependency.
- Latest cockpit pass moved workflow memory actions into a compact toolbar, tightened cockpit padding/gaps, expanded the LoRA grid to use more width, and reduced explanatory UI copy.
