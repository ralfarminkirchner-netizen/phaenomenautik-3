export interface NpcMemoryEntry {
  met: boolean;
  topics: string[];
  favors: number;
}

export type NpcMemories = Record<string, NpcMemoryEntry>;

const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Older saves may omit memory or contain malformed fields. Keep usable topics. */
export function ensureNpcMemory(save: { npcMemory?: unknown }): NpcMemories {
  const entries = record(save.npcMemory) ? Object.entries(save.npcMemory) : [];
  const memory: NpcMemories = Object.fromEntries(entries.map(([id, value]) => {
    const entry = record(value) ? value : {};
    const topics = Array.isArray(entry.topics)
      ? entry.topics.filter((topic): topic is string => typeof topic === "string")
      : typeof entry.topics === "string" ? [entry.topics] : [];
    return [id, {
      ...entry,
      met: entry.met === true,
      topics,
      favors: typeof entry.favors === "number" && Number.isFinite(entry.favors) ? entry.favors : 0,
    }];
  }));
  save.npcMemory = memory;
  return memory;
}
