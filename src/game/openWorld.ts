// One persisted world clock. The rooms are places in that world, not chapters.
export type RoomId = "bay" | "harbor" | "shelter";
export const ROOMS: { id: RoomId; name: string; x: number; z: number; arrivalX: number; arrivalZ: number; reason: string }[] = [
  { id: "bay", name: "Flimmerbucht", x: 2420, z: 3230, arrivalX: 2420, arrivalZ: 3320, reason: "Licht auf dem Wasser verfolgen" },
  { id: "harbor", name: "Werkhafen", x: 2270, z: 3300, arrivalX: 2360, arrivalZ: 3300, reason: "Etwas gestalten oder weitergeben" },
  { id: "shelter", name: "Stiller Strand", x: 1150, z: 3050, arrivalX: 1290, arrivalZ: 3050, reason: "Ruhe, Abstand oder ein Gespräch suchen" },
];

export interface KnowledgeEntry { at: number; source: "seen" | "heard"; fact: string }
export interface ObservationNote {
  id: string;
  room: RoomId;
  at: number;
  facts: string[];
  interpretation: string;
  question: string;
  revisions: { at: number; text: string; previous: string }[];
}
export interface OpenWorldState {
  seconds: number;
  dayStart: number;
  timeOfDay: number;
  weather: "calm" | "breeze" | "rain";
  weatherOverride?: "calm" | "breeze" | "rain" | null;
  windAngle: number;
  activeRoom: RoomId | null;
  camera?: { yaw: number; pitch: number; distance: number; room: RoomId | null };
  bay: { reflectorAngle: number; covered: boolean; reference: boolean; viewpoint: "shore" | "offset"; knowledge: KnowledgeEntry[]; offsetKnowledge: KnowledgeEntry[] };
  harbor: {
    inventory: { wood: number; rope: number };
    task: "none" | "repair" | "supplies";
    recipient: "Mara" | "Tove" | null;
    delivered: { wood: number; rope: number };
    knowledge: { Mara: KnowledgeEntry[]; Tove: KnowledgeEntry[] };
    lastDelivery: { wood: number; rope: number; recipient: "Mara" | "Tove"; task: "repair" | "supplies"; at: number } | null;
  };
  shelter: { seatAngle: number; path: "near" | "wide"; invitation: boolean; boundary: "quiet" | "conversation"; knowledge: KnowledgeEntry[] };
  notes: ObservationNote[];
}
const clamp = (n: number, low: number, high: number) => Math.max(low, Math.min(high, n));
const angle = (n: number) => ((n % 360) + 360) % 360;
const angleDistance = (a: number, b: number) => Math.abs(((angle(a - b) + 180) % 360) - 180);
const roomById = (id: RoomId) => ROOMS.find((room) => room.id === id)!;

export function createOpenWorld(timeOfDay = 9.4): OpenWorldState {
  const s: OpenWorldState = {
    seconds: 0, dayStart: timeOfDay, timeOfDay, weather: "calm", weatherOverride: null, windAngle: 0.4, activeRoom: null,
    bay: { reflectorAngle: 25.5, covered: false, reference: false, viewpoint: "shore", knowledge: [], offsetKnowledge: [] },
    harbor: { inventory: { wood: 4, rope: 2 }, task: "none", recipient: null, delivered: { wood: 0, rope: 0 }, knowledge: { Mara: [], Tove: [] }, lastDelivery: null },
    shelter: { seatAngle: 0, path: "near", invitation: false, boundary: "quiet", knowledge: [] },
    notes: [],
  };
  stepOpenWorld(s, 0);
  return s;
}

export function ensureOpenWorld(save: { openWorld?: OpenWorldState; timeOfDay?: number }): OpenWorldState {
  save.openWorld ??= createOpenWorld(Number.isFinite(save.timeOfDay) ? save.timeOfDay : 9.4);
  return save.openWorld;
}

