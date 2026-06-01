# FEDDA Hub v16 Breadcrumbs

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
