#!/bin/sh
# Tests for git-pull.sh / git-update.sh. Each test builds throwaway fixture
# repos (local bare upstreams + nested clones mimicking the website layout)
# under a mktemp dir and asserts exit codes, output, and git side effects.
# Nothing here touches the real working copies.
#
# Run: npm run test:git-scripts

set -u
REPO_ROOT=$(cd "$(dirname "$0")/.." && pwd)
PULL_SH="$REPO_ROOT/scripts/git-pull.sh"
UPDATE_SH="$REPO_ROOT/scripts/git-update.sh"

PASS=0
FAIL=0
FAILED_TESTS=""

ok() { PASS=$((PASS + 1)); echo "ok   - $1"; }
bad() { FAIL=$((FAIL + 1)); FAILED_TESTS="$FAILED_TESTS\n  $1"; echo "FAIL - $1"; }

assert_eq() { # name expected actual
  if [ "$2" = "$3" ]; then ok "$1"; else bad "$1 (expected [$2], got [$3])"; fi
}
assert_contains() { # name haystack needle
  case "$2" in
    *"$3"*) ok "$1" ;;
    *) bad "$1 (missing [$3] in output: $2)" ;;
  esac
}

# ── fixture builders ─────────────────────────────────────────────────────

GIT_COMMIT="git -c user.email=t@t -c user.name=t"

mkrepo() { # bare-path work-path branch — bare upstream + pushed initial commit
  git init -q --bare -b "$3" "$1.git"
  git clone -q "$1.git" "$2" 2>/dev/null
  echo init > "$2/seed.txt"
  (cd "$2" && $GIT_COMMIT add -A && $GIT_COMMIT commit -qm init && git push -qu origin "$3")
}

push_upstream() { # bare-path branch filename — land a new commit on the upstream
  local scratch
  scratch=$(mktemp -d)/scratch
  git clone -q "$1.git" "$scratch" 2>/dev/null
  echo "$(date +%s%N)" > "$scratch/$3"
  (cd "$scratch" && $GIT_COMMIT add -A && $GIT_COMMIT commit -qm "upstream $3" && git push -q origin "HEAD:$2")
}

new_fixture() { # builds the full nested layout; echoes the website-root path
  local root
  root=$(mktemp -d)
  # Parents first: git clone needs an empty target, so outer repos must
  # exist before the nested ones are cloned inside them.
  mkrepo "$root/up/website" "$root/work" main
  mkrepo "$root/up/experiment" "$root/work/docs/experiment" main
  mkrepo "$root/up/threshold" "$root/work/docs/experiment/threshold" main
  mkrepo "$root/up/psychojs" "$root/work/docs/experiment/threshold/psychojs" threshold-prod
  # The nested repos show as untracked in their parents; silence the noise.
  echo "docs/" > "$root/work/.gitignore"
  (cd "$root/work" && $GIT_COMMIT add .gitignore && $GIT_COMMIT commit -qm gitignore && git push -q)
  echo "threshold/" > "$root/work/docs/experiment/.gitignore"
  (cd "$root/work/docs/experiment" && $GIT_COMMIT add .gitignore && $GIT_COMMIT commit -qm gitignore && git push -q)
  echo "psychojs/" > "$root/work/docs/experiment/threshold/.gitignore"
  (cd "$root/work/docs/experiment/threshold" && $GIT_COMMIT add .gitignore && $GIT_COMMIT commit -qm gitignore && git push -q)
  echo "$root"
}

# ── git-pull.sh ──────────────────────────────────────────────────────────

test_pull_happy() {
  local root; root=$(new_fixture)
  push_upstream "$root/up/threshold" main feature.txt
  local out
  out=$(cd "$root/work" && sh "$PULL_SH" 2>&1)
  assert_eq "pull: happy path exits 0" 0 $?
  assert_eq "pull: threshold got upstream commit" \
    "$(git -C "$root/up/threshold.git" rev-parse main)" \
    "$(git -C "$root/work/docs/experiment/threshold" rev-parse HEAD)"
  rm -rf "$root"
}

test_pull_blocks_dirty_before_touching_anything() {
  local root; root=$(new_fixture)
  push_upstream "$root/up/website" main late.txt
  echo wip >> "$root/work/docs/experiment/threshold/seed.txt"
  local out
  out=$(cd "$root/work" && sh "$PULL_SH" 2>&1)
  assert_eq "pull: dirty tree exits 1" 1 $?
  assert_contains "pull: names the dirty repo" "$out" "docs/experiment/threshold"
  # all-or-nothing: the website repo (clean, later in the list) was NOT pulled
  assert_eq "pull: later repos untouched" \
    "$(git -C "$root/work" rev-parse HEAD)" \
    "$(git -C "$root/up/website.git" rev-parse main~1 2>/dev/null || echo x)"
  rm -rf "$root"
}

