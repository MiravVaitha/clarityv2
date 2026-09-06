#!/usr/bin/env bash
#
# Keeps the *scheduler* alive, not the database.
#
# GitHub disables a scheduled workflow in a public repository after 60 days with
# no activity, and does it quietly — no failed run, just one email that is easy
# to miss. A keepalive that switches itself off after two quiet months is worse
# than no keepalive at all, because you stop expecting the pause emails.
#
# This is load-bearing here, not hypothetical: the gap before this workflow was
# added was 66 days. Whenever the repo has gone quiet enough to be at risk, push
# a dated stamp. During active development it never fires; during a genuinely
# quiet year it costs about seven one-line commits.
#
# Unlike a repo that isn't hosted anywhere, a commit on main here triggers a
# Vercel production rebuild. That is one rebuild per ~50 quiet days, which is
# cheaper than the branch juggling needed to avoid it.

set -euo pipefail

THRESHOLD_DAYS=50 # 10 days of slack before GitHub's 60
STAMP=".github/keepalive-stamp"

last_commit=$(git log -1 --format=%ct)
days=$(( ( $(date +%s) - last_commit ) / 86400 ))

if [ "${FORCE:-false}" != "true" ] && [ "$days" -lt "$THRESHOLD_DAYS" ]; then
  echo "Last commit ${days}d ago, under the ${THRESHOLD_DAYS}d threshold — no heartbeat needed."
  exit 0
fi

echo "Last commit ${days}d ago — pushing a heartbeat so the schedule survives."

date -u +%Y-%m-%dT%H:%M:%SZ > "$STAMP"

git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"

# Scoped on purpose. `git add -A` here would sweep up whatever the ping step left
# in the working tree.
git add "$STAMP"

if git diff --cached --quiet; then
  echo "Stamp unchanged — nothing to commit."
  exit 0
fi

git commit -m "chore: keepalive heartbeat (resets GitHub's 60-day workflow timer)"

# Explicit refspec rather than a bare `git push`. This line only ever runs after
# 50 quiet days, so it is the worst possible place to depend on the checkout
# having configured upstream tracking.
git push origin "HEAD:${GITHUB_REF_NAME:-main}"