export function stepOpenWorld(s: OpenWorldState, dt: number): void {
  if (!Number.isFinite(dt) || dt < 0) return;
  s.seconds += dt;
  s.timeOfDay = ((s.dayStart + s.seconds / 25) % 24 + 24) % 24;
  s.windAngle = 0.4 + Math.sin(s.seconds / 260) * 0.5;
  const rain = worldStorm(s);
  s.weather = s.weatherOverride ?? (rain > 0.68 ? "rain" : rain > 0.18 ? "breeze" : "calm");
  if (s.shelter.boundary === "conversation" && sampleFields(s, 1150, 3050).soundMask >= 0.45) s.shelter.boundary = "quiet";
}
function stormAt(seconds: number): number { return clamp((Math.sin(seconds / 140 - 1.5) + 1) / 2, 0, 1); }
function worldStorm(s: OpenWorldState): number {
  return s.weatherOverride === "rain" ? 0.85 : s.weatherOverride === "breeze" ? 0.35 : s.weatherOverride === "calm" ? 0.03 : stormAt(s.seconds);
}
export function setWorldWeather(s: OpenWorldState, weather: OpenWorldState["weather"] | null): void {
  s.weatherOverride = weather;
  stepOpenWorld(s, 0);
}
export function setWorldTime(s: OpenWorldState, timeOfDay: number): void {
  if (!Number.isFinite(timeOfDay)) return;
  s.dayStart = ((timeOfDay - s.seconds / 25) % 24 + 24) % 24;
  stepOpenWorld(s, 0);
}

export function sampleFields(s: OpenWorldState, x: number, z: number) {
  const storm = worldStorm(s);
  // A quiet pocket at the strand and a gustier channel outside the harbor.
  const shelterDistance = Math.hypot(x - 1150, z - 3050);
  const shelter = Math.exp(-shelterDistance / 140);
  const gust = Math.sin(s.seconds / 7 + x / 430 + z / 510) * 0.75;
  const windSpeed = Math.max(1, (5 + storm * 8 + gust) * (1 - shelter * 0.62));
  const windAngle = s.windAngle + Math.sin(x / 600 + z / 710) * 0.18;
  const tide = Math.sin(s.seconds * Math.PI * 2 / 240) * 0.42;
  const flow = 0.45 + storm * 0.75;
  return {
    windX: Math.cos(windAngle) * windSpeed, windZ: Math.sin(windAngle) * windSpeed, windSpeed,
    currentX: Math.sin(z / 620 + s.seconds / 85) * flow,
    currentZ: Math.cos(x / 710 + s.seconds / 95) * flow,
    tide, storm, visibility: 1100 - storm * 680,
    soundMask: clamp(windSpeed / 23 + storm * 0.5 - shelter * 0.12, 0, 1),
  };
}

export function bayOptics(s: OpenWorldState, viewpoint: OpenWorldState["bay"]["viewpoint"] = s.bay.viewpoint) {
  const bay = s.bay;
  const fields = sampleFields(s, 2420, 3230);
  const sunAzimuth = (s.timeOfDay - 6) / 12 * 180;
  const viewpointAngle = viewpoint === "shore" ? 0 : 40;
  const requiredReflectorAngle = angle((sunAzimuth + viewpointAngle) / 2);
  const windJitter = Math.sin(s.seconds * 1.7) * fields.windSpeed * 0.4;
  const reflectionAngle = angle(2 * bay.reflectorAngle - sunAzimuth + windJitter);
  const lightAvailable = s.timeOfDay >= 6 && s.timeOfDay <= 19 && fields.storm < 0.82;
  const aligned = angleDistance(reflectionAngle, viewpointAngle) <= 16;
  return { lightAvailable, aligned, visible: lightAvailable && aligned && !bay.covered,
    reflectionAngle, viewpointAngle, requiredReflectorAngle, windJitter, referenceStable: bay.reference };
}

