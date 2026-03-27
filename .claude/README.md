# Claude Code (project)

- **Skills** ([skills/](skills/)) — same content as [`.cursor/skills/`](../.cursor/skills/); model-invoked via description or `/skill-name` per [Claude Code skills](https://docs.claude.com/en/docs/claude-code/skills).
- **Agents** ([agents/](agents/)) — custom subagents for delegated tasks; referenced from skills or the Claude Code UI per [subagents](https://docs.claude.com/en/docs/claude-code/sub-agents).

Top-level [`.agents/`](../.agents/) duplicates agent definitions for tools that read that path instead of `.claude/agents/`.
