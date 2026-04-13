import type { ConditionSnapshot, RodSetup, SoftPlastic } from "./types";

export interface AIGuideRequest {
  question: string;
  snapshot: ConditionSnapshot;
  rods: RodSetup[];
  plastics: SoftPlastic[];
}

export interface AIGuideMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface AIGuideSession {
  id: string;
  messages: AIGuideMessage[];
  snapshot: ConditionSnapshot;
  created_at: number;
}
