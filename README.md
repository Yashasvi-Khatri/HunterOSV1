# HunterOS

A comprehensive operating system for bounty hunters built with **Next.js**, **Turborepo**, and **OpenRouter** — featuring AI chat, model comparison, bounty intelligence tools, performance benchmarking, and trust scoring.

## Features

### 🤖 Core AI Features
- 🚀 **Streaming responses** — word-by-word output like ChatGPT
- 🤖 **Model switcher** — GPT-4o, Claude, Gemini, Llama, Mistral, and 400+ more
- 💬 **Chat history** — persisted in localStorage, survives page refreshes
- 🌗 **Dark / Light mode**
- 👤 **User personalization** — AI addresses you by name
- ⚙️ **Custom system prompt** — control AI's behavior

### 🎯 Bounty Intelligence Tools
- **Pre-flight Check** — Browser + AI combined submission validation
- **Peer Review Simulator** — 3-persona consensus evaluation (Technical, Business, Skeptic)
- **Rejection Autopsy** — AI-powered diagnosis of failed submissions
- **Model Recommendations** — Best AI model selection for specific tasks

### 📊 Performance & Trust
- **Benchmark Suite** — Real First Dollar bounty dataset validation with metrics
- **Trust Score System** — User trustworthiness evaluation and scoring
- **Cost Tracking** — Real-time token usage and cost monitoring

### 🏗️ Infrastructure
- **Turborepo monorepo** — shared UI components and configs
- **API Routes** — Modular backend architecture
- **Storage System** — Local data persistence and management

## Project Structure

```
hunter-os/
├── apps/
│   └── web/                    # Next.js HunterOS application
│       ├── app/
│       │   ├── api/
│       │   │   ├── chat/         # Streaming API route
│       │   │   ├── compare/      # Model comparison API
│       │   │   ├── bounty/        # Bounty intelligence API
│       │   │   └── benchmark/    # Performance testing API
│       │   ├── components/         # React UI components
│       │   │   ├── HunterOSLogo.tsx
│       │   │   ├── Sidebar.tsx
│       │   │   ├── ChatArea.tsx
│       │   │   ├── CostMeter.tsx
│       │   │   └── TrustScoreBadge.tsx
│       │   ├── hooks/              # Custom React hooks
│       │   ├── lib/               # Types, models, storage utils
│       │   │   ├── models.ts
│       │   │   ├── storage.ts
│       │   │   ├── trustScore.ts
│       │   │   └── costs.ts
│       │   ├── scripts/            # Utility scripts
│       │   │   └── benchmark.ts    # Performance runner
│       │   ├── (pages)/           # Route pages
│       │   │   ├── chat/           # Main chat interface
│       │   │   ├── compare/        # Model comparison
│       │   │   ├── bounty/         # Bounty tools
│       │   │   ├── benchmark/      # Benchmark results
│       │   │   ├── trust-score/     # Trust scoring
│       │   │   └── pricing/        # Pricing page
│       │   ├── layout.tsx          # Root layout
│       │   └── page.tsx           # Home page
│       └── ...config files
└── packages/
    ├── ui/                     # Shared React components
    ├── eslint-config/          # Shared ESLint rules
    └── typescript-config/      # Shared TypeScript settings
```

## Getting Started

### 1. Clone and install

```bash
git clone <your-repo>
cd hunter-os
bun install
```

### 2. Get your OpenRouter API key

1. Go to [https://openrouter.ai](https://openrouter.ai)
2. Sign up for a free account
3. Navigate to **Keys** → **Create Key**
4. Copy your key

### 3. Set up environment variables

```bash
cp apps/web/.env.example apps/web/.env.local
```

Edit `apps/web/.env.local`:
```
OPENROUTER_API_KEY=sk-or-v1-your-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run development server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## Available Features

### 🤖 AI Chat
- **Main Chat Interface**: Talk with 400+ AI models
- **Model Comparison**: Test prompts across multiple models simultaneously
- **Cost Tracking**: Real-time token usage and cost monitoring

### 🎯 Bounty Intelligence
- **Pre-flight Check**: Validate submissions before submission
- **Peer Review**: Get AI-powered feedback from multiple perspectives
- **Rejection Autopsy**: Understand why submissions were rejected
- **Model Recommendations**: Choose the best AI for specific tasks

### 📊 Performance Tools
- **Benchmark Suite**: Test against real First Dollar bounty data
- **Trust Score**: Evaluate user trustworthiness
- **Performance Metrics**: Accuracy, precision, recall, F1 scores

## How It Works

```
User interacts with HunterOS interface
        ↓
Next.js pages (client-side)
        ↓
API Routes (/api/chat, /api/compare, /api/bounty, /api/benchmark)
        ↓
OpenRouter API ← your API key stays secure (server-side)
        ↓
400+ AI Models (GPT-4o, Claude, Gemini, Llama, etc.)
        ↓
Streaming responses with real-time updates
```

## Adding More Models

Edit `apps/web/app/lib/models.ts` and add entries to `AVAILABLE_MODELS`.
Find model IDs at [https://openrouter.ai/models](https://openrouter.ai/models).

## Running Benchmarks

Test HunterOS performance with real bounty data:

```bash
# Make sure dev server is running
bun run dev

# Run benchmark suite
node apps/web/scripts/benchmark.ts
```

## Tech Stack

| | |
|---|---|
| **Platform** | HunterOS - Bounty Hunter OS |
| **Framework** | Next.js 14 + TypeScript |
| **Package Manager** | Bun |
| **Styling** | Tailwind CSS |
| **AI Routing** | OpenRouter (400+ models) |
| **Storage** | localStorage + IndexedDB |
| **Architecture** | Turborepo Monorepo |
| **APIs** | RESTful routes (/api/chat, /api/compare, /api/bounty, /api/benchmark) |
| **Testing** | Real First Dollar bounty dataset |

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
