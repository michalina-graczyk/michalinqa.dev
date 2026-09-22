# Git Workflow Rules
When creating a new branch to push a PR, ALWAYS ensure you do not accidentally pull in unpushed local commits from the user's current branch unless explicitly asked.

To safely create a new PR branch from the remote main branch:
1. `git fetch origin main`
2. `git checkout -b <new-branch> origin/main`
3. Bring in the specific changes needed (e.g. `git checkout <previous-branch> -- <file>`)
4. Commit and push.

Do NOT just run `git checkout -b <new-branch>` from a dirty or ahead local branch without checking `git status` and `git log` first. This prevents cluttering the PR with unrelated local commits.