function witness(knowledge: KnowledgeEntry[], s: OpenWorldState, source: KnowledgeEntry["source"], fact: string) {
  const last = knowledge[knowledge.length - 1];
  if (last?.fact === fact && last.source === source) return;
  knowledge.push({ at: s.seconds, source, fact });
}
function weatherName(s: OpenWorldState): string { return s.weather === "rain" ? "Regen" : s.weather === "breeze" ? "auffrischender Wind" : "ruhiges Wetter"; }
function bayFact(s: OpenWorldState, viewpoint: OpenWorldState["bay"]["viewpoint"] = s.bay.viewpoint): string {
  const optics = bayOptics(s, viewpoint);
  if (s.bay.covered) return "Die Abdeckung liegt auf den Reflektoren. Kein Lichtfleck trifft den Beobachtungsort.";
  if (!optics.lightAvailable) return "Die Reflektoren sind offen; Sonne oder Wolken lassen gerade keinen deutlichen Lichtfleck zu.";
  if (!optics.aligned) return "Die Reflektoren sind offen; der Lichtfleck liegt außerhalb des gewählten Beobachtungsorts.";
  return s.bay.reference ? "Der Lichtfleck liegt an der festen Vergleichsmarke und schwankt mit dem Wind." : "Am gewählten Beobachtungsort erscheint ein Lichtfleck; ohne feste Marke fehlt ein Vergleich für sein Schwanken.";
}

export function describeRoom(s: OpenWorldState, room: RoomId): string[] {
  const place = roomById(room), fields = sampleFields(s, place.x, place.z);
  const environment = `${weatherName(s)}, Wind ${fields.windSpeed.toFixed(1)} m/s, Tide ${fields.tide >= 0 ? "+" : ""}${fields.tide.toFixed(2)} m. Sicht etwa ${Math.round(fields.visibility)} m.`;
  if (room === "bay") return [environment, bayFact(s), `Reflektoren ${Math.round(s.bay.reflectorAngle)}°, Blick ${s.bay.viewpoint === "shore" ? "vom Ufer" : "seitlich"}; Vergleichsmarke ${s.bay.reference ? "gesetzt" : "noch nicht gesetzt"}.`];
  if (room === "harbor") {
    const h = s.harbor;
    return [environment, `Im Lager liegen ${h.inventory.wood} Holz und ${h.inventory.rope} Seil. Weitergegeben: ${h.delivered.wood} Holz und ${h.delivered.rope} Seil.`,
      h.task === "none" ? "Du hast noch keine Arbeit gewählt. Mara und Tove kennen nur, was sie gesehen oder gehört haben." : `Deine Absicht: ${h.task === "repair" ? "Steg ausbessern" : "Vorräte weitergeben"}. ${h.recipient ? `${h.recipient} ist als Empfängerin gewählt.` : "Eine Empfängerin ist noch offen."}`,
      h.delivered.wood >= 2 && h.delivered.rope >= 1 ? "Am Steg liegen jetzt Holz und Seil zur Ausbesserung bereit." : "Am Steg fehlt Material für die Ausbesserung."];
  }
  const sh = s.shelter;
  return [environment, `Der Sitz steht bei ${Math.round(sh.seatAngle)}°. Dein Weg führt ${sh.path === "wide" ? "mit Abstand um den Ruheplatz" : "nah am Ruheplatz vorbei"}.`,
    sh.boundary === "conversation" ? "Die Person am Strand hat deiner ausdrücklichen Einladung zum Gespräch zugestimmt." : "Die Person bleibt bei ihrer Ruhe. Nähe allein gilt hier nicht als Einladung oder Zustimmung.",
    fields.soundMask < 0.35 ? "Im Windschutz ist das Wasser deutlich zu hören." : "Wind und Regen überdecken einen Teil der leisen Geräusche."];
}

