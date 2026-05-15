export type BenchmarkFeature = "preflight" | "peer_review" | "autopsy";
export type GroundTruth = "approve" | "reject";
export type BenchmarkSource =
  | "first_dollar"
  | "replit"
  | "gitcoin"
  | "freelance"
  | "synthetic";

export interface BenchmarkCase {
  id: string;
  source: BenchmarkSource;
  bounty_name: string;
  feature: BenchmarkFeature;
  ground_truth: GroundTruth;
  bounty: string;
  submission: string;
}

export interface DatasetMeta {
  total: number;
  by_source: Record<string, number>;
  by_feature: Record<string, number>;
  bounty_names: string[];
  sources_label: string;
}
