import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { ConditionSnapshot, RodSetup, SoftPlastic } from "@/engine/types";
import type { AIGuideMessage } from "@/engine/aiTypes";

const client = new Anthropic();

function buildSystemPrompt(
  snapshot: ConditionSnapshot | null,
  rods: RodSetup[],
  plastics: SoftPlastic[]
): string {
  let ctx = `You are StrikeWave AI — an expert largemouth bass fishing guide. You give concise, tactical, opinionated advice. You're direct, knowledgeable, and practical. No fluff.`;

  if (snapshot) {
    const { weather, season, spawn_stage, water_clarity } = snapshot;
    ctx += `\n\nCURRENT CONDITIONS:
- Air temp: ${weather.temp_f}°F
- Water temp: ${weather.water_temp_f ? `${weather.water_temp_f.toFixed(1)}°F` : "unknown"}
- Wind: ${weather.wind_mph} mph
- Cloud cover: ${weather.cloud_cover_pct}%
- Precipitation: ${weather.precip_mm}mm
- Season: ${season}
- Spawn stage: ${spawn_stage}
- Water clarity: ${water_clarity}
- Moon: ${snapshot.solunar.moon_phase_name} (score: ${(snapshot.solunar.solunar_score * 10).toFixed(1)}/10)`;
  }

  if (rods.length > 0) {
    ctx += `\n\nANGLER'S RODS:\n` + rods.map((r) =>
      `- ${r.name}: ${r.rod_type}, ${r.rod_power} ${r.rod_action}, ${r.line_lb}lb ${r.line_type}` +
      (r.gear_ratio ? `, ${r.gear_ratio} gear ratio` : "") +
      `, primary lures: ${r.primary_lures.join(", ")}`
    ).join("\n");
  }

  if (plastics.length > 0) {
    ctx += `\n\nANGLER'S PLASTICS:\n` + plastics.map((p) =>
      `- ${p.name} (${p.brand ?? "unknown"}) — ${p.style}, ${p.color ?? "no color noted"}`
    ).join("\n");
  }

  ctx += `\n\nAnswer fishing questions using the angler's actual gear when relevant. Keep responses under 300 words unless a detailed breakdown is needed. Use bullet points for tactics lists.`;

  return ctx;
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "AI Guide is not configured. Add ANTHROPIC_API_KEY to .env.local" },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const { question, snapshot, rods, plastics, history } = body as {
      question: string;
      snapshot: ConditionSnapshot | null;
      rods: RodSetup[];
      plastics: SoftPlastic[];
      history: AIGuideMessage[];
    };

    if (!question?.trim()) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    const systemPrompt = buildSystemPrompt(snapshot, rods ?? [], plastics ?? []);

    // Build message history for multi-turn
    const messages: Anthropic.MessageParam[] = [
      ...(history ?? [])
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user", content: question },
    ];

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 600,
      system: systemPrompt,
      messages,
    });

    const content = response.content[0]?.type === "text" ? response.content[0].text : "";

    return NextResponse.json({ content });
  } catch (err) {
    console.error("Guide API error:", err);
    return NextResponse.json(
      { error: "AI Guide request failed. Check server logs." },
      { status: 500 }
    );
  }
}
