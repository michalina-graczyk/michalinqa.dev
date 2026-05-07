#!/usr/bin/env node
/**
 * Wait for the "Cloudflare Pages" check run on a given commit, then write its
 * preview URL to $GITHUB_ENV as BASE_URL.
 *
 * Why Node and not bash+jq? The Playwright container image doesn't ship jq,
 * and we want to avoid an apt-get step. Node is already provisioned by the
 * shared setup action, so this is the lightest available option.
 *
 * Inputs (env):
 *   GH_TOKEN     GitHub token with repo:read on this repo
 *   REPO         "owner/name"
 *   SHA          commit SHA to query
 *   GITHUB_ENV   provided by Actions; we append BASE_URL=... to it
 *
 * The CF Pages check_run summary is human-readable HTML and not a stable API.
 * If Cloudflare ever changes the format, update the regex below.
 */
import { appendFileSync } from "node:fs";

const { GH_TOKEN, REPO, SHA, GITHUB_ENV } = process.env;
if (!GH_TOKEN || !REPO || !SHA) {
  console.error("Missing required env: GH_TOKEN, REPO, SHA");
  process.exit(2);
}

const POLL_INTERVAL_MS = 15_000;
const MAX_ATTEMPTS = 60; // 60 * 15s = 15 min cap
const CHECK_NAME = "Cloudflare Pages";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchCheck() {
  const res = await fetch(
    `https://api.github.com/repos/${REPO}/commits/${SHA}/check-runs`,
    {
      headers: {
        Authorization: `Bearer ${GH_TOKEN}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    },
  );
  if (!res.ok) {
    throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
  }
  const body = await res.json();
  // If CF retries, multiple runs can share the name; take the most recent.
  const matches = (body.check_runs ?? []).filter((r) => r.name === CHECK_NAME);
  return matches.at(-1);
}

function extractPreviewUrl(summary) {
  if (!summary) return null;
  const flat = summary.replace(/\n/g, " ");
  // Look specifically for the "Branch Preview URL" row to avoid grabbing the
  // dashboard link by accident.
  const m = flat.match(/Branch Preview URL[\s\S]*?href='(https:\/\/[^']+)'/);
  return m?.[1] ?? null;
}

for (let i = 1; i <= MAX_ATTEMPTS; i++) {
  let run;
  try {
    run = await fetchCheck();
  } catch (e) {
    console.log(`attempt ${i}: fetch error: ${e.message}`);
    await sleep(POLL_INTERVAL_MS);
    continue;
  }

  const status = run?.status ?? "missing";
  const conclusion = run?.conclusion ?? "";
  console.log(`attempt ${i}: status=${status} conclusion=${conclusion}`);

  if (status === "completed") {
    if (conclusion !== "success") {
      console.error(`Cloudflare Pages check finished with conclusion=${conclusion}`);
      process.exit(1);
    }
    const url = extractPreviewUrl(run.output?.summary);
    if (!url) {
      console.error("Could not extract preview URL from CF Pages check summary");
      console.error("Summary was:", run.output?.summary);
      process.exit(1);
    }
    appendFileSync(GITHUB_ENV, `BASE_URL=${url}\n`);
    console.log(`BASE_URL=${url}`);
    process.exit(0);
  }

  await sleep(POLL_INTERVAL_MS);
}

console.error("Timed out waiting for Cloudflare Pages check run");
process.exit(1);
