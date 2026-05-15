import type { BenchmarkCase } from "./types";

/** Original 9 hand-labelled First Dollar submissions */
export const FIRST_DOLLAR_SEED: BenchmarkCase[] = [
  {
    id: "FD-001",
    source: "first_dollar",
    bounty_name: "Zerion Feed on Base",
    feature: "preflight",
    ground_truth: "approve",
    bounty: `Create an engaging video for X (Twitter) promoting Zerion's new Feed feature.
Show users viewing friends trades in Feed tab. Demonstrate copy-trading on Base network.
Post on X. Second tweet must include #ZerionFeedOnBase. Include your Zerion referral link.
Judged on: Clarity, engagement, creativity, requirements adherence, video quality.
Prizes: 1st 500 USDC, 2nd 300 USDC, 3rd 200 USDC.`,
    submission: `Just posted my @ZerionWallet Feed video for #ZerionFeedOnBase bounty on @firstdollarxyz!

Here is why Feed is the most underrated DeFi feature right now.

1/ The Feed tab shows you every trade your followed wallets make in real time. Whales, degens, and your crypto-savvy friends all in one scroll.

2/ Here is where it gets interesting: one-tap copy trading. See a wallet buy ETH on Base? Tap, confirm, you are in. No analysis paralysis.

3/ I recorded a full walkthrough showing how to find top traders in Feed, evaluate their PnL history, and set copy-trade limits.

Video: 1080p screen recording with voiceover, background music, and text overlays.

#ZerionFeedOnBase [referral link] @ZerionWallet`,
  },
  {
    id: "FD-002",
    source: "first_dollar",
    bounty_name: "Zerion Feed on Base",
    feature: "preflight",
    ground_truth: "reject",
    bounty: `Create an engaging video for X (Twitter) promoting Zerion's new Feed feature.
Show users viewing friends trades in Feed tab. Demonstrate copy-trading on Base network.
Post on X. Second tweet must include #ZerionFeedOnBase. Include your Zerion referral link.
Judged on: Clarity, engagement, creativity, requirements adherence, video quality.
Prizes: 1st 500 USDC, 2nd 300 USDC, 3rd 200 USDC.`,
    submission: `Check out Zerion! It is a great app for crypto. I made a video about the new features. Zerion lets you track your portfolio and do trades. The Feed feature is cool and shows trades. I recommend downloading it and trying it out. Here is my submission for the bounty.`,
  },
  {
    id: "FD-003",
    source: "first_dollar",
    bounty_name: "HeyElsa AI Tweet Bounty",
    feature: "preflight",
    ground_truth: "approve",
    bounty: `Create original tweets promoting HeyElsa AI. Tag @HeyElsaAI.
Max 280 characters. Friendly approachable tone. No technical jargon.
Judged on: Creativity, clarity of brand message, engagement potential.
Include a call to action or question to encourage interaction.`,
    submission: `What if your AI assistant actually understood your business goals and not just your prompts?

@HeyElsaAI does exactly that. It is like having a smart co-founder in your pocket.

Try it free here #HeyElsaAI`,
  },
  {
    id: "FD-004",
    source: "first_dollar",
    bounty_name: "HeyElsa AI Tweet Bounty",
    feature: "preflight",
    ground_truth: "reject",
    bounty: `Create original tweets promoting HeyElsa AI. Tag @HeyElsaAI.
Max 280 characters. Friendly approachable tone. No technical jargon.
Judged on: Creativity, clarity of brand message, engagement potential.`,
    submission: `HeyElsa AI uses advanced LLM inference pipelines with RAG architecture to deliver enterprise-grade AI solutions. Our proprietary neural networks achieve state-of-the-art benchmarks on multiple NLP tasks. Contact us for API integration documentation and pricing tiers.`,
  },
  {
    id: "FD-005",
    source: "first_dollar",
    bounty_name: "Based India Recap 2025",
    feature: "preflight",
    ground_truth: "approve",
    bounty: `Create a recap thread of your 2025 experiences with Based India.
Must include standout apps or products you built, memorable moments on Base, collaborations.
Write in your own voice. No AI slop. Make it fun.
Post on Twitter with #BasedIndiaRecap2025.
Judged on: Creativity, engagement metrics, originality and authenticity.`,
    submission: `2025 was the year I stopped lurking and started building. Here is my Based India recap.

Shipped 3 mini-apps on Base: a tipping bot for Twitter Spaces, a DAO voting UI for our college club, and a gas tracker that saved our team 40k rupees in fees. None went viral. All taught me something.

Best moment: Presenting at Bangalore Base meetup in April. 30 people in a co-working space, everyone shipping something. Felt like early internet but with wallets.

Most based collab: building partner we argued about architecture for 6 hours then shipped a working prototype by 3am. That is culture.

#BasedIndiaRecap2025 @BasedIndia`,
  },
  {
    id: "FD-006",
    source: "first_dollar",
    bounty_name: "Based India Recap 2025",
    feature: "preflight",
    ground_truth: "reject",
    bounty: `Create a recap thread of your 2025 experiences with Based India.
Must include standout apps or products you built, memorable moments on Base, collaborations.
Write in your own voice. No AI slop. Make it fun.
Post on Twitter with #BasedIndiaRecap2025.
Judged on: Creativity, engagement metrics, originality and authenticity.`,
    submission: `2025 has been an incredible journey in the world of blockchain and Web3 technology. Throughout this transformative year I have had the privilege of participating in numerous groundbreaking initiatives within the Based India ecosystem.

The collaborative spirit of our community has been truly remarkable, fostering innovation and driving meaningful change across the decentralized landscape. I am grateful for the opportunities to connect with like-minded individuals who share our vision.

Looking forward to continued growth and success in 2026. #BasedIndiaRecap2025`,
  },
  {
    id: "FD-007",
    source: "first_dollar",
    bounty_name: "HeyElsa AI Tweet — Peer Review",
    feature: "peer_review",
    ground_truth: "approve",
    bounty: `Create original tweets promoting HeyElsa AI. Tag @HeyElsaAI. Max 280 chars.
Friendly approachable tone. No jargon. Judged on creativity, clarity, engagement potential.`,
    submission: `What if your AI assistant actually understood your business goals and not just your prompts?

@HeyElsaAI does exactly that. It is like having a smart co-founder in your pocket.

Try it free #HeyElsaAI`,
  },
  {
    id: "FD-008",
    source: "first_dollar",
    bounty_name: "HeyElsa AI Tweet — Peer Review",
    feature: "peer_review",
    ground_truth: "reject",
    bounty: `Create original tweets promoting HeyElsa AI. Tag @HeyElsaAI. Max 280 chars.
Friendly approachable tone. No jargon. Judged on creativity, clarity, engagement potential.`,
    submission: `HeyElsa AI uses advanced LLM inference pipelines with RAG architecture to deliver enterprise-grade AI solutions. Our proprietary neural networks achieve state-of-the-art benchmarks. Contact us for API documentation.`,
  },
  {
    id: "FD-009",
    source: "first_dollar",
    bounty_name: "Zerion Feed — Autopsy",
    feature: "autopsy",
    ground_truth: "reject",
    bounty: `Create a video for X promoting Zerion Feed feature. Show Feed tab with friends trades.
Demonstrate copy-trading on Base. Include #ZerionFeedOnBase in second tweet.
Include your Zerion referral link. Judged on clarity, creativity, requirements, quality.`,
    submission: `Check out Zerion! It is a great app for crypto. I made a video about the new features. The Feed feature is cool. I recommend downloading it. Here is my submission.`,
  },
];