export function availableActions(s: OpenWorldState, room: RoomId): { id: string; label: string }[] {
  if (room === "bay") return [
    { id: "rotate-left", label: "Reflektoren 15° zurückdrehen" }, { id: "rotate-right", label: "Reflektoren 15° weiterdrehen" },
    { id: "cover", label: s.bay.covered ? "Abdeckung abnehmen" : "Reflektoren abdecken" },
    { id: "reference", label: s.bay.reference ? "Vergleichsmarke entfernen" : "Feste Vergleichsmarke setzen" },
    { id: "viewpoint", label: s.bay.viewpoint === "shore" ? "Seitlich beobachten" : "Vom Ufer beobachten" },
    { id: "ask-observer", label: "Beobachterin am Ufer nach ihrem Licht fragen" },
    { id: "ask-offset-observer", label: "Seitlichen Beobachter nach seinem Licht fragen" },
    { id: "share-shore", label: "Der Uferbeobachterin deine Sicht schildern" },
    { id: "share-offset", label: "Dem seitlichen Beobachter deine Sicht schildern" },
  ];
  if (room === "harbor") return [
    { id: "task-repair", label: "Holz und Seil für den Steg zusammenstellen" }, { id: "task-supplies", label: "Holz als Vorrat zusammenstellen" },
    { id: "choose-Mara", label: "Mara als Empfängerin wählen" }, { id: "choose-Tove", label: "Tove als Empfängerin wählen" },
    { id: "tell-Mara", label: "Mara von deiner Absicht erzählen" }, { id: "tell-Tove", label: "Tove von deiner Absicht erzählen" },
    { id: "ask-Mara", label: "Mara fragen, was sie darüber weiß" }, { id: "ask-Tove", label: "Tove fragen, was sie darüber weiß" },
    { id: "deliver", label: "Material tatsächlich weitergeben" },
    ...(s.harbor.lastDelivery ? [{ id: "undo-delivery", label: "Letzte Übergabe gemeinsam zurücknehmen" }] : []),
  ];
  return [
    { id: "seat", label: "Sitz um 90° drehen" }, { id: "path", label: s.shelter.path === "near" ? "Weg mit Abstand wählen" : "Nahen Weg wählen" },
    { id: "invite", label: "Ausdrücklich zu einem Gespräch einladen" }, { id: "withdraw", label: "Einladung zurücknehmen und Ruhe lassen" },
    { id: "talk", label: "Die Person ansprechen" }, { id: "listen", label: "Wasser und Wind zuhören" },
  ];
}

