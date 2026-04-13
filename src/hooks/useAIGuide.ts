"use client";

import { useState, useCallback } from "react";
import type { AIGuideMessage } from "@/engine/aiTypes";
import type { ConditionSnapshot, RodSetup, SoftPlastic } from "@/engine/types";

export function useAIGuide() {
  const [messages, setMessages] = useState<AIGuideMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (
      question: string,
      snapshot: ConditionSnapshot | null,
      rods: RodSetup[],
      plastics: SoftPlastic[]
    ) => {
      const userMsg: AIGuideMessage = {
        role: "user",
        content: question,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);
      setError(null);

      try {
        const res = await fetch("/api/guide", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question,
            snapshot,
            rods,
            plastics,
            history: messages.slice(-6), // send last 3 turns
          }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: "Unknown error" }));
          throw new Error(err.error || `API error ${res.status}`);
        }

        const data = await res.json();
        const assistantMsg: AIGuideMessage = {
          role: "assistant",
          content: data.content,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Guide unavailable");
      } finally {
        setLoading(false);
      }
    },
    [messages]
  );

  const clearSession = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, loading, error, sendMessage, clearSession };
}
