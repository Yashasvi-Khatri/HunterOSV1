import type { BenchmarkCase, GroundTruth } from "./types";

interface BountyTemplate {
  name: string;
  bounty: string;
  approve: string;
  reject: string;
}

/** Replit / Gitcoin / freelance-style templates (proxy labels until Kaggle CSV is imported) */
const TEMPLATES: BountyTemplate[] = [
  {
    name: "Replit — Fix Auth Bug in Express API",
    bounty: `Fix the session persistence bug in our Express + SQLite API.
Reproduce: login works but refresh loses session. Add tests. PR must pass CI.
Judged on: root cause fix, test coverage, clear PR description.`,
    approve: `Found the issue: session cookie missing \`sameSite: lax\` and store not persisting on serverless cold starts.

Changes:
- Set cookie options in auth middleware
- Switched to connect-sqlite3 with persistent path
- Added integration test reproducing refresh flow

PR #42 — all 12 tests pass. Loom walkthrough: [link]. Deployed to staging, verified login survives refresh.`,
    reject: `I changed some code. It should work now. I think the problem is cookies. Let me know if you need more changes.`,
  },
  {
    name: "Replit — Build Landing Page in Next.js",
    bounty: `Ship a responsive marketing landing page in Next.js 14.
Must include hero, 3 feature sections, pricing table, and contact form wired to Formspree.
Mobile-first. Lighthouse performance score 90+.`,
    approve: `Deployed: https://preview.example.app

Implemented App Router layout, optimized images with next/image, lazy-loaded below-fold sections.
Lighthouse: Performance 94, Accessibility 98, SEO 100.
Formspree endpoint tested — 3 test submissions received.
Source: github.com/example/landing — README has setup steps.`,
    reject: `Here is my landing page. I used HTML and CSS. It looks good on my laptop. Contact form not working yet but I can fix later.`,
  },
  {
    name: "Replit — Python Data Pipeline",
    bounty: `Build a CSV ingestion pipeline that normalizes user events and loads to Postgres.
Handle 100k rows. Include retry logic and dead-letter logging.
Deliver: script + Dockerfile + brief architecture note.`,
    approve: `Pipeline ingests 100k rows in 4m12s on t3.medium.

Architecture: S3 trigger → Lambda validator → SQS → worker → Postgres COPY.
Retries: exponential backoff, DLQ after 3 failures with row-level error JSON.
Tests: pytest with 12 fixtures including malformed CSV edge cases.
Run: docker compose up — documented in ARCHITECTURE.md.`,
    reject: `I wrote a python script that reads csv and inserts to database. It works for small files. Did not test 100k rows.`,
  },
  {
    name: "Gitcoin — Open Source Docs Improvement",
    bounty: `Improve README and add CONTRIBUTING.md for our Web3 wallet SDK.
Must include install steps, 3 code examples, and troubleshooting section.
Judged on clarity, accuracy, and developer onboarding time.`,
    approve: `PR adds:
- Quickstart with npm install + first transaction in <20 lines
- Examples: connect wallet, sign message, send on Base
- Troubleshooting: common RPC errors, chain mismatch, gas estimation

Tested all snippets on Node 20. Onboarded a new contributor who shipped a PR in 2 hours using only the docs.`,
    reject: `Updated readme with more information about the project. The SDK is very powerful and has many features for developers.`,
  },
  {
    name: "Freelance — Blog Post on DeFi UX",
    bounty: `Write a 800-word blog post on improving DeFi onboarding UX.
Audience: non-crypto natives. Include 2 real product examples and actionable tips.
No jargon. Original work only.`,
    approve: `Draft: "Three friction points killing DeFi onboarding"

1. Wallet setup — compared Rainbow vs Coinbase Wallet first-run flows with screenshots
2. Gas abstraction — how Base Pay removes the "what is gas" moment
3. Social proof — Feed-style copy trading as trust shortcut

Word count: 847. Flesch reading ease: 62. All examples verified March 2025.`,
    reject: `DeFi is the future of finance. Blockchain technology enables decentralized applications with unprecedented transparency and users should adopt Web3 immediately for maximum yield optimization.`,
  },
  {
    name: "Freelance — Logo Design for SaaS",
    bounty: `Design a minimalist logo for B2B analytics SaaS "MetricFlow".
Deliver: SVG, PNG (light/dark), and 1-page brand rationale.
Avoid cliché chart icons. Must work at 32px favicon size.`,
    approve: `Deliverables in Figma link + exported assets.

Concept: abstract flow lines forming an "M" without literal bar charts.
Tested at 32px favicon — readable on #0a0a0a and #ffffff backgrounds.
Rationale covers typography pairing (Inter), color tokens (#6366f1 primary), and usage dos/don'ts.`,
    reject: `Here is a logo I made quickly. It has charts because it is analytics. Let me know if you want changes.`,
  },
  {
    name: "Replit — React Dashboard Widget",
    bounty: `Add a real-time revenue chart widget to our React admin dashboard.
Use Recharts. Data from existing /api/metrics endpoint. Support date range filter.
Must match existing Tailwind design system.`,
    approve: `Widget merged to main.

- Recharts AreaChart with 7d/30d/90d toggle
- Fetches /api/metrics?range= — debounced 300ms
- Matches design tokens: rounded-xl, border white/10, indigo gradient fill
- Storybook story + unit test for empty state

Screenshot + 45s demo video attached.`,
    reject: `Added a chart library. The chart shows data. I did not add date filter yet.`,
  },
  {
    name: "Gitcoin — Smart Contract Audit Fix",
    bounty: `Fix critical findings from internal audit on ERC-20 staking contract.
Finding #1: reentrancy on withdraw. Finding #2: incorrect reward calculation.
Submit patch + Foundry tests proving fixes.`,
    approve: `Patches both findings:

1. withdraw() now follows CEI — state updated before external call
2. rewardPerToken accumulator fixed — test case \`test_multi_user_stake_unstake\` added

Foundry: 28/28 pass. Gas snapshot within 2% of baseline.
Audit response doc maps each finding to commit hash.`,
    reject: `I read the audit and made some security improvements. The contract should be safer now.`,
  },
  {
    name: "Freelance — Twitter Thread for Product Launch",
    bounty: `Write a 5-tweet launch thread for AI writing tool "DraftPilot".
Tone: founder-led, specific benefits, include one customer quote.
Tag @DraftPilotAI. No hashtag spam.`,
    approve: `Thread draft:

1/ We built DraftPilot because I wasted 6 hours/week re-prompting ChatGPT for the same client tone.
2/ It learns your voice from 3 sample posts — not generic "professional"
3/ Customer @sarahbuilds: "First draft usable 80% of the time"
4/ Live today: draftpilot.ai — free tier, no credit card
5/ What would you auto-draft first? Reply below @DraftPilotAI`,
    reject: `DraftPilot is an innovative AI-powered solution leveraging cutting-edge NLP to revolutionize content creation workflows for enterprise stakeholders.`,
  },
  {
    name: "Replit — Mobile Responsive Fix",
    bounty: `Fix mobile layout breakage on checkout page (iOS Safari).
Breakpoints below 390px overflow horizontally. Deliver PR with before/after screenshots.`,
    approve: `Root cause: fixed-width payment iframe + padding on parent.

Fix: flex layout, min-width 0 on iframe container, safe-area-inset padding.
Tested iPhone SE, 14 Pro, iPad — screen recordings attached.
PR #88 — Playwright visual regression test added for 375px viewport.`,
    reject: `I added media queries. It looks better on mobile now. Please check on your phone.`,
  },
];

