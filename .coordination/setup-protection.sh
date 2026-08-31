#!/usr/bin/env bash
# One-time setup for the repo OWNER (Patrick): creates the `main-protection`
# ruleset so Oliver + Patrick can work in parallel without clobbering each other,
# and every merge is gated on the Pages deploy + skin-coherence check.
#
# Usage (run from this repo's checkout, as the owner account):
#   .coordination/setup-protection.sh
#
# Equivalent UI path: Settings → Rules → New branch ruleset (see
# .coordination/CONCURRENCY.md §One-time setup). This script does the same via API.
set -euo pipefail

REPO="${1:-PatiePatie/sports-med-site}"

if ! command -v gh >/dev/null 2>&1; then
  echo "❌ gh CLI not found. Install it: brew install gh, then: gh auth login"
  exit 1
fi
if ! gh auth status >/dev/null 2>&1; then
  echo "❌ Not logged into gh. Run: gh auth login"
  exit 1
fi

if [ "$(gh api "repos/$REPO" --jq .permissions.admin)" != "true" ]; then
  echo "❌ This account is not an admin on $REPO — only the owner (Patrick) can create rulesets."
  echo "   If you're Patrick, run this with your PatiePatie account."
  exit 1
fi

echo "About to create 'main-protection' (active, branch rule) on $REPO/main:"
echo "  · require PR (0 approvals — self-merge OK)"
echo "  · require checks: GitHub Pages + skin-coherence"
echo "  · require up-to-date branches · block force-push · block deletion"
read -r -p "Proceed? (y/N) " ans
[[ "$ans" =~ ^[Yy]$ ]] || { echo "Aborted."; exit 0; }

gh api -X POST "repos/$REPO/rulesets" \
  --input - <<'JSON'
{
  "name": "main-protection",
  "target": "branch",
  "enforcement": "active",
  "conditions": {
    "ref_name": { "include": ["refs/heads/main"], "exclude": [] }
  },
  "rules": [
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 0,
        "dismiss_stale_reviews_on_push": false,
        "require_code_owner_review": false,
        "required_review_thread_resolution": false
      }
    },
    {
      "type": "required_status_checks",
      "parameters": {
        "strict": true,
        "contexts": ["GitHub Pages", "skin-coherence"]
      }
    },
    { "type": "non_fast_forward" },
    { "type": "deletion" }
  ]
}
JSON

echo "✅ Ruleset created. main is now merge-only via PR."
echo "   Read .coordination/CONCURRENCY.md for the two-person workflow."