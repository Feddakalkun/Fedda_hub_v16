# FEDDA Hub v16 Handoff

## Current Goal

Turn FEDDA Hub into a modular core + booster-pack architecture while preserving the working v15 behavior.

## Current State

- v16 repo clone exists at `H:\Fedda-Hub\Fedda_hub_v16\Fedda_hub_v16_repo`.
- v16 install test clone exists at `H:\Fedda-Hub\Fedda_hub_v16\Fedda_hub_v16_install\app`.
- v15 backup exists at `H:\Fedda-Hub\backup\Fedda_hub_v15_repo_pre_v16_modules_20260601_233127`.
- First frontend module registry has been added at `frontend/src/modules/registry.ts`.
- App/home/workflow-card navigation now reads from the registry.
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

1. Add backend module manifest support so workflows, model preflights, node packs, and installer dependencies can be grouped by module.
2. Convert installer config (`config/nodes.json`, workflow/model checks, install scripts) to understand core vs booster modules.
3. Replace or bridge `frontend/src/config/navigation.ts` with the new module registry.
4. Only after the registry is stable, begin moving individual workflow families into module folders.
5. Keep repo clone and install clone synchronized after each commit.

## Known Loose Ends

- `frontend/src/config/navigation.ts` still exists and may duplicate registry concepts for secondary navigation helpers.
- `frontend/public/cards/industrial/` remains untracked in v15 and was intentionally not copied from untracked git state.
- GitHub repo `Feddakalkun/Fedda_hub_v16` may need to be created before first push.
- `npm audit` currently reports 3 moderate and 5 high issues inherited from the existing dependency set.