function assignFeature(
  index: number,
  groundTruth: GroundTruth,
): BenchmarkCase["feature"] {
  if (groundTruth === "reject" && index % 17 === 0) return "autopsy";
  if (index % 11 === 0) return "peer_review";
  return "preflight";
}

/** ~200 synthetic cases mirroring public bounty platform patterns */
export function generateSyntheticCases(count = 200): BenchmarkCase[] {
  const cases: BenchmarkCase[] = [];
  let n = 0;

  while (cases.length < count) {
    for (const t of TEMPLATES) {
      if (cases.length >= count) break;

      for (const ground_truth of ["approve", "reject"] as const) {
        if (cases.length >= count) break;
        n += 1;
        const variant = Math.floor(n / TEMPLATES.length);
        const uid = `SYN-${String(n).padStart(4, "0")}`;
        cases.push({
          id: uid,
          source: n % 3 === 0 ? "replit" : n % 3 === 1 ? "gitcoin" : "freelance",
          bounty_name: variant > 0 ? `${t.name} (v${variant})` : t.name,
          feature: assignFeature(n, ground_truth),
          ground_truth,
          bounty: `${t.bounty}\n\n[Benchmark case ${uid}]`,
          submission:
            ground_truth === "approve"
              ? `${t.approve}\n\nVerification ref: ${uid} — staging tested, criteria met.`
              : `${t.reject}\n\nRef: ${uid} — missing deliverables and acceptance criteria.`,
        });
      }
    }
  }

  return cases.slice(0, count);
}
