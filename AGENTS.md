# Bat Jump contributor instructions

This is an original public game and a disposable development-test fixture. Read README.md before editing.

- Use a unique `codex/test/<scenario>/<agent-id>` branch and isolated checkout. Do not write to main, the shared regression fixture branch or another agent's branch.
- Keep work within the task. Do not add a framework, vendor service, remote asset, analytics or credentials.
- Run `npm test` and `npm run build` after changes. The separate regression branch is intentionally broken before the fix; record the expected failing command before editing.
- Create draft PRs only. A scoring-fix PR targets `codex/score-edge-fixture`; a feature PR targets main. Do not merge, deploy, release or change repository settings.
- Keep Buzz runtime IDs, private evidence and secrets in the private tracker, never here. Public evidence may contain only this public game's code and sanitized output.
- Prefix comments posted on the user's behalf with 🤖. Issue bodies and PR descriptions do not need the prefix.
- Sign off commits. An AI agent committing with a human identity credits itself with a Co-authored-by trailer.