test_pull_never_autostashes() {
  local root; root=$(new_fixture)
  git -C "$root/work/docs/experiment/threshold" config rebase.autoStash true
  echo wip >> "$root/work/docs/experiment/threshold/seed.txt"
  (cd "$root/work" && sh "$PULL_SH" >/dev/null 2>&1)
  assert_eq "pull: autostash-configured dirty tree still blocked" 1 $?
  assert_eq "pull: no autostash created" "" \
    "$(git -C "$root/work/docs/experiment/threshold" stash list)"
  rm -rf "$root"
}

test_pull_allows_existing_stashes() {
  local root; root=$(new_fixture)
  (cd "$root/work/docs/experiment" && echo stash-me >> seed.txt && git stash -q)
  push_upstream "$root/up/experiment" main later.txt
  local out
  out=$(cd "$root/work" && sh "$PULL_SH" 2>&1)
  assert_eq "pull: clean tree + existing stash exits 0" 0 $?
  assert_eq "pull: stash untouched" 1 \
    "$(git -C "$root/work/docs/experiment" stash list | wc -l | tr -d ' ')"
  rm -rf "$root"
}

test_pull_untracked_warns_but_pulls() {
  local root; root=$(new_fixture)
  echo scratch > "$root/work/docs/experiment/scratch.txt"
  push_upstream "$root/up/experiment" main newer.txt
  local out
  out=$(cd "$root/work" && sh "$PULL_SH" 2>&1)
  assert_eq "pull: untracked-only exits 0" 0 $?
  assert_contains "pull: warns about untracked" "$out" "Untracked"
  rm -rf "$root"
}

# ── git-update.sh ────────────────────────────────────────────────────────

# check:ts runs for depths 1-2; fixtures stub it out.
stub_typechecks() {
  echo '{"scripts":{"check:ts":"true"}}' > "$1/work/docs/experiment/threshold/package.json"
  echo '{"scripts":{"check:ts":"true"}}' > "$1/work/docs/experiment/package.json"
}

test_update_blocks_conflict_markers() {
  local root; root=$(new_fixture)
  echo '<<<<<<< Updated upstream' >> "$root/work/seed.txt"
  local out
  out=$(cd "$root/work" && sh "$UPDATE_SH" "test msg" 0 2>&1)
  assert_eq "update: conflict markers exit 1" 1 $?
  assert_contains "update: reports markers" "$out" "Conflict markers"
  assert_eq "update: nothing committed" 2 \
    "$(git -C "$root/work" rev-list --count HEAD)"
  rm -rf "$root"
}

test_update_depth0_commits_and_pushes() {
  local root; root=$(new_fixture)
  echo change >> "$root/work/seed.txt"
  local out
  out=$(cd "$root/work" && sh "$UPDATE_SH" "test msg" 0 2>&1)
  assert_eq "update: depth 0 exits 0" 0 $?
  assert_contains "update: prefixed message" \
    "$(git -C "$root/work" log -1 --format=%s)" "for website: test msg"
  assert_eq "update: pushed" \
    "$(git -C "$root/work" rev-parse HEAD)" \
    "$(git -C "$root/up/website.git" rev-parse main)"
  rm -rf "$root"
}

test_update_rebases_when_behind_upstream() {
  local root; root=$(new_fixture)
  push_upstream "$root/up/website" main raced.txt
  echo change >> "$root/work/seed.txt"   # non-conflicting local change
  local out
  out=$(cd "$root/work" && sh "$UPDATE_SH" "test msg" 0 2>&1)
  assert_eq "update: behind -> commit+rebase exits 0" 0 $?
  assert_eq "update: upstream has both commits" \
    "$(git -C "$root/work" rev-parse HEAD)" \
    "$(git -C "$root/up/website.git" rev-parse main)"
  assert_contains "update: history is linear (rebased onto upstream)" \
    "$(git -C "$root/work" log --format=%s)" "upstream raced.txt"
  rm -rf "$root"
}