export function applyWorldAction(s: OpenWorldState, room: RoomId, action: string): string {
  if (action === "weather:calm" || action === "weather:breeze" || action === "weather:rain") {
    const weather = action.slice(8) as OpenWorldState["weather"];
    setWorldWeather(s, weather);
    return weather === "calm" ? "Der Wind wird ruhiger. Wasser, Sicht und Hörbarkeit folgen demselben Wetter." : weather === "breeze" ? "Eine Brise setzt ein. Segel, Wasser und Hörbarkeit reagieren darauf." : "Regen zieht auf. Wind, Wellen, Sicht und die Hörbarkeit von Gesprächen verändern sich zusammen.";
  }
  if (action === "time:dawn" || action === "time:noon" || action === "time:dusk") {
    const hour = action === "time:dawn" ? 7 : action === "time:noon" ? 12 : 18;
    setWorldTime(s, hour);
    return "Du betrachtest die Welt bei anderem Sonnenstand. Beobachtungen behalten ihren Zeitpunkt; Licht und Reflexion ändern sich.";
  }
  s.activeRoom = room;
  if (room === "bay") {
    const b = s.bay;
    if (action === "rotate-left" || action === "rotate-right") { b.reflectorAngle = angle(b.reflectorAngle + (action === "rotate-left" ? -15 : 15)); return bayFact(s); }
    if (action === "cover") { b.covered = !b.covered; return bayFact(s); }
    if (action === "reference") { b.reference = !b.reference; return b.reference ? "Die feste Marke erlaubt jetzt einen Vergleich desselben Orts bei wechselndem Licht und Wind." : "Du hast die Vergleichsmarke entfernt; Licht und Wind laufen weiter."; }
    if (action === "viewpoint") { b.viewpoint = b.viewpoint === "shore" ? "offset" : "shore"; return bayFact(s); }
    if (action === "ask-observer" || action === "ask-offset-observer") {
      const viewpoint = action === "ask-observer" ? "shore" : "offset";
      const fact = bayFact(s, viewpoint), knowledge = viewpoint === "shore" ? b.knowledge : b.offsetKnowledge;
      witness(knowledge, s, "seen", fact);
      return `${viewpoint === "shore" ? "Die Beobachterin am Ufer" : "Der seitliche Beobachter"} sieht diese Anordnung jetzt selbst: „${fact}“ Die Aussage gilt für diesen Moment und diesen eigenen Blickort.`;
    }
    if (action === "share-shore" || action === "share-offset") {
      const fact = `Du schilderst deinen Blick ${b.viewpoint === "shore" ? "vom Ufer" : "von der Seite"}: ${bayFact(s)}`;
      witness(action === "share-shore" ? b.knowledge : b.offsetKnowledge, s, "heard", fact);
      return "Nur die angesprochene Person hat deine Schilderung gehört. Sie unterscheidet diese Aussage von ihrer eigenen Sicht.";
    }
  }
  if (room === "harbor") {
    const h = s.harbor;
    if (action === "task-repair" || action === "task-supplies") { h.task = action === "task-repair" ? "repair" : "supplies"; return "Du hast deine Absicht geändert. Ohne Gespräch weiß noch niemand davon."; }
    if (action === "choose-Mara" || action === "choose-Tove") { h.recipient = action === "choose-Mara" ? "Mara" : "Tove"; return `${h.recipient} ist als Empfängerin gewählt; dadurch hört sie noch keine Absicht.`; }
    if (action === "tell-Mara" || action === "tell-Tove") {
      const person = action === "tell-Mara" ? "Mara" : "Tove";
      if (h.task === "none") return `${person}: „Sag mir, was du vorhast. Ich kann deine Absicht nicht erraten.“`;
      const fact = h.task === "repair" ? "Du möchtest Holz und Seil zur Ausbesserung des Stegs weitergeben." : "Du möchtest Holz als Vorrat weitergeben.";
      witness(h.knowledge[person], s, "heard", fact);
      return `${person} hat deine Absicht gehört: „${fact}“ Die andere Person war bei diesem Gespräch nicht dabei.`;
    }
    if (action === "ask-Mara" || action === "ask-Tove") {
      const person = action === "ask-Mara" ? "Mara" : "Tove", known = h.knowledge[person];
      return known.length ? `${person}: „${known[known.length - 1].fact}“ Das ist ihre letzte eigene Beobachtung oder gehörte Aussage; deine spätere Absicht kann anders sein.` : `${person}: „Du hast mir noch keine Absicht erzählt und noch nichts übergeben.“`;
    }
    if (action === "deliver") {
      if (h.task === "none" || !h.recipient) return "Wähle zuerst eine konkrete Zusammenstellung und eine Empfängerin. Du kannst auch ohne Übergabe weitersegeln.";
      const wood = h.task === "repair" ? 2 : 1, rope = h.task === "repair" ? 1 : 0;
      if (h.inventory.wood < wood || h.inventory.rope < rope) return "Im Lager liegt nicht genug Material für diese Zusammenstellung. Bereits abgegebenes Material bleibt am Ort.";
      h.inventory.wood -= wood; h.inventory.rope -= rope; h.delivered.wood += wood; h.delivered.rope += rope;
      h.lastDelivery = { wood, rope, recipient: h.recipient, task: h.task, at: s.seconds };
      const fact = `Du hast ${wood} Holz und ${rope} Seil tatsächlich an ${h.recipient} übergeben.`;
      witness(h.knowledge[h.recipient], s, "seen", fact);
      return `${fact} Die Materialien liegen nun dort; deine ungesprochene Absicht wird dadurch nicht mitgeteilt.`;
    }
    if (action === "undo-delivery" && h.lastDelivery) {
      const parcel = h.lastDelivery;
      h.inventory.wood += parcel.wood; h.inventory.rope += parcel.rope; h.delivered.wood -= parcel.wood; h.delivered.rope -= parcel.rope;
      witness(h.knowledge[parcel.recipient], s, "seen", "Die letzte Materialübergabe wurde gemeinsam zurückgenommen; das Material liegt wieder im Lager.");
      h.lastDelivery = null;
      return "Das letzte Paket liegt wieder im Lager. Die Erinnerung an das Gespräch und die frühere Übergabe bleibt erhalten.";
    }
  }
  if (room === "shelter") {
    const sh = s.shelter;
    if (action === "seat" || action === "path") {
      if (action === "seat") sh.seatAngle = angle(sh.seatAngle + 90);
      else sh.path = sh.path === "near" ? "wide" : "near";
      sh.invitation = false; sh.boundary = "quiet";
      return "Du hast die räumliche Anordnung geändert. Eine frühere Zustimmung gilt nicht automatisch für die neue Situation.";
    }
    if (action === "withdraw") { sh.invitation = false; sh.boundary = "quiet"; return "Du nimmst die Einladung zurück. Die Person bleibt ungestört am Ruheplatz."; }
    if (action === "invite") {
      sh.invitation = true;
      const fields = sampleFields(s, 1150, 3050);
      const comfortable = sh.path === "wide" && angleDistance(sh.seatAngle, 90) <= 45 && fields.soundMask < 0.45;
      sh.boundary = comfortable ? "conversation" : "quiet";
      const fact = comfortable ? "Die Einladung zum Gespräch wurde in dieser ruhigen Anordnung angenommen." : "Die Einladung wurde gehört; die Person möchte unter diesen Bedingungen bei ihrer Ruhe bleiben.";
      witness(sh.knowledge, s, "heard", fact);
      return comfortable ? "„Ja, ich möchte jetzt mit dir sprechen. Der Abstand und die Sitzrichtung passen für mich.“" : "„Danke für die Einladung. Jetzt möchte ich ruhig bleiben.“ Eine andere Anordnung kann später passen; sie verpflichtet niemanden zum Gespräch.";
    }
    if (action === "talk") {
      if (!sh.invitation || sh.boundary !== "conversation") return "Die Person möchte gerade ihre Ruhe. Du kannst den Ort genießen, ohne ein Gespräch zu führen.";
      if (sampleFields(s, 1150, 3050).soundMask >= 0.45) { sh.boundary = "quiet"; return "„Der Wind ist lauter geworden. Ich brauche jetzt wieder Ruhe.“ Für ein späteres Gespräch braucht es eine neue Einladung."; }
      return "„Als du Abstand gelassen und gefragt hast, konnte ich selbst entscheiden. Wir können eine Weile gemeinsam dem Wasser zuhören.“";
    }
    if (action === "listen") return describeRoom(s, room)[3];
  }
  return "Hier hat diese Handlung gerade keine Wirkung.";
}

