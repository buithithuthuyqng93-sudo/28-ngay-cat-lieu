@AGENTS.md

## Spec-Driven Development (Spec Kit)

This project uses [Spec Kit](https://github.com/github/spec-kit) so future changes stay
documented instead of living only in chat history.

- `.specify/memory/constitution.md` — non-negotiable project principles (content safety,
  server-authoritative access control, Vietnamese-first UX, simplicity, mobile-first,
  transparency about mocked/unfinished pieces). Read this before making architectural
  decisions.
- `specs/001-28-day-challenge-platform/spec.md` — retroactive baseline spec describing
  everything already built (auth, free trial, paywall/unlock pacing, lessons, challenges,
  case library, resources, community, progress).
- For a new feature: use the `speckit-specify` skill (or read
  `.claude/skills/speckit-specify/SKILL.md` and follow it manually) to write
  `specs/00N-feature-name/spec.md` before writing code, unless it's a trivial fix.
- `speckit-plan`, `speckit-tasks`, `speckit-implement` skills carry a spec through to
  implementation. `speckit-converge` checks the codebase against spec/plan/tasks and
  appends any drift as new tasks — useful after a burst of ad-hoc changes.
