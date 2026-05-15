# Benchmark dataset

## What's included

After `bun run build:benchmark`:

- **9** hand-labelled [First Dollar](https://app.firstdollar.money/) submissions
- **200** synthetic proxy cases (Replit / Gitcoin / freelance patterns)
- More when you add Kaggle CSVs (see below)

## Add thousands from Kaggle

1. Download datasets (free):

   | Source | URL | Save as |
   |--------|-----|---------|
   | Replit Bounties | [kaggle.com/datasets/ibrahimonmars/replit-bounties-dataset](https://www.kaggle.com/datasets/ibrahimonmars/replit-bounties-dataset) | `raw/replit-bounties.csv` |
   | Freelance contracts | [kaggle.com/datasets/asaniczka/freelance-contracts-dataset-1-3-million-entries](https://www.kaggle.com/datasets/asaniczka/freelance-contracts-dataset-1-3-million-entries) | `raw/freelance-contracts.csv` |
   | Freelance projects | [kaggle.com/datasets/prtpljdj/freeelance-platform-projects](https://www.kaggle.com/datasets/prtpljdj/freeelance-platform-projects) | `raw/freelance-projects.csv` |

2. (Optional) Gitcoin academic dataset — email authors for CSV, save as `raw/gitcoin-bounties.csv`

3. Rebuild:

   ```bash
   cd apps/web
   bun run build:benchmark
   ```

4. Restart dev server and open `/benchmark`

## Run size

Benchmarks sample **25 cases per run** by default (API cost control). Adjust in the UI or `?limit=50`.

## First Dollar live submissions

First Dollar has no public submission API. Add new hand-labelled rows to `app/lib/benchmark/first-dollar-seed.ts`, then rebuild.