test_update_rebase_conflict_stops_loudly() {
  local root; root=$(new_fixture)
  # upstream and local both append to seed.txt: a real rebase conflict
  local scratch; scratch=$(mktemp -d)/scratch
  git clone -q "$root/up/website.git" "$scratch" 2>/dev/null
  echo upstream-edit >> "$scratch/seed.txt"
  (cd "$scratch" && $GIT_COMMIT add -A && $GIT_COMMIT commit -qm upstream-edit && git push -q)
  echo local-edit >> "$root/work/seed.txt"
  local out
  out=$(cd "$root/work" && sh "$UPDATE_SH" "test msg" 0 2>&1)
  assert_eq "update: rebase conflict exits 1" 1 $?
  assert_contains "update: conflict guidance printed" "$out" "rebase"
  assert_eq "update: conflicted push did not happen" \
    "$(git -C "$root/up/website.git" log -1 --format=%s)" "upstream-edit"
  rm -rf "$root"
}

test_update_blocks_mid_rebase() {
  local root; root=$(new_fixture)
  # leave the website fixture mid-rebase
  local scratch; scratch=$(mktemp -d)/scratch
  git clone -q "$root/up/website.git" "$scratch" 2>/dev/null
  echo upstream-edit >> "$scratch/seed.txt"
  (cd "$scratch" && $GIT_COMMIT add -A && $GIT_COMMIT commit -qm upstream-edit && git push -q)
  (cd "$root/work" && git fetch -q origin && echo local-edit >> seed.txt \
    && $GIT_COMMIT commit -qam local-edit && git rebase origin/main >/dev/null 2>&1)
  local out
  out=$(cd "$root/work" && sh "$UPDATE_SH" "test msg" 0 2>&1)
  assert_eq "update: mid-rebase exits 1" 1 $?
  assert_contains "update: mid-rebase named" "$out" "rebase"
  rm -rf "$root"
}

test_update_blocks_when_behind_upstream() {
  local root; root=$(new_fixture)
  push_upstream "$root/up/website" main raced.txt
  echo change >> "$root/work/seed.txt"
  local out
  out=$(cd "$root/work" && sh "$UPDATE_SH" "test msg" 0 2>&1)
  assert_eq "update: behind upstream exits 1" 1 $?
  assert_contains "update: says pull first" "$out" "Need to pull"
  assert_eq "update: behind = nothing committed" 2 \
    "$(git -C "$root/work" rev-list --count HEAD)"
  rm -rf "$root"
}

test_update_blocks_unpushed_psychojs_head() {
  local root; root=$(new_fixture)
  stub_typechecks "$root"
  # psychojs HEAD on a commit that is not on origin/threshold-prod
  (cd "$root/work/docs/experiment/threshold/psychojs" && echo local > local.txt && $GIT_COMMIT add -A && $GIT_COMMIT commit -qm local-only)
  echo change >> "$root/work/docs/experiment/threshold/seed.txt"
  local out
  out=$(cd "$root/work" && sh "$UPDATE_SH" "test msg" 2 2>&1)
  assert_eq "update: unpushed psychojs exits 1" 1 $?
  assert_contains "update: names threshold-prod" "$out" "threshold-prod"
  rm -rf "$root"
}

test_update_depth2_happy() {
  local root; root=$(new_fixture)
  stub_typechecks "$root"
  (cd "$root/work/docs/experiment/threshold/psychojs" && echo ok > ok.txt && $GIT_COMMIT add -A && $GIT_COMMIT commit -qm fine && git push -q origin HEAD:threshold-prod)
  echo change >> "$root/work/docs/experiment/threshold/seed.txt"
  local out
  out=$(cd "$root/work" && sh "$UPDATE_SH" "test msg" 2 2>&1)
  assert_eq "update: depth 2 exits 0" 0 $?
  assert_eq "update: threshold pushed" \
    "$(git -C "$root/work/docs/experiment/threshold" rev-parse HEAD)" \
    "$(git -C "$root/up/threshold.git" rev-parse main)"
  rm -rf "$root"
}

# ── run ──────────────────────────────────────────────────────────────────

run_test() { # fail loudly on a typo'd/missing test name
  if ! command -v "$1" >/dev/null 2>&1; then
    bad "$1 (test function not defined)"
    return
  fi
  "$1"
}

run_test test_pull_happy
run_test test_pull_blocks_dirty_before_touching_anything
run_test test_pull_never_autostashes
run_test test_pull_allows_existing_stashes
run_test test_pull_untracked_warns_but_pulls
run_test test_update_blocks_conflict_markers
run_test test_update_depth0_commits_and_pushes
run_test test_update_rebases_when_behind_upstream
run_test test_update_rebase_conflict_stops_loudly
run_test test_update_blocks_mid_rebase
run_test test_update_blocks_unpushed_psychojs_head
run_test test_update_depth2_happy

echo
echo "$PASS passed, $FAIL failed"
[ "$FAIL" = 0 ] || { printf "failed:%b\n" "$FAILED_TESTS"; exit 1; }