export function addObservation(s: OpenWorldState, room: RoomId, interpretation = "", question = ""): string {
  const id = `observation-${s.notes.length + 1}-${Math.round(s.seconds * 1000)}`;
  s.notes.push({ id, room, at: s.seconds, facts: describeRoom(s, room), interpretation: interpretation.trim(), question: question.trim(), revisions: [] });
  return id;
}
export function reviseObservation(s: OpenWorldState, id: string, text: string): void {
  const note = s.notes.find((entry) => entry.id === id);
  if (!note || note.interpretation === text.trim()) return;
  note.revisions.push({ at: s.seconds, previous: note.interpretation, text: text.trim() });
  note.interpretation = text.trim();
}

// Imported JSON is checked before it can become the live world. An absent world
// is a supported old save; a present but malformed world must never be replaced.
export function isOpenWorldState(value: unknown): value is OpenWorldState {
  const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === "object" && !Array.isArray(v);
  const finite = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
  const bounded = (v: unknown, min: number, max: number) => finite(v) && v >= min && v <= max;
  const member = (v: unknown, choices: unknown[]) => choices.includes(v);
  const inventory = (v: unknown) => object(v) && bounded(v.wood, 0, 10000) && Number.isInteger(v.wood) && bounded(v.rope, 0, 10000) && Number.isInteger(v.rope);
  const timestamp = (v: unknown) => bounded(v, 0, object(value) && finite(value.seconds) ? value.seconds : 0);
  const knowledge = (v: unknown) => Array.isArray(v) && v.every((k) => object(k) && timestamp(k.at) && member(k.source, ["seen", "heard"]) && typeof k.fact === "string");
  if (!object(value) || !bounded(value.seconds, 0, Number.MAX_SAFE_INTEGER) || !bounded(value.dayStart, 0, 24) || !bounded(value.timeOfDay, 0, 24) || !finite(value.windAngle) || !member(value.weather, ["calm", "breeze", "rain"]) || !member(value.activeRoom, [null, "bay", "harbor", "shelter"])) return false;
  if (value.weatherOverride !== undefined && !member(value.weatherOverride, [null, "calm", "breeze", "rain"])) return false;
  if (value.camera !== undefined && (!object(value.camera) || !finite(value.camera.yaw) || !bounded(value.camera.pitch, -Math.PI, Math.PI) || !bounded(value.camera.distance, 1, 1000) || !member(value.camera.room, [null, "bay", "harbor", "shelter"]))) return false;
  const b = value.bay, h = value.harbor, sh = value.shelter;
  if (!object(b) || !bounded(b.reflectorAngle, 0, 360) || typeof b.covered !== "boolean" || typeof b.reference !== "boolean" || !member(b.viewpoint, ["shore", "offset"]) || !knowledge(b.knowledge) || !knowledge(b.offsetKnowledge)) return false;
  if (!object(h) || !inventory(h.inventory) || !inventory(h.delivered) || !member(h.task, ["none", "repair", "supplies"]) || !member(h.recipient, [null, "Mara", "Tove"]) || !object(h.knowledge) || !knowledge(h.knowledge.Mara) || !knowledge(h.knowledge.Tove)) return false;
  if (h.lastDelivery !== null) {
    const parcel = h.lastDelivery;
    if (!object(parcel) || !inventory(parcel) || !member(parcel.recipient, ["Mara", "Tove"]) || !member(parcel.task, ["repair", "supplies"]) || !timestamp(parcel.at) || !object(h.delivered)) return false;
    if (Number(parcel.wood) > Number(h.delivered.wood) || Number(parcel.rope) > Number(h.delivered.rope)) return false;
    if (parcel.task === "repair" ? parcel.wood !== 2 || parcel.rope !== 1 : parcel.wood !== 1 || parcel.rope !== 0) return false;
  }
  if (!object(sh) || !bounded(sh.seatAngle, 0, 360) || !member(sh.path, ["near", "wide"]) || typeof sh.invitation !== "boolean" || !member(sh.boundary, ["quiet", "conversation"]) || !knowledge(sh.knowledge) || (sh.boundary === "conversation" && !sh.invitation)) return false;
  if (!Array.isArray(value.notes)) return false;
  const ids = new Set<string>();
  return value.notes.every((n) => {
    if (!object(n) || typeof n.id !== "string" || !n.id || ids.has(n.id) || !member(n.room, ["bay", "harbor", "shelter"]) || !timestamp(n.at) || !Array.isArray(n.facts) || !n.facts.every((f) => typeof f === "string") || typeof n.interpretation !== "string" || typeof n.question !== "string" || !Array.isArray(n.revisions)) return false;
    ids.add(n.id);
    let previousTime = Number(n.at);
    return n.revisions.every((r) => {
      if (!object(r) || !timestamp(r.at) || Number(r.at) < previousTime || typeof r.text !== "string" || typeof r.previous !== "string") return false;
      previousTime = Number(r.at);
      return true;
    });
  });
}
