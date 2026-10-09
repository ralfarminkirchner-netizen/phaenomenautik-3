// ═══════════════════════════════════════════════════════════════════
// PHÄNOMENAUTIK — M4: Katalog der Phänomen-Netz-Knoten (Samen)
// Quellen: TRAUMAATLAS-Symptomatlas (atlasId) + redaktionelle
// Erweiterung. Jeder Knoten hat eine wahre Zeile (insight).
// Die 13 Bestandsphänomene stehen NICHT hier — sie bleiben in
// data.ts und werden in phenomenaGraph.ts verknüpft (Hauptstädte).
// ═══════════════════════════════════════════════════════════════════

import type { EdgeKind, GraphEdge, Intensity, NodeKind, PhenomenonText } from "./phenomenaGraph";

export interface PhenomenonSeed {
  id: string;
  name: string;
  epithet: string;
  cluster: string;
  kind: NodeKind;
  intensity: Intensity;
  hue: number;
  text: PhenomenonText;
  edges: GraphEdge[];
  atlasId?: string;
}

function n(
  id: string, name: string, epithet: string,
  cluster: string, kind: NodeKind, intensity: Intensity, hue: number,
  text: PhenomenonText, edges: GraphEdge[], atlasId?: string,
): PhenomenonSeed {
  return { id, name, epithet, cluster, kind, intensity, hue, text, edges, ...(atlasId ? { atlasId } : {}) };
}

function e(to: string, kind: EdgeKind): GraphEdge {
  return { to, kind };
}

// ─── ALARM & ERREGUNG (Der Alarm-Atoll) ────────────────────────────

const SEED_ALARM: PhenomenonSeed[] = [
  n("schreck", "Der Schreckreflex", "Springt höher als jede Gefahr", "alarm", "symptom", 2, 25, {
    intro: "Ein Knall — und der Körper ist schon gesprungen, bevor der Kopf weiß, warum.",
    verstehen: [
      "Du bleibst nach dem Zucken stehen und atmest aus. Lange. Der Reflex schaut dich erstaunt an.",
      "„Du wolltest mich schützen, schneller als Gedanken“, sagst du. Er nickt. Genau das war sein Auftrag.",
    ],
    frieden: "Der Reflex springt noch — aber er landet weicher, und er meldet sich danach ab.",
    insight: "Ein übersteigerter Schreckreflex ist Daueralarm des Hirnstamms — er warnt vor Gefahren, die einmal real waren. Verlängertes Ausatmen und sichere Umgebung senken die Grundbereitschaft.",
  }, [e("hypervigilanz", "komorbid"), e("trigger", "echo"), e("herzrasen", "komorbid")], "schreck"),

  n("schlaf", "Die Schlafwache", "Lässt dich nicht gehen und nicht bleiben", "alarm", "symptom", 2, 20, {
    intro: "Die Nacht hier ist voller kleiner Alarme — Einschlafen gilt als Verrat am Posten.",
    verstehen: [
      "Du zeigst der Wache den Himmel: kein Sturm, kein Feuer. Sie blinzelt müde.",
      "„Du darfst die Schicht abgeben“, sagst du. „Ich übernehme den Morgen.“ Sie setzt sich. Erstmals.",
    ],
    frieden: "Die Wache wird zum Nachtlicht: wachsam nur noch bei echtem Bedarf.",
    insight: "Ein- und Durchschlafstörungen gehören zum Hyperarousal: Das Nervensystem hält Schlaf für ungesicherte Zeit. Feste Abendrituale und ein sicherer Schlafort lehren es das Abschalten neu.",
  }, [e("hypervigilanz", "komorbid"), e("albtraum", "komorbid"), e("bleimuede", "uebergang")], "schlaf"),

  n("panik", "Die Panikwelle", "Baut sich aus dem Nichts auf", "alarm", "symptom", 2, 5, {
    intro: "Das Wasser war eben noch ruhig. Jetzt steht eine Wand aus Angst vor dir.",
    verstehen: [
      "Du kämpfst nicht gegen die Welle. Du lässt dich tragen — Wellen brechen, aber sie gehen auch vorbei.",
      "„Du bist eine Welle, kein Tsunami“, sagst du laut. Sie verliert sofort an Höhe.",
    ],
    frieden: "Die Welle wird zur Dünung: spürbar, aber sie trägt dich, statt dich unterzuziehen.",
    insight: "Panikattacken sind Fehlalarme des Körpers: Adrenalin steigt in Minuten und fällt von allein wieder — immer. Wer die Welle durchatmet statt sie zu bekämpfen, verkürzt sie messbar.",
  }, [e("herzrasen", "komorbid"), e("atemdruck", "komorbid"), e("schalter", "uebergang")], "panik"),

  n("atemdruck", "Der Enge Atem", "Schnaufer ohne Pause", "alarm", "symptom", 1, 12, {
    intro: "Die Luft auf dieser Bank ist dünn, als müsste man sie sich verdienen.",
    verstehen: [
      "Du atmest langsam aus, zweimal so lang wie ein. Der Enge Atem schnauft erleichtert mit.",
      "„Du hast nur Angst, ich ersticke“, sagst du. „Ich atme noch.“ Er lockert den Schal um deinen Hals.",
    ],
    frieden: "Er wird zu einem Windhauch, der dich ans Atmen erinnert, statt es dir zu nehmen.",
    insight: "Atemnot und Engegefühl ohne Befund sind Teil der Alarmkaskade: Der Brustkorb verspannt im Kampfmodus. Langes Ausatmen öffnet die Bremse des Vagusnervs.",
  }, [e("herzrasen", "komorbid"), e("panik", "komorbid")]),

  n("zittern", "Das Zittern", "Der Körper entlädt sich", "alarm", "zustand", 1, 30, {
    intro: "Alles hier vibriert: die Gräser, die Steine, deine Hände.",
    verstehen: [
      "Du lässt die Hände zittern, statt sie festzuhalten. Das Zittern wird ruhiger, weil es endlich darf.",
      "„Du bist keine Schwäche“, sagst du. „Du bist der Abfluss.“ Es nickt zitternd.",
    ],
    frieden: "Das Zittern wird zum Abschütteln eines Hundes nach dem Regen: kurz, ehrlich, vorbei.",
    insight: "Zittern nach Alarm ist die natürliche Entladung von Stresshormonen — Tiere schütteln sich nach der Flucht, Menschen unterdrücken es oft. Es zuzulassen beendet den Alarmkreislauf.",
  }, [e("schreck", "komorbid"), e("adrenalin", "komorbid")]),

  n("tunnelblick", "Der Tunnelblick", "Sieht nur noch die Gefahr", "alarm", "symptom", 1, 8, {
    intro: "Die Welt am Rand dieses Ortes ist unscharf. Nur der Punkt in der Mitte ist scharf.",
    verstehen: [
      "Du drehst den Kopf ganz langsam nach links und rechts. Der Tunnel weitet sich mit jedem Grad.",
      "„Es gibt mehr als das Eine“, sagst du. Er zwinkert die Ränder wieder herein.",
    ],
    frieden: "Er wird zum Fernglas, das du absetzen darfst, wann immer du willst.",
    insight: "Tunnelblick ist die sensorische Verengung im Alarmzustand — sinnvoll bei echter Gefahr, erschöpfend als Dauerzustand. Bewusstes Umschauen meldet dem Hirnstamm: Umgebung gescannt, nichts gefunden.",
  }, [e("hypervigilanz", "komorbid"), e("glocke", "komorbid")]),

  n("glocke", "Die Glocke", "Jedes Geräusch ist zu laut", "alarm", "symptom", 1, 35, {
    intro: "Auf dieser Anhöhe klingelt alles: das Meer, der Wind, dein eigener Schritt.",
    verstehen: [
      "Du benennst jedes Geräusch beim Namen: Wasser. Wind. Schritt. Die Glocke wird leiser mit jedem Namen.",
      "„Du wolltest nur, dass ich nichts überhöre“, sagst du. Sie stimmt einen leisen Ton an.",
    ],
    frieden: "Die Glocke wird zum Windspiel: Sie meldet nur noch, wenn wirklich Wind ist.",
    insight: "Geräuschempfindlichkeit ist Teil der Hypervigilanz: Das Nervensystem dreht den Verstärker auf, um nichts zu überhören. Benennen und Einordnen hilft dem System, die Lautstärke wieder zu staffeln.",
  }, [e("schreck", "komorbid"), e("tunnelblick", "komorbid")]),

  n("adrenalin", "Das Adrenalinfläschchen", "Immer einen Schuss zu viel", "alarm", "zustand", 1, 18, {
    intro: "Hier liegt ein Fläschchen, das nie ganz leer wird — und ständig etwas davon kippt.",
    verstehen: [
      "Du stellst das Fläschchen in die Sonne. Es funkelt. „Du hast mich oft gerettet“, sagst du ehrlich.",
      "Es wird ruhiger. Es wusste nicht, dass man es auch loben kann.",
    ],
    frieden: "Das Fläschchen wird zur Notfallampulle: versiegelt, bis es wirklich gebraucht wird.",
    insight: "Adrenalin ist ein kurzlebiger Botenstoff — wirksam in Sekunden, abgebaut in Minuten. Daueralarm hält den Pegel künstlich hoch; Bewegung und Entladung bauen ihn ab.",
  }, [e("herzrasen", "komorbid"), e("zittern", "komorbid")]),

  n("motor", "Der Motor ohne Leerlauf", "Kennt nur Vollgas", "alarm", "symptom", 1, 22, {
    intro: "Ein Motor tuckert auf diesem Strand — ohne Maschine drumherum. Er läuft einfach.",
    verstehen: [
      "Du legst die Hand auf den Motor. Er ist heiß. „Du darfst auch im Stand warm bleiben“, sagst du.",
      "Sein Tuckern wird langsamer. Er hat nie gelernt, dass Stehen kein Sterben ist.",
    ],
    frieden: "Der Motor lernt den Leerlauf: bereit, aber still.",
    insight: "Inneres Getriebensein ist Daueraktivierung ohne Ziel: Der Körper hält Drehzahl, weil Stillstand sich einmal gefährlich anfühlte. Pausen müssen gelernt werden — wie ein neuer Gang.",
  }, [e("hypervigilanz", "komorbid"), e("stau", "uebergang")]),

  n("schweiss", "Der kalte Schweiß", "Regen von innen", "alarm", "symptom", 1, 28, {
    intro: "Die Luft hier ist feucht, obwohl die Sonne brennt. Der Boden glänzt wie Angst.",
    verstehen: [
      "Du wischst dir die Stirn und sagst: „Das ist nur Wasser. Es kühlt.“ Der Schweiß nickt — Kühlen war sein Plan.",
      "Er wird zu Tau. Morgens da, mittags fort.",
    ],
    frieden: "Er wird zur Meeresbrise auf der Haut: feucht, kühl, freundlich.",
    insight: "Kaltes Schwitzen gehört zur sympathischen Alarmreaktion — der Körper kühlt sich für eine Flucht vor, die nie stattfindet. Es ist Physiologie, keine Peinlichkeit.",
  }, [e("panik", "komorbid"), e("adrenalin", "komorbid")]),

  n("alarmkette", "Die Alarmkette", "Ein Funke zündet den nächsten", "alarm", "muster", 1, 10, {
    intro: "Überall an diesem Hang hängen Glöckchen, und wenn eines klingelt, klingeln alle.",
    verstehen: [
      "Du folgst der Kette zurück bis zum ersten Glöckchen. Es ist viel kleiner als der Lärm, den es auslöst.",
      "„Einer klingelt, alle müssen“, sagst du. „Aber ihr könnt auch einer nach dem anderen schweigen.“",
    ],
    frieden: "Die Kette wird zur Perlenschnur: Jedes Glöckchen für sich, keines mehr an allen.",
    insight: "Alarm kann sich selbst auslösen: Herzrasen wird als Gefahr gedeutet, was mehr Herzrasen macht. Diese Rückkopplung zu durchschauen ist der erste Hebel — der Kreis hat eine Stelle, wo er durchbrochen werden kann.",
  }, [e("panik", "komorbid"), e("herzrasen", "komorbid"), e("schalter", "uebergang")]),

  n("dauerlaeufer", "Der Dauerläufer", "Rennt, ohne gejagt zu werden", "alarm", "symptom", 1, 15, {
    intro: "Etwas prescht am Strand entlang, hin und zurück, immer dieselbe Strecke.",
    verstehen: [
      "Du läufst ein Stück neben ihm her. Dann bleibst du stehen. Er läuft noch zwei Runden — und bleibt auch stehen.",
      "„Woran erinnerst du dich, wenn du läufst?“, fragst du. Er kann es nicht sagen. Niemand hatte ihn je gefragt.",
    ],
    frieden: "Der Läufer wird zum Spaziergänger: Er geht gern. Er muss nicht mehr.",
    insight: "Unruhe und Bewegungsdrang können verlagerte Flucht sein — der Körper tut, was er damals nicht tun konnte. Ihm bewusst Raum zu geben (Bewegung als Wahl statt Zwang) löst den Automatismus.",
  }, [e("motor", "komorbid"), e("bleimuede", "uebergang")]),

  n("nachtwache", "Die Nachtwache", "Weckt dich zur vollen Stunde", "alarm", "symptom", 1, 16, {
    intro: "Punkt drei Uhr schlägt hier eine Glocke, die niemand bestellt hat.",
    verstehen: [
      "Du stellst dich neben die Glocke und wartest mit ihr aus. Drei Uhr kommt — und nichts passiert. Sie schaut betreten.",
      "„Danke für die Nachtschichten“, sagst du. „Behalt die Glocke. Aber schlag leiser.“",
    ],
    frieden: "Die Glocke schlägt nur noch bei echtem Anlass — und der ist selten.",
    insight: "Nächtliches Erwachen um feste Zeiten ist ein gelernter Alarmrhythmus: Das Nervensystem schaut nach, ob alles sicher ist. Ruhiges Bleiben statt Grübeln lehrt es um — Nacht für Nacht.",
  }, [e("schlaf", "komorbid"), e("hypervigilanz", "komorbid")]),
];

// ─── GLAS & NEBEL (Die Glaswelt) ───────────────────────────────────

const SEED_GLAS: PhenomenonSeed[] = [
  n("depersonalisierung", "Das Aussenselbst", "Schaut sich selbst beim Leben zu", "glas", "symptom", 2, 170, {
    intro: "Hier steht jemand neben sich — buchstäblich. Es sieht aus wie du, nur einen Schritt versetzt.",
    verstehen: [
      "Du reibst deine Hände, bis sie warm sind. Das Aussenselbst rückt einen halben Schritt näher.",
      "„Du hast mich getragen, als Tragen unmöglich war“, sagst du. „Jetzt darfst du zurückkehren.“ Es kehrt zurück.",
    ],
    frieden: "Es wird zu deinem Schatten: immer bei dir, nie mehr zwischen dir und der Welt.",
    insight: "Depersonalisierung — sich selbst fremd oder daneben fühlen — ist eine Schutzabschaltung bei Überflutung. Aktivierung über den Körper (Wärme, Bewegung, Benennen) führt sanft zurück ins Selbst.",
  }, [e("dissoziation", "komorbid"), e("beobachter", "komorbid")], "neben-sich"),

  n("derealisation", "Die Entrückung", "Die Welt hinter Mattscheibe", "glas", "symptom", 2, 190, {
    intro: "Alles hier ist echt — aber irgendwie gerahmt, als wäre die Welt ein Bild von sich selbst.",
    verstehen: [
      "Du pflückst ein Grasbüschel und riechst daran. Es riecht. Die Mattscheibe bekommt eine Schramme.",
      "„Du wolltest die Welt auf Abstand halten, bis ich stark bin“, sagst du. „Ich bin stärker.“ Das Glas wird dünner.",
    ],
    frieden: "Die Scheibe wird zu einem Fenster mit Griff: Du kannst öffnen und schließen.",
    insight: "Derealisation — die Welt wirkt unwirklich, fern, wie im Film — ist eine Form der Dissoziation. Sinnesanker (Geruch, Kälte, Textur) sind der schnellste Weg zurück in die Gegenwart.",
  }, [e("dissoziation", "komorbid"), e("nebelkopf", "komorbid")], "entrückt"),

  n("luecken", "Die weiße Stelle", "Ein Loch in der Landkarte", "glas", "symptom", 2, 200, {
    intro: "Auf der Karte dieses Ortes fehlt ein Viereck — ausgeschnitten, nicht verbrannt.",
    verstehen: [
      "Du fährst mit dem Finger um die fehlende Stelle. „Du musst nicht heute gefunden werden“, sagst du zu ihr.",
      "Die weiße Stelle wird weicher. Manche Lücken sind keine Verluste — sie sind Aufbewahrung.",
    ],
    frieden: "Die Stelle wird zu einem Kuvert: versiegelt, aber in deinem Besitz. Du entscheidest, wann du öffnest.",
    insight: "Erinnerungslücken sind kein Defekt des Gedächtnisses, sondern sein Schutz: Was überfordert hätte, wurde ausgelagert. In sicherer Begleitung kann dosiert zurückgeholt werden, was fehlt.",
  }, [e("dissoziation", "komorbid"), e("schemen", "komorbid"), e("flashback", "uebergang")], "luecken"),

  n("watte", "Das Wattepaket", "Der Körper auf Sendepause", "glas", "zustand", 2, 175, {
    intro: "Hier liegt ein Körpergefühl in Watte gepackt — alles da, aber gedämpft.",
    verstehen: [
      "Du wackelst mit den Zehen, nur den Zehen. Die Watte kribbelt zurück. Erstmals.",
      "„Du hast die Lautstärke runtergedreht, weil es zu viel war“, sagst du. „Ich stelle sie langsam wieder hoch.“",
    ],
    frieden: "Die Watte wird zu einer warmen Decke: Sie wärmt, statt zu dämpfen.",
    insight: "Das Gefühl, den eigenen Körper kaum zu spüren, gehört zum Shutdown (dorsaler Vagus). Sanfte, kleine Bewegungen sind der erforschte Weg zurück — dosiert, nie forciert.",
  }, [e("erstarrung", "komorbid"), e("herzrasen", "uebergang")], "erstarrt"),

  n("nebelkopf", "Der Nebelkopf", "Denkt durch eine Wolldecke", "glas", "zustand", 1, 195, {
    intro: "Die Gedanken auf diesem Platz kommen an wie Schiffe im Nebel: langsam und mit Verspätung.",
    verstehen: [
      "Du hörst auf, gegen den Nebel anzudenken. Er lichtet sich ein Stück — gerade genug für den nächsten Schritt.",
      "„Du bist keine Dummheit“, sagst du. „Du bist Müdigkeit mit einem anderen Namen.“ Der Nebel nickt.",
    ],
    frieden: "Der Nebelkopf wird zum Morgennebel: Er löst sich auf, wenn der Tag beginnt.",
    insight: "Konzentrations- und Denkstörungen unter Dauerbelastung sind Erschöpfung des Systems, nicht des Verstandes. Schlaf, Dosierung und Pausen wirken besser als Anstrengung gegen den Nebel.",
  }, [e("derealisation", "komorbid"), e("bleimuede", "komorbid")]),

  n("zeitverlust", "Der Zeitsprung", "Stunden, die sich verdrücken", "glas", "symptom", 1, 180, {
    intro: "Die Sonne hier macht Sprünge: Eben war Vormittag, jetzt ist Abend, und niemand hat es gesehen.",
    verstehen: [
      "Du notierst die Zeit auf einen Stein: wann, wo, was zuletzt. Der Sprung wird kleiner beim zweiten Mal.",
      "„Du hast mir Pausen gekauft, als ich keine machen durfte“, sagst du. „Jetzt mache ich sie selbst.“",
    ],
    frieden: "Der Sprung wird zu einem Lesezeichen: Du legst es selbst ein — und du weißt, wo.",
    insight: "Dissoziativer Zeitverlust ist eine extreme Form der Abschaltung, bei der Erleben nicht kontinuierlich gespeichert wird. Anker in der Gegenwart (Notizen, Orte, Zeiten) geben der Zeit ihre Nahtstellen zurück.",
  }, [e("luecken", "komorbid"), e("dissoziation", "komorbid")]),

  n("schalter", "Der Schalter", "Ein Klick — und niemand ist zuhause", "glas", "schutz", 1, 185, {
    intro: "Mitten auf diesem Plateau steht ein Schalter. Er ist umgelegt. Es ist sehr, sehr still hier.",
    verstehen: [
      "Du legst die Hand neben den Schalter, nicht darauf. „Du darfst bleiben“, sagst du. „Aber ich möchte den Schlüssel.“",
      "Der Schalter glüht kurz. Er hatte nie einen Schlüssel bekommen — bis jetzt.",
    ],
    frieden: "Der Schalter wird zu einem Dimmer mit deinem Namen drauf: Du bestimmst die Helligkeit.",
    insight: "Das plötzliche Abschalten bei Überforderung ist ein erlerntes Notprogramm, keine Entscheidung. Es zu bemerken — vorher, währenddessen — ist der erste Schritt, es in eine steuerbare Tür zu verwandeln.",
  }, [e("dissoziation", "komorbid"), e("gefuehlsueberflutung", "schutz-vor")]),

  n("betaubung", "Die Betäubung", "Gefühle unter Narkose", "glas", "zustand", 1, 165, {
    intro: "Auf diesem Feld blühen Blumen, die man sieht, aber nicht spürt. Sie sind da. Mehr nicht.",
    verstehen: [
      "Du setzt dich zu den Blumen und verlangst nichts. Nach einer Weile kribbelt etwas wie Fernweh.",
      "„Gefühle sind keine Pflicht“, sagst du. „Aber sie dürfen zurückkommen.“ Eine Blume dreht sich zum Licht.",
    ],
    frieden: "Die Narkose lässt nach — erst die Müdigkeit kommt zurück, dann die Wärme, dann der Rest.",
    insight: "Emotionale Betäubung ist die Kehrseite des Alarms: Was nicht auszuhalten war, wurde abgestellt — pauschal, Freude inklusive. Sie löst sich in kleinen Dosen über sichere Sinneserfahrungen.",
  }, [e("watte", "komorbid"), e("taubheit", "komorbid")]),

  n("glaspanzer", "Der Glaspanzer", "Schützt durch Nähe auf Abstand", "glas", "schutz", 1, 200, {
    intro: "Hier steht eine Rüstung aus Glas: durchsichtig, unantastbar, wunderbar verarbeitet.",
    verstehen: [
      "Du klopfst an das Glas: „Gute Arbeit. Wirklich.“ Der Panzer strahlt. Niemand hatte ihn je bewundert.",
      "„Dürfen jetzt andere schützen?“, fragst du. „Atmen zum Beispiel.“ Das Glas wird zu einer Brise.",
    ],
    frieden: "Der Panzer wird zu einem Gewächshaus: geschützt, aber es wächst darin.",
    insight: "Sich hinter Glas zu fühlen ist eine Schutzleistung: Nähe war einmal gefährlich, also wurde sie sichtbar, aber unnahbar gemacht. Schutz darf bleiben — er darf nur nicht mehr allein regieren.",
  }, [e("naehe", "schutz-vor"), e("dissoziation", "komorbid")]),

  n("autopilot", "Der Autopilot", "Funktioniert, ohne da zu sein", "glas", "schutz", 1, 172, {
    intro: "Ein Steuerrad dreht sich hier von selbst. Das Schiff fährt. Der Kapitän ist nicht an Bord.",
    verstehen: [
      "Du legst eine Hand ans Rad. Nicht um zu übernehmen — nur um Hallo zu sagen.",
      "„Du hast die schweren Passagen gefahren“, sagst du. „Danke. Die nächste fahren wir zusammen.“",
    ],
    frieden: "Der Autopilot wird zum Lotsen: Er hilft auf Wunsch — aber du hältst das Rad.",
    insight: "Automatisches Funktionieren ist Dissoziation im Alltag: Der Tag wird geschafft, ohne erlebt zu werden. Kurze Stoppmomente (anhalten, fühlen, benennen) holen das Erleben zurück.",
  }, [e("funktion", "komorbid"), e("dissoziation", "komorbid")]),

  n("beobachter", "Der Beobachter", "Sieht alles von oben", "glas", "symptom", 1, 178, {
    intro: "Über diesem Ort schwebt ein Auge wie eine Möwe, die nie landet. Es beobachtet. Es kommentiert nicht.",
    verstehen: [
      "Du winkst dem Auge zu. Es ist erschrocken: Es hatte nie Kontakt erwartet.",
      "„Komm runter“, sagst du. „Der Boden trägt.“ Es landet zögernd auf deiner Schulter.",
    ],
    frieden: "Der Beobachter wird zum inneren Zeugen: Er sieht, aber er gehört wieder zu dir.",
    insight: "Das Gefühl, sich selbst von außen zu beobachten, ist eine Form der Depersonalisierung — ein Überwachungsposten, der einmal Sicherheit bedeutete. Erdung über den Körper bringt ihn zurück ins Hier.",
  }, [e("depersonalisierung", "komorbid"), e("tunnelblick", "komorbid")]),

  n("stille", "Die Stille im Kopf", "Wenn alle Gedanken ausgehen", "glas", "zustand", 1, 205, {
    intro: "Dieser Ort ist der leiseste der Welt. Sogar das eigene Denken kommt hier nur als Fußspur an.",
    verstehen: [
      "Du setzt dich in die Stille, ohne sie füllen zu wollen. Sie wird weniger leer, weil du da bist.",
      "„Du bist nicht das Nichts“, sagst du. „Du bist die Pause zwischen zwei Sätzen.“ Sie atmet auf.",
    ],
    frieden: "Die Stille wird zu einem ruhigen Zimmer mit offenem Fenster.",
    insight: "Das abrupte Verstummen aller Gedanken kann Teil des Shutdowns sein — das System fährt herunter, statt zu überlasten. Sanfte Aktivierung, nicht Zwang, ist der Weg zurück in den Fluss.",
  }, [e("betaubung", "komorbid"), e("nebelkopf", "komorbid")]),
];

// ─── SCHAM & LEERE (Das Trauer-Atoll) ──────────────────────────────

const SEED_SCHAM: PhenomenonSeed[] = [
  n("taubheit", "Die Taubheit", "Die Farben haben sich verzogen", "scham", "zustand", 2, 345, {
    intro: "Auf dieser Wiese steht alles still. Die Blumen sind da, aber sie riechen nach nichts.",
    verstehen: [
      "Du pflückst eine Blume und legst sie ans Ohr. Nichts. Aber du bleibst. Das Bleiben ist der Anfang.",
      "„Du hast mich vor den Stürmen geschützt“, sagst du. „Jetzt ist Frühling. Trau dich ruhig.“ Ein Hauch von Duft kehrt zurück.",
    ],
    frieden: "Die Taubheit wird zu einem Winterfeld: ruhend, nicht tot — der Frühling kommt in Etappen.",
    insight: "Emotionale Taubheit ist ein Abschalten nach Überlastung — das Nervensystem spart Gefühl ein, um zu überleben. Freude kehrt über kleine, sichere Körpererfahrungen zurück, nicht über Befehl.",
  }, [e("leere", "komorbid"), e("betaubung", "komorbid"), e("bleimuede", "uebergang")], "gefuehlstaubheit"),

  n("gefuehlsueberflutung", "Der Gefühlsgeysir", "Von null auf alles", "scham", "symptom", 2, 335, {
    intro: "Mitten auf diesem Platz schießt Wasser aus dem Boden — unangekündigt, gewaltig, warm.",
    verstehen: [
      "Du gehst nicht weg. Du zählst die Sekunden: siebzig, achtzig — der Geysir wird kleiner, während du zählst.",
      "„Du bist keine Katastrophe“, sagst du. „Du bist Druck, der raus muss.“ Der Druck verneigt sich.",
    ],
    frieden: "Der Geysir wird zu einer Quelle mit gemauertem Rand: sprudelnd, aber gefasst.",
    insight: "Gefühle, die von null auf hundert schießen, sind ein Zeichen von Affektdysregulation nach langem Zusammenhalten — kein Charakterfehler. Pendeln zwischen Gefühl und Beruhigung trainiert die Regulierung.",
  }, [e("leere", "komorbid"), e("wutausbruch", "komorbid"), e("schalter", "uebergang")], "gefuehlsueberflutung"),

  n("notventil", "Das Notventil", "Hat einmal Druck genommen", "scham", "schutz", 2, 355, {
    intro: "An diesem Felsen hängt ein Ventil aus einer anderen Zeit. Es ist still. Es ist sehr müde.",
    verstehen: [
      "Du setzt dich neben das Ventil, ohne es anzufassen. „Du hast Schlimmeres verhindert“, sagst du. „Ich weiß.“",
      "„Aber es gibt jetzt andere Wege für den Druck“, sagst du. „Und Menschen, die helfen, sie zu finden.“ Das Ventil nickt schwer.",
    ],
    frieden: "Das Ventil wird zu einem Museumsglas: Es bleibt Teil der Geschichte — aber die Geschichte schreibst jetzt du.",
    insight: "Selbstverletzendes Verhalten ist oft ein verzweifelter Versuch, unerträgliche innere Spannung zu regulieren — keine Aufmerksamkeit, sondern Not. Es gibt wirksame Alternativen und Hilfe: Telefonseelsorge 0800 111 0 111 / 0800 111 0 222, rund um die Uhr, kostenfrei.",
  }, [e("gefuehlsueberflutung", "schutz-vor"), e("scham", "komorbid")], "selbstschaden"),

  n("schuld", "Die Schuldwaage", "Wiegt alles gegen dich", "scham", "symptom", 1, 340, {
    intro: "Auf dieser Anhöhe steht eine Waage. Egal, was du hineinlegst — deine Seite sinkt.",
    verstehen: [
      "Du legst einen Stein auf die andere Seite: „Das habe ich nicht getan. Das ist mir geschehen.“ Die Waage zittert.",
      "„Du hast nur falsch zugeordnet“, sagst du. „Komm, wir sortieren neu.“ Die Waage lässt sich umstellen — widerwillig, dann erleichtert.",
    ],
    frieden: "Die Waage wird zu einem Regal: Dinge haben ihren Platz — und dein Platz ist nicht darunter.",
    insight: "Traumatische Schuld — das Gefühl, selbst schuld an dem Erlittenen zu sein — ist eine der hartnäckigsten Folgen und eine der bestuntersuchten. Sie gehört dem Geschehen, nicht dem Menschen, und sie ist behandelbar.",
  }, [e("scham", "komorbid"), e("wertlosigkeit", "komorbid")]),

  n("wertlosigkeit", "Der Niemand", "Flüstert, du seist zu viel und zu wenig", "scham", "symptom", 1, 348, {
    intro: "Eine Gestalt ohne Gesicht geht hier auf und ab. Sie zählt leise alles, was an dir falsch sein soll.",
    verstehen: [
      "Du fragst die Gestalt: „Wer hat dir das Zählen beigebracht?“ Sie hält inne. Das hat sie noch nie jemand gefragt.",
      "„Das war nicht meine Stimme“, sagst du. „Das war eine fremde, die ich gelernt habe.“ Die Gestalt wird durchsichtig.",
    ],
    frieden: "Der Niemand wird zum Namensschild an deiner Tür: Es steht dein Name drauf. Einfach so.",
    insight: "Das Gefühl der Wertlosigkeit ist ein übernommenes Urteil, kein Selbstbefund — es stammt aus dem, was einem widerfuhr oder vorenthalten wurde. Neue, korrigierende Erfahrungen verändern es, Stück für Stück.",
  }, [e("scham", "komorbid"), e("kritiker", "komorbid")]),

  n("kritiker", "Der Zensor", "Streicht dich aus dem eigenen Text", "scham", "symptom", 1, 350, {
    intro: "Überall an diesem Strand liegen Manuskripte — deine. Alles ist rot angestrichen.",
    verstehen: [
      "Du nimmst den Rotstift aus seiner Hand und schreibst einen einzigen Satz ohne Streichung: „Ich bin hier.“",
      "Der Zensor liest den Satz dreimal. Dann legt er den Stift weg und setzt sich ans Wasser.",
    ],
    frieden: "Der Zensor wird zum Korrektor: Er hilft bei Rechtschreibung — und schweigt beim Leben.",
    insight: "Der innere Kritiker ist oft die verinnerlichte Stimme früherer Bewertung. Er glaubt, dich durch Strenge vor Ablehnung zu schützen. Er wird leiser, wenn man ihn nicht bekämpft, sondern entmachtet.",
  }, [e("scham", "komorbid"), e("perfektionismus", "komorbid")]),

  n("perfektionismus", "Der Feinschliff", "Nie gut genug, nie fertig", "scham", "schutz", 1, 342, {
    intro: "Hier wird ein einziges Boot seit Jahren gebaut. Es ist perfekt. Es war nie im Wasser.",
    verstehen: [
      "Du stellst ein zweites Boot daneben: wackelig, ehrlich, schwimmfähig. Der Feinschliff starrt es an.",
      "„Perfekt war dein Schutzschild gegen Tadel“, sagst du. „Aber Tadel ist vorbei. Schwimmen ist jetzt.“",
    ],
    frieden: "Der Feinschliff wird zum Handwerker: Er baut gut — und er lässt los, wenn es gut genug ist.",
    insight: "Perfektionismus nach Trauma ist häufig Schutz: Wer fehlerlos ist, glaubt sich vor Angriff sicher. Er kostet Lebendigkeit. „Gut genug“ ist ein Muskel, der wächst, jedes Mal, wenn man ihn benutzt.",
  }, [e("scham", "schutz-vor"), e("kritiker", "komorbid"), e("motor", "komorbid")]),

  n("unsichtbarkeit", "Die Unsichtbarkeit", "Gelernt, nicht gesehen zu werden", "scham", "schutz", 1, 338, {
    intro: "An diesem Ort gibt es Fußspuren ohne Mensch. Die Spuren bleiben stehen, sobald du hinschaust.",
    verstehen: [
      "Du sagst laut: „Ich sehe dich.“ Die Spuren zögern — dann steht jemand da. Du.",
      "„Unsichtbar war sicher“, sagst du. „Aber gesehen zu werden gehört dir. Du hattest nur keine sicheren Augen.“",
    ],
    frieden: "Die Unsichtbarkeit wird zu einem Umhang im Schrank: da, wenn du ihn brauchst — nicht mehr deine Haut.",
    insight: "Sich unsichtbar zu machen war in unsicheren Umgebungen eine kluge Überlebensstrategie. Sie wird zur Falle, wenn sie bleibt, nachdem die Umgebung sicherer wurde. Gesehenwerden lässt sich in Dosen üben.",
  }, [e("scham", "schutz-vor"), e("isolation", "komorbid")]),

  n("hoffnungslos", "Der graue Horizont", "Sagt, es werde nicht besser", "scham", "zustand", 1, 332, {
    intro: "Der Horizont hier ist aus Blei. Er sieht aus wie das Ende aller Karten.",
    verstehen: [
      "Du erinnerst den Horizont an gestern: „Da war ein Vogel. Gestern.“ Er gesteht einen einzigen Farbpunkt zu.",
      "„Du bist nicht die Wahrheit“, sagst du. „Du bist die Erschöpfung der Hoffnung. Das ist ein Unterschied.“",
    ],
    frieden: "Der Horizont wird wieder aus Luft: fern, offen, in allen Farben des Wetters.",
    insight: "Hoffnungslosigkeit ist ein Symptom, keine Prognose: Erschöpfte Systeme projizieren Erschöpfung in die Zukunft. Sie weicht, wenn Energie zurückkehrt — und mit Hilfe kehrt sie zurück.",
  }, [e("leere", "komorbid"), e("taubheit", "komorbid"), e("bleimuede", "komorbid")]),

  n("selbstekel", "Der Ekel", "Wendet sich vom eigenen Spiegel ab", "scham", "symptom", 1, 352, {
    intro: "Am Ufer liegt ein Spiegel, den niemand anfassen mag. Er zeigt nichts Falsches — aber alles Falsche zugleich.",
    verstehen: [
      "Du hältst den Spiegel nicht hoch. Du legst ihn flach ins Wasser, sodass er den Himmel zeigt.",
      "„Der Ekel gehört nicht mir“, sagst du. „Er gehört dem, was geschehen ist.“ Das Wasser wird klarer.",
    ],
    frieden: "Der Spiegel zeigt wieder dich: einen Menschen, dem etwas geschah — nicht das Geschehene.",
    insight: "Selbstekel nach Trauma ist ein übernommenes Abwehrgefühl — der Körper übernahm die Abwehr dessen, was geschah. Er gehört zum Geschehen, nicht zum Selbst, und er lässt sich in sicherer Beziehung umlernen.",
  }, [e("scham", "komorbid"), e("haut", "komorbid")]),

  n("fleck", "Der Fleck", "Fühlt sich beschmutzt an", "scham", "symptom", 1, 344, {
    intro: "Ein Fleck wandert über diesen Strand, und alles, was er berührt, fühlt sich kurz befleckt an.",
    verstehen: [
      "Du berührst den Fleck absichtlich. „Schau“, sagst du. „Ich bleibe sauber.“ Er versteht es nicht sofort. Dann doch.",
      "„Schmutz lässt sich waschen“, sagst du. „Menschen sind kein Schmutz.“",
    ],
    frieden: "Der Fleck wird zu einem Schatten: gehört zum Licht, sagt nichts über dich.",
    insight: "Das Gefühl, befleckt zu sein, ist eine bekannte Folge von Übergriffen — eine Zuschreibung, die nie stimmte. Der Körper lernt durch wiederholte, sichere Erfahrungen: Reinheit war nie verloren.",
  }, [e("selbstekel", "komorbid"), e("scham", "komorbid")]),
];

// ─── MISTRAUEN & NÄHE (Das Misstrauens-Riff) ───────────────────────

const SEED_MISTRAUEN: PhenomenonSeed[] = [
  n("anpasser", "Der Anpasser", "Lächelt, damit niemand wütend wird", "misstrauen", "schutz", 2, 110, {
    intro: "Hier wohnt ein Wesen, das jedem gefällt. Buchstäblich jedem. Es kostet es alles.",
    verstehen: [
      "Du sagst zu ihm: „Nein.“ Es erstarrt. Nichts passiert. Kein Donner. Es schaut ungläubig.",
      "„Gefallen war dein Schild“, sagst du. „Aber du bist auch liebenswert, wenn du widersprichst.“ Es wagt ein kleines „Doch.“",
    ],
    frieden: "Der Anpasser wird zum Diplomaten: freundlich aus Überzeugung, nicht aus Angst.",
    insight: "Konflikten durch Gefälligkeit ausweichen (Fawning) ist die vierte Überlebensstrategie neben Kampf, Flucht und Erstarrung. Sie sicherte einst Sicherheit in unberechenbaren Beziehungen; Nein-Sagen ist ihr langsames, sicheres Ende.",
  }, [e("wutausbruch", "schutz-vor"), e("maske", "komorbid"), e("naehe", "komorbid")]),

  n("kontrollwaage", "Die Kontrollwaage", "Prüft alles dreimal gegen die Zukunft", "misstrauen", "schutz", 1, 125, {
    intro: "Auf diesem Platz wird jeder Stein zweimal gewendet und jeder Plan dreimal geschrieben.",
    verstehen: [
      "Du lässt absichtlich einen Stein liegen. Die Welt dreht weiter. Die Waage notiert das erstaunt.",
      "„Kontrolle war dein Schiff bei Sturm“, sagst du. „Jetzt ist See. Du darfst treiben lernen.“",
    ],
    frieden: "Die Waage wird zum Kompass: Sie zeigt Richtungen — und lässt den Wind den Wind sein.",
    insight: "Kontrollbedürfnis nach Ohnmachtserfahrung ist der Versuch, nie wieder überrumpelt zu werden. Es schützt kurzfristig und erschöpft langfristig. Kleine bewusste Übergaben trainieren Vertrauen in die eigene Handlungsfähigkeit.",
  }, [e("panik", "schutz-vor"), e("perfektionismus", "komorbid")]),

  n("pruefstand", "Der Prüfstand", "Testet Herzen, bis sie brechen", "misstrauen", "muster", 1, 118, {
    intro: "Hier stehen Maschinen, die andere Maschinen prüfen: Druck, Zug, Biegung — bis etwas nachgibt.",
    verstehen: [
      "Du stellst dich auf den Prüfstand und sagst: „Ich bleibe ohne Test.“ Die Maschinen halten inne.",
      "„Du wolltest nur wissen, wer bleibt“, sagst du. „Aber Tests erzeugen das Brechen, das sie fürchten.“",
    ],
    frieden: "Der Prüfstand wird zur Werkbank für Brücken: gebaut statt gebrochen.",
    insight: "Beziehungen zu testen, bis der andere aufgibt, ist Selbstschutz aus Verlustangst — und erzeugt den Verlust, den er fürchtet. Sicherheit entsteht durch kleine, echte Risiken ohne Testprotokoll.",
  }, [e("misstrauen", "komorbid"), e("verlustangst", "komorbid")]),

  n("isolation", "Die Einsiedelei", "Sicher, weil leer", "misstrauen", "schutz", 1, 130, {
    intro: "Eine Hütte am Ende aller Wege. Gepflegt. Ruhig. Niemand klingelt dort je.",
    verstehen: [
      "Du klingelst. Es dauert. Dann öffnet jemand — vorsichtig, aber neugierig.",
      "„Du hast dich in Sicherheit gebracht“, sagst du. „Das war klug. Aber Nahrung wächst draußen.“",
    ],
    frieden: "Die Einsiedelei bekommt eine Tür mit Klinke: von innen zu öffnen, jederzeit.",
    insight: "Rückzug in Isolation schützt vor Verletzung und verhungert an Nähe zugleich — Menschen regulieren sich gegenseitig (Co-Regulation). Ein einziger sicherer Kontakt wiegt mehr als hundert vermiedene.",
  }, [e("naehe", "schutz-vor"), e("zurueckgezogen", "komorbid"), e("einsamkeit", "komorbid")]),

  n("maske", "Die Maske", "Zeigt nur, was ankommt", "misstrauen", "schutz", 1, 115, {
    intro: "An den Bäumen dieses Hains hängen Gesichter — alle freundlich, alle aus Porzellan.",
    verstehen: [
      "Du nimmst eine Maske ab und legst sie aufs Gras. Das Gesicht darunter ist müde und echt.",
      "„Du hast mich vor schlechten Blicken bewahrt“, sagst du. „Jetzt gibt es gute Augen. Für dich.“",
    ],
    frieden: "Die Maske wird zum Karnevalsfundus: verkleiden aus Spiel, nie mehr aus Not.",
    insight: "Anpassung als Maske schützt vor Ablehnung — und verhindert zugleich, geliebt zu werden, wie man ist. Echtheit in kleinen Dosen vor sicheren Menschen ist der Gegenbeweis, den das Nervensystem braucht.",
  }, [e("scham", "schutz-vor"), e("anpasser", "komorbid")]),

  n("verratserwartung", "Die Erwartung des Verrats", "Wartet auf den Moment, wo alle gehen", "misstrauen", "zustand", 1, 122, {
    intro: "In dieser Bucht ankern Schiffe mit gelichteten Tauen. Jedes erwartet, im Stich gelassen zu werden.",
    verstehen: [
      "Du bindest ein Tau neu, sichtbar, mit doppeltem Knoten. Die Bucht beobachtet das genau.",
      "„Einmal wurdest du verlassen“, sagst du. „Aber einmal ist nicht immer.“ Ein Schiff legt das Ruder um.",
    ],
    frieden: "Die Erwartung wird zur Vorsicht mit Gedächtnis: Sie prüft — aber sie verurteilt nicht mehr im Voraus.",
    insight: "Die Erwartung, verlassen oder verraten zu werden, ist eine Generalisierung aus realer Erfahrung — das Nervensystem schützt durch Vorwegnehmen. Neue, verlässliche Beziehungserfahrungen schreiben die Erwartung um.",
  }, [e("misstrauen", "komorbid"), e("verlustangst", "komorbid")]),

  n("einsamkeit", "Die Einsamkeit", "Ein Tisch, ein Stuhl, ein Licht", "misstrauen", "zustand", 1, 135, {
    intro: "Auf einer Lichtung steht ein gedeckter Tisch für einen. Er wird jeden Abend neu gedeckt. Hoffnungsvoll.",
    verstehen: [
      "Du setzt dich auf den zweiten, unsichtbaren Stuhl. Die Einsamkeit erschrickt — dann deckt sie nach.",
      "„Du bist kein Urteil über mich“, sagst du. „Du bist ein Hunger. Hunger darf gestillt werden.“",
    ],
    frieden: "Der Tisch bekommt einen zweiten Stuhl, der manchmal besetzt ist — und das reicht.",
    insight: "Einsamkeit ist ein Regulationshunger, kein Charakter: Der Mensch ist ein Bindungswesen, und Alleinsein nach Verletzung schmeckt nach Sicherheit und Mangel zugleich. Gestillt wird er durch wenige, sichere Verbindungen.",
  }, [e("isolation", "komorbid"), e("naehe", "uebergang")]),

  n("verlustangst", "Die Verlustangst", "Hält fest, was sie fürchtet zu verlieren", "misstrauen", "symptom", 2, 128, {
    intro: "In diesem Hafen werden Anker geworfen — nach innen, in andere Menschen hinein.",
    verstehen: [
      "Du lockerst einen Griff um einen Fingerbreit. Der andere bleibt. Die Angst schaut ungläubig zu.",
      "„Festhalten hat nie Gehen verhindert“, sagst du. „Aber Loslassen hat Bleiben ermöglicht.“",
    ],
    frieden: "Die Angst wird zur Liebe ohne Klammer: Da-Sein aus Wahl, nicht aus Panik.",
    insight: "Verlustangst entsteht, wo Bindung einmal unzuverlässig war. Klammern ist ihr Versuch, Sicherheit zu erzwingen — und überfordert genau die Nähe, die sie schützen will. Verlässlichkeit in kleinen Dosen heilt sie.",
  }, [e("naehe", "komorbid"), e("pruefstand", "komorbid"), e("verlassenheit", "komorbid")]),

  n("falsches-selbst", "Das falsche Selbst", "Funktioniert für andere", "misstrauen", "schutz", 1, 112, {
    intro: "Hier läuft jemand herum, der alle Erwartungen erfüllt — außer der eigenen, die er nie kennengelernt hat.",
    verstehen: [
      "Du fragst: „Was willst du?“ Stille. Die Frage war noch nie gestellt worden.",
      "„Du hast alle bedient, damit du überlebst“, sagst du. „Jetzt darfst du Bestellungen zurückgeben.“",
    ],
    frieden: "Das falsche Selbst wird zum Werkzeugkoffer: nützlich, aber nicht mehr dein Gesicht.",
    insight: "Ein falsches Selbst entsteht, wenn Kinder die Bedürfnisse anderer über die eigenen stellen mussten. Der eigene Wunsch ist nicht verschwunden — nur nie gefragt worden. Er antwortet auf beharrliches, freundliches Fragen.",
  }, [e("maske", "komorbid"), e("anpasser", "komorbid"), e("wertlosigkeit", "komorbid")]),

  n("wachtor", "Das Wachtor", "Niemand kommt ungeprüft herein", "misstrauen", "schutz", 1, 120, {
    intro: "Vor diesem Ort liegt ein Torhaus. Jeder Besucher wird gemessen, gewogen, protokolliert.",
    verstehen: [
      "Du stellst dich in Sichtweite des Tors und wartest, ohne anzuklopfen. Das Tor bemerkt die Geduld.",
      "„Du hast jeden geprüft, weil einmal ein Wolf kam“, sagst du. „Aber die meisten sind keine Wölfe.“",
    ],
    frieden: "Das Tor behält sein Schloss — aber du hältst den Schlüssel, und es gibt ein Gästebuch.",
    insight: "Menschen an der Tür zu prüfen, bevor sie nah dürfen, ist nach Bindungsverletzung vernünftig — es wird nur zur Falle, wenn die Prüfung nie endet. Vertrauen wächst in Stufen, nicht per Sprung.",
  }, [e("misstrauen", "komorbid"), e("naehe", "schutz-vor")]),

  n("scheue", "Die Scheu", "Wird klein bei fremden Blicken", "misstrauen", "symptom", 1, 108, {
    intro: "Am Rand dieser Wiese steht ein Wesen halb hinter einem Baum. Es möchte spielen. Es möchte auch weg.",
    verstehen: [
      "Du setzt dich in Sichtweite, aber in respektvoller Entfernung, und spielst mit dir selbst. Die Scheu kommt einen Schritt näher.",
      "„Blicke waren einmal gefährlich“, sagst du. „Meiner ist es nicht.“ Sie kommt noch einen Schritt näher.",
    ],
    frieden: "Die Scheu wird zur Schüchternheit: ein Temperament, kein Gefängnis.",
    insight: "Soziale Scheu nach Beziehungsverletzung ist erlernte Vorsicht vor Bewertung. Sie schwindet nicht durch Überwindung, sondern durch wiederholte, unbewertete Begegnungen — langsam und freiwillig.",
  }, [e("isolation", "komorbid"), e("unsichtbarkeit", "komorbid")]),
];

// ─── GEDÄCHTNIS & WIEDERKEHR (Das Wiederkehr-Riff) ─────────────────

const SEED_WIEDERKEHR: PhenomenonSeed[] = [
  n("aufdringlich", "Der Drängler", "Kommt ohne Anklopfen", "wiederkehr", "symptom", 2, 285, {
    intro: "An dieser Tür wird geklopft, obwohl keine Tür da ist. Der Gedanke will herein. Sofort.",
    verstehen: [
      "Du sagst: „Ich habe dich gehört. Heute Abend, zwanzig Minuten, mit Tee.“ Der Drängler blinzelt. Ein Termin?",
      "Er kommt zum Termin. Er ist viel kleiner, wenn er eingeladen statt ausgesperrt wird.",
    ],
    frieden: "Der Drängler wird zum Postboten: Er klingelt zweimal — und du machst auf, wenn du bereit bist.",
    insight: "Aufdringliche Erinnerungen wollen gehört werden — das Aussperren verstärkt sie. Ein fester Termin mit dem Erinnern (dosiert, selbstbestimmt) nimmt dem Drängen die Not.",
  }, [e("flashback", "komorbid"), e("trigger", "komorbid")], "aufdringlich"),

  n("trigger", "Die Zündschnur", "Ein Geruch, ein Ton — und es ist wieder da", "wiederkehr", "symptom", 2, 295, {
    intro: "Überall auf diesem Boden liegen Schnüre im Gras. Manche glimmen noch.",
    verstehen: [
      "Du folgst einer Schnur bis zu ihrem Anfang: ein Geruch, ein Ton, ein Winkel von Licht. „Daher kommst du“, sagst du.",
      "Die Schnur wird blass, sobald sie einen Namen hat. Benannt ist halb entschärft.",
    ],
    frieden: "Die Schnur wird zur Markierung auf der Karte: Du kennst sie, du kannst sie umgehen oder begehen.",
    insight: "Trigger sind gelernte Alarmzeichen: Das Nervensystem verknüpfte Sinnesreize mit Gefahr. Sie verlieren Macht durch Erkennen und Neuverknüpfen in Sicherheit — die Gegenwart ist nicht die Vergangenheit.",
  }, [e("flashback", "echo"), e("schreck", "komorbid"), e("geruch", "komorbid")], "trigger"),

  n("gefuehlserinnerungen", "Die bildlose Erinnerung", "Der Körper weiß, was der Kopf nicht zeigt", "wiederkehr", "symptom", 2, 300, {
    intro: "Hier weht ein Wind, der sich anfühlt wie etwas. Niemand kann sagen, wie was. Aber alle fühlen es.",
    verstehen: [
      "Du bleibst im Wind stehen und sagst: „Du bist echt, auch ohne Bild.“ Der Wind wird ruhiger — gehört, endlich.",
      "„Der Körper erinnert sich auf seine Weise“, sagst du. „Ich höre jetzt auch ohne Film zu.“",
    ],
    frieden: "Der Wind wird zur Wetterfahne: Er meldet Befindlichkeit, ohne sie zu diktieren.",
    insight: "Gefühls- und Körpererinnerungen ohne Bilder sind implizite Erinnerungen: Sie wurden ohne Sprache gespeichert und kehren als Zustand wieder. Ernst genommen und benannt, werden sie zu Botschaften statt zu Überfällen.",
  }, [e("schemen", "komorbid"), e("watte", "komorbid"), e("herzrasen", "komorbid")], "gefuehlserinnerungen"),

  n("geruch", "Der Geruch von damals", "Reist schneller als jeder Gedanke", "wiederkehr", "symptom", 1, 290, {
    intro: "Eine Brise trägt einen Geruch herbei, der nicht hierher gehört — und alles stellt sich auf.",
    verstehen: [
      "Du riechst bewusst: Salz. Teer. Gegenwart. „Der alte Geruch ist ein Brief ohne Adresse“, sagst du.",
      "Die Brise verliert ihren Kurs. Sie gehört wieder diesem Meer.",
    ],
    frieden: "Der Geruch wird zu einer Duftmarke: erkannt, eingeordnet, vorbeigezogen.",
    insight: "Gerüche triggern besonders stark, weil der Riechnerv direkt mit dem Alarmzentrum verschaltet ist — schneller als jeder Gedanke. Bewusstes Riechen der Gegenwart (Ankergeruch) ist ein wirksamer Konter.",
  }, [e("trigger", "komorbid"), e("flashback", "komorbid")]),

  n("jahrestag", "Der Jahrestag", "Der Kalender, der sich erinnert", "wiederkehr", "symptom", 1, 275, {
    intro: "Auf dieser Insel steht ein Kalender, dessen eines Datum jedes Jahr tiefer einsinkt als alle anderen.",
    verstehen: [
      "Du markierst das Datum rot — nicht zum Fürchten, sondern zum Vorsorgen: Tee, Freund, Decke.",
      "„Du kündigst dich an“, sagst du. „Dann kann ich dich empfangen.“ Der Tag wird zu einem Tag der anderen Art.",
    ],
    frieden: "Der Jahrestag wird zum Gedenktag: schwer, aber geplant — und überlebbar.",
    insight: "Jahrestagsreaktionen sind echte physiologische Erinnerung: Körper und Rhythmus wissen das Datum. Den Tag vorherzusehen und zu gestalten statt zu erleiden ist eine erprobte Stabilisierung.",
  }, [e("flashback", "komorbid"), e("dauerschleife", "komorbid")]),

  n("dauerschleife", "Die Schleife", "Denkt alles noch einmal zu Ende", "wiederkehr", "muster", 1, 305, {
    intro: "Ein Plattenspieler läuft hier mit einem Sprung: dieselbe Sekunde, immer wieder, endlos.",
    verstehen: [
      "Du hebst die Nadel an. Knack. Stille. Die Schleife hält den Atem an — sie kannte keinen Aus-Knopf.",
      "„Grübeln hat noch kein Gestern repariert“, sagst du. „Aber es hat viele Morgen verschlafen.“",
    ],
    frieden: "Die Schleife wird zur Schallplatte mit vielen Liedern — und einem Deckel zum Zuklappen.",
    insight: "Grübeln fühlt sich wie Problemlösen an, ist aber Alarm im Kreis: Es hält die Erregung hoch, ohne etwas zu lösen. Unterbrechen durch Handlung, Bewegung oder einen festen Grübeltermin bricht die Schleife.",
  }, [e("aufdringlich", "komorbid"), e("motor", "komorbid"), e("bleimuede", "uebergang")]),

  n("wiederholer", "Der Wiederholer", "Spielt alte Szenen mit neuen Leuten", "wiederkehr", "muster", 2, 310, {
    intro: "Auf einer kleinen Bühne läuft ein Stück. Die Darsteller wechseln. Das Stück nie.",
    verstehen: [
      "Du bleibst nach der Vorstellung sitzen und fragst den Regisseur: „Warum genau dieses Stück?“ Er weint. Es ist das einzige, das er auswendig kann.",
      "„Du wolltest es beim Wiederholen endlich anders enden lassen“, sagst du. „Verstehen geht auch anders. Bühne frei.“",
    ],
    frieden: "Die Bühne bleibt — aber es laufen jetzt auch andere Stücke, manche mit Happy End.",
    insight: "Wiederholungszwang ist das unbewusste Inszenieren alter Konstellationen — das Nervensystem sucht im Bekannten ein anderes Ende. Es zu erkennen ist der Moment, in dem das Stück verändert werden kann.",
  }, [e("trigger", "komorbid"), e("zeitfalte", "komorbid")]),

  n("echo", "Das Echo", "Antwortet, nachdem alles vorbei ist", "wiederkehr", "symptom", 1, 280, {
    intro: "Diese Schlucht antwortet verspätet: Der Schrei von damals kommt erst jetzt zurück.",
    verstehen: [
      "Du rufst deinen eigenen Namen. Das Echo antwortet mit deinem Namen — in deiner Stimme. Das ist neu.",
      "„Du darfst verhallen“, sagst du. „Ich habe gehört. Es ist genug.“ Die Schlucht wird leiser.",
    ],
    frieden: "Das Echo wird zum Widerhall in einer hohen Halle: würdig, weich, endlich.",
    insight: "Der Nachhall nach akuten Belastungen (Erregung, Bilder, Körperalarm Tage später) ist normale Verarbeitung, kein Rückfall. Er verhallt von selbst, wenn man ihn nicht mit neuer Angst füttert.",
  }, [e("flashback", "echo"), e("albtraum", "echo")]),

  n("ton", "Der Ton", "Eine Frequenz aus der Vergangenheit", "wiederkehr", "symptom", 1, 288, {
    intro: "Irgendwo hier summt ein Ton. Kaum hörbar. Aber wenn er anschlägt, bist du kurz nicht mehr hier.",
    verstehen: [
      "Du setzt einen neuen Ton dagegen: deinen Namen, gesprochen von dir selbst. Der alte Ton verliert die Frequenz.",
      "„Du warst das Geräusch der Gefahr“, sagst du. „Jetzt gibt es Geräusche der Sicherheit.“ Er mischt sich unters Meeresrauschen.",
    ],
    frieden: "Der Ton wird zu einer Note in einem Lied, das du selbst singst.",
    insight: "Akustische Trigger gehören zu den stärksten Alarmzeichen — das Gehör schläft nie ganz. Ein eigener Gegenton (Stimme, Summen, der Voo-Klang) ist ein direkter Draht zum Beruhigungssystem.",
  }, [e("trigger", "komorbid"), e("glocke", "komorbid")]),

  n("schemen", "Der Schemen", "Bilder ohne Zusammenhang", "wiederkehr", "symptom", 1, 298, {
    intro: "An der Wand dieser Höhle flackern Bilder: ein Schuh, ein Türgriff, ein Himmel. Kein Film — nur Fetzen.",
    verstehen: [
      "Du betrachtest die Fetzen, ohne sie zu ordnen. Sie danken es dir, indem sie stillstehen.",
      "„Ihr müsst heute keinen Sinn ergeben“, sagst du. „Ihr dürft einfach alt sein.“ Die Wand wird ruhig.",
    ],
    frieden: "Die Fetzen werden zu einem Mosaik: unvollständig, aber es gehört dir.",
    insight: "Erinnerungsfetzen ohne Narrativ sind typisch für traumatische Erinnerung: Sie wurde unter Alarm gespeichert — sensorisch, nicht als Geschichte. Sie müssen nicht gelöst werden, um zu heilen; sie müssen nur nicht mehr angreifen.",
  }, [e("luecken", "komorbid"), e("gefuehlserinnerungen", "komorbid")]),

  n("zeitfalte", "Die Zeitfalte", "Damals liegt auf heute", "wiederkehr", "zustand", 1, 292, {
    intro: "An diesem Ort liegen zwei Lichtungen übereinander: die von heute und eine von früher. Man betritt beide zugleich.",
    verstehen: [
      "Du benennst die Unterschiede laut: „Hier Gras. Damals Teppich. Hier Tag. Damals Nacht.“ Die Falte glättet sich Ecke um Ecke.",
      "„Ihr wart nie dasselbe“, sagst du. „Ihr habt euch nur gleich angefühlt.“ Die Lichtungen trennen sich.",
    ],
    frieden: "Die Falte wird zu einem aufgeschlagenen Buch: zwei Seiten, klar getrennt, beide lesbar.",
    insight: "Wenn Gegenwart und Vergangenheit sich überlagern, ist das die Kernmechanik des Wiedererlebens. Das bewusste Vergleichen — damals/heute — ist eine der wirksamsten Erdungstechniken überhaupt.",
  }, [e("flashback", "komorbid"), e("geruch", "echo")]),
];

// ─── KÖRPER & SCHUTZ (Der Körperstrand) ────────────────────────────

const SEED_KOERPER: PhenomenonSeed[] = [
  n("schmerzen", "Der Wanderschmerz", "Zieht um, ohne je auszuziehen", "koerper", "symptom", 2, 85, {
    intro: "Ein Schmerz wandert über diese Hügel wie ein Hirte ohne Herde: heute Schulter, morgen Rücken.",
    verstehen: [
      "Du fragst den Schmerz nicht „warum bist du da“, sondern „was trägst du“. Er bleibt erstmals stehen.",
      "„Du bist ein Bote ohne Adresse“, sagst du. „Die Adresse bin ich. Leg die Botschaft ab.“",
    ],
    frieden: "Der Hirte findet seine Herde: Er hütet jetzt Ruhe statt Schmerz.",
    insight: "Chronische Schmerzen ohne Befund sind reale Schmerzen mit einem lernfähigen Alarmsystem: Das Nervensystem hat die Schwelle gesenkt. Behandelbar über Bewegung, Regulation und das Entlernen des Alarms — nicht über Ignorieren.",
  }, [e("schulterpanzer", "komorbid"), e("magen", "komorbid")], "schmerzen"),

  n("magen", "Der nervöse Magen", "Verdaut Sorgen statt Essen", "koerper", "symptom", 2, 90, {
    intro: "In dieser Bucht brodelt ein Kessel ohne Feuer. Er reagiert auf jeden Gedanken wie auf einen Befehl.",
    verstehen: [
      "Du atmest in den Bauch hinein, dreimal, weit. Der Kessel wird ruhiger — er hat auf Ausatmen gewartet.",
      "„Du bist mein zweites Hirn“, sagst du. „Aber du musst nicht jeden Gedanken verdauen.“",
    ],
    frieden: "Der Kessel wird zum Teekocher: Er brodelt nur noch für gute Gelegenheiten.",
    insight: "Der Darm hat ein eigenes Nervensystem und ist direkt mit dem Alarmzentrum verdrahtet — Übelkeit und Krämpfe bei Stress sind Physiologie, keine Einbildung. Vagusberuhigung wirkt binnen Minuten auf ihn.",
  }, [e("herzrasen", "komorbid"), e("haut", "komorbid")], "magen"),

  n("haut", "Die Haut, die mitspricht", "Zeigt, was keiner sagt", "koerper", "symptom", 1, 75, {
    intro: "Die Felsen dieses Strandes wechseln die Farbe, je nachdem, wer vorbeigeht. Sie sind ehrlich.",
    verstehen: [
      "Du legst die Hand auf einen Felsen: „Ich sehe, was du zeigst.“ Er wird einen Ton ruhiger.",
      "„Du warst mein Aushängeschild der Seele“, sagst du. „Danke für die Ehrlichkeit. Du darfst auch schweigen.“",
    ],
    frieden: "Die Felsen werden zu einem stillen Strand: Sie färben sich nur noch vom Sonnenuntergang.",
    insight: "Hautreaktionen unter Stress sind ein echtes Organgespräch: Haut und Nervensystem entstehen embryonal aus derselben Schicht. Jucken und Röten in Druckzeiten sind Boten — behandelbar über Entlastung, nicht nur über Salbe.",
  }, [e("magen", "komorbid"), e("selbstekel", "komorbid")], "haut"),

  n("kiefer", "Der Kiefer", "Hält die Worte fest, die nie gesagt wurden", "koerper", "symptom", 1, 95, {
    intro: "Ein Tor aus Stein beißt hier aufeinander. Es hat etwas zu sagen. Seit Jahren. Es beißt stattdessen.",
    verstehen: [
      "Du lässt den eigenen Kiefer locker hängen, gähnst einmal breit. Das Tor ächzt — Nachahmung ist sein Einverständnis.",
      "„Worte sind keine Waffen mehr“, sagst du. „Du darfst sie rauslassen.“ Das Tor öffnet sich einen Spalt.",
    ],
    frieden: "Das Tor wird zu einem Torbogen: offen, gehalten vom eigenen Gleichgewicht.",
    insight: "Zähneknirschen und Kieferpressen sind verlagerte Anspannung — der Kiefer ist ein klassischer Speicher für Unerzähltes. Lockerung (Gähnen, Wärme, bewusstes Öffnen) entlädt ihn messbar.",
  }, [e("schulterpanzer", "komorbid"), e("aufdringlich", "komorbid")]),

  n("schulterpanzer", "Der Schulterpanzer", "Trägt die Welt auf zwei Zentimetern", "koerper", "schutz", 1, 80, {
    intro: "Hier steht eine Statue mit Schultern wie Mauern. Sie trägt. Sie trägt immer. Sie fragt nie.",
    verstehen: [
      "Du lässt deine eigenen Schultern sinken — nur einen Atemzug. Die Statue schaut neidisch. Dann macht sie nach.",
      "„Tragen war deine Art zu helfen“, sagst du. „Abgeben ist auch eine.“ Die Mauern werden zu Hängematten.",
    ],
    frieden: "Der Panzer wird zu einem Rucksack: abnehmbar, immer.",
    insight: "Chronische Schulter-Nacken-Verspannung ist die körperliche Form der Dauerbereitschaft — Muskeln, denen nie „vorbei“ gemeldet wurde. Sinkenlassen im Ausatmen ist ein direktes Signal an den Sympathikus.",
  }, [e("erstarrung", "echo"), e("schmerzen", "komorbid")]),

  n("kopfschmerz", "Der Spannungskopf", "Ein Band, das sich erinnert", "koerper", "symptom", 1, 88, {
    intro: "Um diesen Gipfel liegt ein Band aus Nebel. Es zieht sich zu, wenn Gedanken zu viele werden.",
    verstehen: [
      "Du massierst dir die Schläfen und zählst rückwärts von fünf. Das Band lockert sich bei vier.",
      "„Du bist kein Feind“, sagst du. „Du bist ein Überlastungsmelder. Ich lese die Meldung jetzt früher.“",
    ],
    frieden: "Das Band wird zu einem Stirnband: da, aber weich — und du nimmst es ab, wann du willst.",
    insight: "Spannungskopfschmerz ist die häufigste Kopfschmerzform und direkt mit Anspannung gekoppelt. Er ist ein Messinstrument: Er steigt, wo Pausen fehlen — und fällt, wo sie eingebaut werden.",
  }, [e("schulterpanzer", "komorbid"), e("nebelkopf", "komorbid")]),

  n("schwindel", "Der Schwindel", "Der Boden wird zur Frage", "koerper", "symptom", 1, 92, {
    intro: "Der Boden dieses Plateaus hält still — aber er fühlt sich an, als würde er gleich schwanken.",
    verstehen: [
      "Du fixierst einen festen Punkt am Horizont, dann einen zweiten. Der Boden erinnert sich an seine Arbeit.",
      "„Du wolltest nur, dass ich nichts riskiere“, sagst du. „Feststehen ist kein Risiko.“",
    ],
    frieden: "Der Schwindel wird zur Schaukel: bewegt, aber von dir bewegt.",
    insight: "Schwindel unter Belastung entsteht oft durch flache Atmung und Verspannung — das Gleichgewichtssystem bekommt widersprüchliche Daten. Fixpunkte, Ausatmen und Bodenkontakt sind die schnelle Gegenregulation.",
  }, [e("panik", "komorbid"), e("tunnelblick", "komorbid")]),

  n("zucken", "Das Zucken", "Ein Funke ohne Ankündigung", "koerper", "symptom", 1, 82, {
    intro: "Kleine Funken springen über diese Wiese: hier ein Lid, dort ein Finger. Niemand hat sie bestellt.",
    verstehen: [
      "Du beobachtest das Zucken wie einen Regenwurm nach Regen: interessiert, nicht alarmiert. Es wird seltener, wenn es beobachtet statt gefürchtet wird.",
      "„Du bist nur ein Reststrom“, sagst du. „Fließ ab.“ Er fließt ab.",
    ],
    frieden: "Die Funken werden zu Glühwürmchen: hübsch, harmlos, nur noch abends.",
    insight: "Nervöses Zucken (Lid, Muskeln) ist Entladungsreststrom eines gespannten Systems — harmlos und ein zuverlässiger Anzeiger für Überlastung. Er verschwindet mit Erholung, nicht mit Sorge.",
  }, [e("zittern", "komorbid"), e("schreck", "komorbid")]),

  n("atemhalt", "Der Atemhalt", "Vergisst das Ausatmen", "koerper", "symptom", 1, 98, {
    intro: "Auf dieser Brücke bleibt alles einen Moment zu lang stehen — auch die Luft.",
    verstehen: [
      "Du atmest demonstrativ aus, lang und hörbar. Die Brücke atmet nach. Sie wusste es nicht mehr allein.",
      "„Anhalten war Vorsicht“, sagst du. „Ausatmen ist Leben.“ Die Brücke atmet fortan mit.",
    ],
    frieden: "Der Atemhalt wird zur Pause zwischen zwei Atemzügen: kurz, natürlich, eigen.",
    insight: "Unbewusstes Anhalten des Atems (vor allem bei Anspannung) ist ein verbreitetes Alarmmuster — es erhöht die innere Unruhe. Das bewusste Ausatmen ist die kleinste wirksame Übung überhaupt.",
  }, [e("atemdruck", "komorbid"), e("motor", "komorbid")]),

  n("trostpflaster", "Das Trostpflaster", "Stillt Hunger, der keiner ist", "koerper", "schutz", 1, 72, {
    intro: "Auf diesem Platz liegt ein Picknick, das nie satt macht. Es tröstet gut. Es tröstet nur kurz.",
    verstehen: [
      "Du fragst vor dem nächsten Griff: „Wer hat jetzt Hunger — der Bauch oder das Gefühl?“ Das Picknick wird nachdenklich.",
      "„Du hast mich oft getröstet“, sagst du. „Aber manche Hunger haben Namen. Ich frage jetzt nach Namen.“",
    ],
    frieden: "Das Picknick wird zu einem Festmahl zu festen Zeiten: satt, froh, vorbei.",
    insight: "Essen zur Gefühlsregulation nutzt ein echtes Beruhigungssystem — es funktioniert, nur kurz und mit Nebenwirkungen. Nicht das Essen ist das Problem, sondern der ungestillte Hunger dahinter; der kann benannt und anders gefüttert werden.",
  }, [e("leere", "schutz-vor"), e("bildschirmflucht", "komorbid")]),

  n("schleiertrank", "Der Schleiertrank", "Macht den Abend weicher und den Morgen härter", "koerper", "schutz", 2, 105, {
    intro: "Auf einem Fass lagert ein Trank, der Nebel verspricht. Er hält, was er verspricht. Leider genau das.",
    verstehen: [
      "Du liest das Etikett laut vor: „Wirkstoff: Vergessen. Nebenwirkung: Wiederkehren.“ Das Fass wird still.",
      "„Du hast schwere Abende überbrückt“, sagst du. „Aber die Brücke kostet mehr als der Abend. Es gibt Menschen, die beim Bau besserer Brücken helfen.“",
    ],
    frieden: "Das Fass wird zu einem Brunnen: Er gibt Wasser — und Wasser reicht jetzt.",
    insight: "Substanzen gegen innere Spannung wirken zuverlässig — und zuverlässig gegen einen: Sie senken die Schwelle, bis der Schleier Pflicht wird. Das ist ein medizinisches Thema, kein moralisches; Hilfe gibt es bei der Telefonseelsorge (0800 111 0 111) und bei Suchtberatungsstellen vor Ort.",
  }, [e("gefuehlserinnerungen", "schutz-vor"), e("betaubung", "komorbid")]),

  n("bildschirmflucht", "Das leuchtende Loch", "Füttert den Blick, hungert den Rest", "koerper", "schutz", 1, 78, {
    intro: "Ein Lichtschacht zieht alle Blicke an wie eine Mottenfalle. Er ist warm. Er ist endlos. Er ist leer.",
    verstehen: [
      "Du schaust eine volle Minute bewusst hinein — dann bewusst weg. Das Loch verliert den Sog, wenn es beobachtet wird.",
      "„Du hast die Stunden verschluckt, die wehtaten“, sagst du. „Aber du hast auch die verschluckt, die gut waren.“",
    ],
    frieden: "Das Loch wird zu einem Fenster mit Riegel: Du öffnest es. Du schließt es. Deins.",
    insight: "Flucht in Bildschirme funktioniert über kleine Belohnungshäppchen gegen Leere — legitim als Pause, teuer als Dauerzustand. Der Ausstieg gelingt nicht durch Verbot, sondern durch ein besseres Angebot zur selben Stunde.",
  }, [e("einsamkeit", "schutz-vor"), e("aufschieben", "komorbid")]),

  n("arbeitsturm", "Der Arbeitsturm", "Immer noch eine Etage höher", "koerper", "schutz", 1, 100, {
    intro: "Ein Turm wächst hier jeden Tag um einen Stein. Er wird nie fertig. Das ist seine Aufgabe.",
    verstehen: [
      "Du legst an einem Tag keinen Stein. Der Turm stürzt nicht ein. Er schaut verblüfft auf seine Unvollendung.",
      "„Du hast Gefühl durch Tun ersetzt“, sagst du. „Es hat getragen. Aber Tragen ist nicht Leben.“",
    ],
    frieden: "Der Turm wird zum Leuchtturm: fertig, nützlich, mit Feierabend.",
    insight: "Arbeit als Flucht („Wenn ich funktioniere, muss ich nichts fühlen“) ist eine gesellschaftlich belohnte Vermeidung — darum so schwer zu erkennen. Sie bricht nicht zusammen, wenn man pausiert; sie zeigt erst dann, was sie trug.",
  }, [e("leere", "schutz-vor"), e("motor", "komorbid")]),

  n("schmerzschwelle", "Die Schmerzschwelle", "Meldet nichts mehr, bis es zu spät ist", "koerper", "zustand", 1, 86, {
    intro: "Eine Klingel an diesem Haus ist abgestellt. Pakete kommen an. Niemand öffnet. Die Pakete sind Signale.",
    verstehen: [
      "Du stellst die Klingel wieder an und übst das Öffnen: müde? hungrig? überfordert? Jede Antwort ist eine Übung.",
      "„Du hast abgestellt, weil es zu viel war“, sagst du. „Jetzt kommt es in Dosen zurück.“",
    ],
    frieden: "Die Klingel läutet wieder: leise, verlässlich, rechtzeitig.",
    insight: "Wer Bedürfnisse und Schmerzsignale lange übergehen musste, verlernt das Wahrnehmen (Interozeption). Es kehrt zurück über regelmäßiges, freundliches Nachfragen beim eigenen Körper — wie bei einem schüchternen Nachbarn.",
  }, [e("watte", "komorbid"), e("betaubung", "komorbid")]),
];

// ─── BINDUNG & VERLUST (Die Bindungssunde) ─────────────────────────

const SEED_BINDUNG: PhenomenonSeed[] = [
  n("trauer", "Die Trauerwelle", "Kommt, wenn sie gebraucht wird, nicht wenn es passt", "bindung", "zustand", 2, 48, {
    intro: "Diese Bucht hat ihre eigene Flut: Sie steigt, wenn ein Lied, ein Geruch, ein Stuhl erinnert.",
    verstehen: [
      "Du bleibst am Ufer stehen, wenn die Welle kommt, und lässt sie dich nass machen. Sie zieht sich zurück. Immer.",
      "„Du bist kein Rückfall“, sagst du. „Du bist Liebe mit Regenwetter.“ Die Bucht funkelt.",
    ],
    frieden: "Die Welle wird zur Flut mit Kalender: Sie kommt noch, aber sie kündigt sich an.",
    insight: "Trauer kommt in Wellen — unvorhersehbar, normal, gesund. Sie ist kein Symptom zum Wegmachen, sondern Liebe, die ihren Menschen sucht. Wer Wellen erwartet, ertrinkt nicht in ihnen.",
  }, [e("verlassenheit", "komorbid"), e("leerer-stuhl", "komorbid")]),

  n("verlassenheit", "Die Verlassenheit", "Alle Fortgegangenen auf einmal", "bindung", "symptom", 2, 42, {
    intro: "Ein Bahnhof ohne Anzeigetafel. Alle Gleise sind frei. Genau das ist das Problem.",
    verstehen: [
      "Du setzt dich auf eine Bank und sagst: „Ich bin noch da.“ Für dich selbst. Das ist der ganze Satz.",
      "Die Verlassenheit setzt sich neben dich. Sie wollte nie allein sein — das ist ihre ganze Geschichte.",
    ],
    frieden: "Der Bahnhof bekommt eine Anzeigetafel: Abfahrten und Ankünfte, beide in deiner Handschrift.",
    insight: "Das Gefühl, verlassen worden zu sein, kann älter sein als jede Erinnerung — und aktiviert sich bei jedem Abschied neu. Es wird stiller, wenn die Gegenwart beweist: Diesmal bleibt jemand. Zum Beispiel du selbst.",
  }, [e("trauer", "komorbid"), e("verlustangst", "komorbid")]),

  n("leerer-stuhl", "Der leere Stuhl", "Ein Platz, der bleibt", "bindung", "symptom", 1, 50, {
    intro: "Am Tisch eines Strandcafés steht ein Stuhl, den niemand wegräumt. Zurecht.",
    verstehen: [
      "Du setzt dich gegenüber und bestellst zwei Tassen. Eine für dich. Eine für das, was war.",
      "„Weggeräumt wird hier nichts“, sagst du. „Aber neu besetzt darf werden — irgendwann, ehrlich.“",
    ],
    frieden: "Der Stuhl bleibt — als Ehrenplatz, nicht als Verbot.",
    insight: "Weitertrauern heißt nicht vergessen: Der Platz eines Verstorbenen oder Verlorenen darf leer bleiben und trotzdem ins Leben integriert werden. Rituale (Tasse, Datum, Gespräch) tragen weiter, was keine Antwort mehr bekommt.",
  }, [e("trauer", "komorbid"), e("vermissen", "komorbid")]),

  n("sehnsucht", "Die Sehnsucht", "Nach etwas, das es nie gab", "bindung", "zustand", 1, 55, {
    intro: "Von diesem Kap aus sieht man eine Küste, die auf keiner Karte ist. Alle hier schauen hin. Alle weinen leise.",
    verstehen: [
      "Du schaust mit und sagst: „Sie war echt — als Hoffnung.“ Die Küste nickt. Hoffnungen sind auch Verluste.",
      "„Trauern um das, was nie war, ist erlaubt“, sagst du. Die Küste verabschiedet sich würdevoll.",
    ],
    frieden: "Das Kap wird zum Ausguck für das, was kommen kann — statt für das, was fehlte.",
    insight: "Sehnsucht nach einer Kindheit, einem Menschen oder einem Leben, das es nie gab, ist eine legitime Trauerform — oft die stillste. Sie darf betrauert werden; erst dann gibt sie den Blick frei für das Mögliche.",
  }, [e("leere", "komorbid"), e("trauer", "komorbid")]),

  n("abschied", "Der unvollendete Abschied", "Kein letztes Wort gefunden", "bindung", "symptom", 2, 58, {
    intro: "Ein Pier endet hier mitten im Bau. Ein Schiff ist abgefahren, ohne dass jemand winkte.",
    verstehen: [
      "Du stehst am Pierende und sagst das Ungesagte trotzdem — zum Meer, zum Wind, zur Person, wo immer sie ist.",
      "„Abschiede brauchen keine Anwesenheit“, sagst du. „Nur Wahrheit.“ Der Pier bekommt sein letztes Brett.",
    ],
    frieden: "Der Pier wird fertig — und Schiffe legen wieder an: neue, eigene.",
    insight: "Ungesagtes bindet: Ein fehlender Abschied hält die Verbindung in einem Schwebezustand. Er kann nachgeholt werden — im Gespräch mit dem leeren Stuhl, im Brief, im Ritual. Die Wirkung ist gut erforscht.",
  }, [e("leerer-stuhl", "komorbid"), e("trennungsecho", "komorbid")]),

  n("trauerblock", "Der Trauerblock", "Kann nicht weinen, wo es nötig wäre", "bindung", "schutz", 1, 44, {
    intro: "Hinter diesem Deich staut sich Regen. Er will fließen. Der Deich hält. Der Deich heißt Vernunft.",
    verstehen: [
      "Du klopfst an den Deich: „Nur ein Schütze.“ Ein Rinnsal kommt. Es reicht für heute. Es ist ehrlich.",
      "„Du hast mich funktionsfähig gehalten“, sagst du. „Jetzt bin ich stark genug für Rinnsale.“",
    ],
    frieden: "Der Deich wird zum Flussbett: Er leitet, statt zu stauen.",
    insight: "Nicht weinen können ist selten Kälte, meist Sicherheitsabschaltung: Der Schmerz war einmal zu groß für die Umgebung. Er kommt zurück, wenn der Rahmen stimmt — in Dosen, nie auf Kommando.",
  }, [e("gefuehlsueberflutung", "schutz-vor"), e("betaubung", "komorbid")]),

  n("heimweh", "Das Heimweh", "Nach einem Ort, der Sicherheit hieß", "bindung", "zustand", 1, 52, {
    intro: "Alle Wegweiser dieser Wiese zeigen in dieselbe Richtung: nach Hause. Keiner kennt die Koordinaten.",
    verstehen: [
      "Du baust aus zwei Steinen und einem Ast ein winziges Zuhause auf der Wiese. Das Heimweh betrachtet es lange.",
      "„Zuhause ist kein Ort“, sagst du. „Es ist ein Gefühl, das man tragen kann.“ Es klettert in deine Tasche.",
    ],
    frieden: "Das Heimweh wird zum Kompass nach innen: Es zeigt auf dich.",
    insight: "Heimweh nach Sicherheit ist ein Sehnsuchtszustand des Bindungssystems — es sucht den Ort, an dem das Nervensystem ruhen konnte. Er lässt sich in der Gegenwart neu bauen: Menschen, Rituale, Orte — und schließlich in einem selbst.",
  }, [e("sehnsucht", "komorbid"), e("einsamkeit", "komorbid")]),

  n("alte-wunde", "Die alte Wunde", "Vernarbt, aber wetterfühlig", "bindung", "symptom", 2, 46, {
    intro: "Ein Baum mit einer alten Blitznarbe steht hier. Er wächst weiter. Bei Regen zieht die Narbe.",
    verstehen: [
      "Du legst die Hand auf die Narbe: „Du bist verheilt. Verheilt ist nicht vergessen.“ Der Baum rauscht zustimmend.",
      "„Wetterfühlig zu sein ist keine Schwäche“, sagst du. „Es ist Wissen mit Gefühl.“",
    ],
    frieden: "Die Narbe wird zum Jahresring: Teil des Wachstums, sichtbar, stabil.",
    insight: "Alte Verletzungen bleiben als Empfindlichkeit bestehen — Narben reagieren auf Wetter, seelische wie körperliche. Das ist keine Rückkehr der Verletzung, sondern Erinnerung im Gewebe; sie verträgt Pflege statt Schimpfen.",
  }, [e("verlassenheit", "echo"), e("trauer", "komorbid")]),

  n("kummer", "Der Kummerkasten", "Sammelt, was keiner hören wollte", "bindung", "zustand", 1, 40, {
    intro: "Ein Kasten mit Schlitz steht hier, vollgestopft mit Zetteln. Jeder Zettel ein ungehörter Kummer.",
    verstehen: [
      "Du ziehst einen Zettel und liest ihn laut vor. Dem Meer. Es zählt als Gehörtwerden — der Kasten wird leichter.",
      "„Kummer ist keine Post für den Müll“, sagst du. „Er will nur zugestellt werden.“",
    ],
    frieden: "Der Kasten wird zum Briefkasten: regelmäßig geleert, von dir selbst.",
    insight: "Ungeteilter Kummer summiert sich — das Nervensystem hält ihn als Dauerlast. Ihn zu formulieren (schriftlich, laut, gegenüber Menschen) ist messbar entlastend, auch ohne Antwort.",
  }, [e("trauer", "komorbid"), e("abschied", "komorbid")]),

  n("trennungsecho", "Das Trennungsecho", "Jedes Ende klingt wie das erste", "bindung", "zustand", 1, 54, {
    intro: "In diesem Tal klingt jeder Abschied nach — und alle klingen gleich, wie der allererste.",
    verstehen: [
      "Du sagst einen kleinen Abschied laut: vom Tag, vom Essen, vom Besuch. Das Echo wird mit jedem ehrlichen Abschied leiser.",
      "„Nicht jedes Ende ist der Weltuntergang“, sagst du. „Manche sind nur zweiundzwanzig Uhr.“ Das Tal lacht. Leise.",
    ],
    frieden: "Das Echo wird zum Gutenachtwort: Es beendet den Tag, nicht die Welt.",
    insight: "Neue Trennungen können alte Verluste mitaktivieren — die Intensität gehört oft der Summe aller Abschiede. Kleine Abschiede bewusst zu vollziehen trainiert das System: Enden ist überlebbar.",
  }, [e("verlassenheit", "echo"), e("verlustangst", "komorbid")]),

  n("vermissen", "Das Vermissen", "Ein Zimmer mit offener Tür", "bindung", "zustand", 1, 41, {
    intro: "Ein Zimmer steht hier mit offener Tür. Es ist aufgeräumt. Es wartet. Es darf warten.",
    verstehen: [
      "Du setzt dich in das Zimmer und vermisst ausdrücklich, ohne etwas zu ändern. Das Zimmer wird warm.",
      "„Vermissen ist Liebe ohne Adresse“, sagst du. „Sie darf hier wohnen. Sie muss nicht umziehen.“",
    ],
    frieden: "Das Zimmer bleibt — mit einem Bett für Gäste und einem Sessel für dich.",
    insight: "Vermissen ist der Preis von Bindung — es weist auf das, was wichtig war, und es schmerzt ehrlich. Es wird nicht kleiner durch Ablenkung, aber wohnlicher durch Einrichten: Erinnerung, Ritual, Platz im Alltag.",
  }, [e("leerer-stuhl", "komorbid"), e("heimweh", "komorbid")]),

  n("insel-ohne", "Der Ort, den es nicht gibt", "Die Heimat hinter dem Horizont", "bindung", "zustand", 1, 60, {
    intro: "Auf der Seekarte dieses Ortes steht eine Insel eingezeichnet, die es nie gegeben hat. Alle kennen sie. Keiner war dort.",
    verstehen: [
      "Du fährst die Insel nicht an. Du zeichnest sie fertig: Palmen, Feuer, ein Haus. Sie wird echt — als Bild.",
      "„Manche Heimaten werden gebaut statt gefunden“, sagst du. „Baumaterial: heute.“",
    ],
    frieden: "Die Insel wird zum Baustellenschild: Hier entsteht Zuhause. Fertigstellung: laufend.",
    insight: "Die Sehnsucht nach einem Ort der Geborgenheit, den es nie gab, ist eine Richtung, keine Täuschung: Sie zeigt, was das Nervensystem sucht. Diese Geborgenheit lässt sich im Jetzt bauen — Stück für Stück, mit Menschen und Ritualen.",
  }, [e("sehnsucht", "komorbid"), e("heimweh", "komorbid")]),
];

// ─── WUT & GRENZE (Der Zorn-Atoll) ─────────────────────────────────

const SEED_WUT: PhenomenonSeed[] = [
  n("reizbar", "Das Pulverfass", "Kurze Lunte, lange Geschichte", "wut", "symptom", 2, 6, {
    intro: "Auf diesem Felsen lagern Fässer. Sie sind alt. Die neuesten Funken springen schon von allein.",
    verstehen: [
      "Du zählst rückwärts von zehn — nicht um zu schweigen, sondern um zu wählen. Das Fass atmet aus.",
      "„Du bist keine schlechte Laune“, sagst du. „Du bist ein Lagerhaus voller ungehörter Alarmsignale.“",
    ],
    frieden: "Das Pulverfass wird zum Depot eines Friedens: verschlossen, inventarisiert, überflüssig.",
    insight: "Reizbarkeit ist das Austreten von Daueralarm durch die kleinste Ritze — die Ladung ist alt, der Auslöser neu. Die Lunte verlängert sich mit Schlaf, Regulation und dem Entladen der Altlast, nicht mit Beherrschung.",
  }, [e("wutausbruch", "komorbid"), e("schreck", "komorbid"), e("bleimuede", "uebergang")], "reizbar"),

  n("wutausbruch", "Der Vulkan", "Schluckt alles, bis er spricht", "wut", "symptom", 2, 4, {
    intro: "Ein Berg mit warmem Krater. Er bebt nicht oft. Wenn er bebt, bebt alles.",
    verstehen: [
      "Du liest dem Berg die Inschrift am Fuß vor: „Wartung seit Jahren überfällig.“ Er stimmt zu — das Beben war ein Wartungshinweis.",
      "„Deine Lava ist Hitze aus alter Zeit“, sagst du. „Neue Ventile, dann wird es gut.“",
    ],
    frieden: "Der Vulkan wird zum heißen Quellgebirge: warm, genutzt, unter Beobachtung.",
    insight: "Wutausbrüche nach langem Schlucken sind Druckentlastung ohne Ventil — sie sagen mehr über die Dauer des Schluckens als über die Person. Wut in kleinen Dosen zu spüren und zu äußern, bevor sie kocht, ist lernbar.",
  }, [e("reizbar", "komorbid"), e("scham", "uebergang"), e("stau", "komorbid")]),

  n("groll", "Der Groll", "Ein Feuer im Keller", "wut", "symptom", 1, 8, {
    intro: "Unter diesem Haus brennt etwas Langsames. Es raucht nicht. Aber es warmt die Böden seit Jahren.",
    verstehen: [
      "Du steigst in den Keller und schaust das Feuer an. „Wofür brennst du?“, fragst du. Es zeigt auf eine alte Ungerechtigkeit.",
      "„Du brennst für Gerechtigkeit“, sagst du. „Aber du heizt das falsche Haus.“",
    ],
    frieden: "Das Kellerfeuer wird zum Herd: Es kocht jetzt Mahlzeiten statt Böden.",
    insight: "Groll ist Wut im Dauerbetrieb bei ausbleibender Anerkennung — er bindet Energie an Vergangenes. Er löst sich nicht durch Verzeihen auf Befehl, sondern durch Anerkennen des eigenen Schmerzes.",
  }, [e("verratserwartung", "echo"), e("reizbar", "komorbid")]),

  n("grenzenlos", "Die offene Tür", "Jeder darf herein, immer", "wut", "symptom", 1, 9, {
    intro: "Ein Haus ohne Tür. Alle gehen rein und raus. Der Bewohner lächelt müde und räumt hinterher.",
    verstehen: [
      "Du hängst eine Tür ein — erst nur Rahmen und Blatt. Der Bewohner weint vor Erleichterung.",
      "„Gastfreund zu sein heißt nicht, kein Zuhause zu haben“, sagst du. Die Tür bekommt eine Klinke. Von innen.",
    ],
    frieden: "Die Tür bleibt — mit Türspion und einer Klingel mit Öffnungszeiten.",
    insight: "Keine Grenzen setzen zu können ist oft erlernt: Ablehnung war einmal gefährlich. Grenzen sind keine Mauern gegen Menschen, sondern Türen mit eigener Klinke — und „Nein“ ist ein ganzer Satz.",
  }, [e("anpasser", "komorbid"), e("dornenhecke", "uebergang")]),

  n("dornenhecke", "Die Dornenhecke", "Grenzen, die verletzen", "wut", "schutz", 1, 3, {
    intro: "Um einen Garten wächst eine Hecke aus Dornen, meterhoch. Dahinter blüht es. Niemand sieht es.",
    verstehen: [
      "Du schneidest ein Tor in die Hecke — mit gutem Werkzeug und Geduld. Die Blumen dahinter atmen auf.",
      "„Du hast Stacheln gezogen, weil Hände kamen“, sagst du. „Jetzt darfst du wählen, wer pflückt.“",
    ],
    frieden: "Die Hecke bleibt als Rahmen — mit Tor, mit Schlüssel, mit Blumen, die man sehen darf.",
    insight: "Verletzende Abgrenzung (Gereiztheit, Härte) ist oft die einzige Grenze, die jemand je konnte — sie schützt Blühendes. Sie darf weicher werden, sobald sie nicht mehr die einzige ist.",
  }, [e("naehe", "schutz-vor"), e("wachhund", "komorbid")]),

  n("schutzzorn", "Der Schutzzorn", "Wütend für alle, die nicht können", "wut", "zustand", 1, 7, {
    intro: "Ein Wesen mit erhobener Faust steht hier Wache — vor anderen, nie vor sich selbst.",
    verstehen: [
      "Du stellst dich daneben und hältst Wache mit. Der Zorn schaut überrascht: Er hatte noch nie Verstärkung.",
      "„Du kämpfst für die Richtigen“, sagst du. „Aber auch du darfst mal hinter der Mauer stehen.“",
    ],
    frieden: "Der Schutzzorn wird zum Anwalt mit Feierabend: engagiert, aber nicht mehr rund um die Uhr.",
    insight: "Wut zugunsten anderer ist oft die einzige erlaubte Wut — für sich selbst einzutreten war verboten. Sie ist edel und erschöpfend zugleich; sie wird gesund, wenn sie sich selbst einschließt.",
  }, [e("gerechtigkeitsbrand", "komorbid"), e("grenzenlos", "komorbid")]),

  n("gerechtigkeitsbrand", "Der Gerechtigkeitsbrand", "Alles soll endlich fair sein", "wut", "symptom", 1, 5, {
    intro: "Überall an diesem Platz brennen kleine Fackeln. Jede trägt den Namen einer Ungerechtigkeit.",
    verstehen: [
      "Du liest die Namen der Fackeln laut vor. Manche sind sehr alt. Zwei darfst du löschen: die, die nicht deine waren.",
      "„Gerechtigkeit zu wollen ist kein Fehler“, sagst du. „Aber dein Herz ist kein Gerichtssaal im Dauerbetrieb.“",
    ],
    frieden: "Zwei Fackeln bleiben: für das, was wirklich deins ist. Sie wärmen, statt zu verzehren.",
    insight: "Ein brennendes Gerechtigkeitsempfinden nach erlittener Ungerechtigkeit ist Wahrheitssuche — erschöpfend, wenn es jede Unbill der Welt einsammelt. Es darf priorisieren: Der eigene Fall zuerst.",
  }, [e("schutzzorn", "komorbid"), e("groll", "komorbid")]),

  n("impuls", "Der Impuls", "Handelt, bevor das Denken fertig ist", "wut", "symptom", 1, 10, {
    intro: "Etwas schießt hier quer über den Platz: ein „Jetzt!“, bevor das „Ob“ ausgesprochen ist.",
    verstehen: [
      "Du wirfst einen Ball hoch und fängst ihn erst nach drei Sekunden. Der Impuls schaut zu, wie Zeit entsteht.",
      "„Du warst schnell, als Schnellsein rettete“, sagst du. „Jetzt darfst du die Sekunden dazwischen kennenlernen.“",
    ],
    frieden: "Der Impuls wird zum Sprinter mit Startschuss: schnell, aber nicht mehr vor dem Signal.",
    insight: "Impulsivität unter Alarm ist das Abkürzen zwischen Reiz und Reaktion — früher überlebenswichtig. Die Lücke dazwischen (Stopp — Wahl — Handlung) ist ein trainierbarer Muskel, kein Charakterzug.",
  }, [e("wutausbruch", "komorbid"), e("motor", "komorbid")]),

  n("racheplan", "Der Racheplan", "Schreibt Szenarien, die nie gespielt werden", "wut", "muster", 1, 2, {
    intro: "In einer Höhle hängen Landkarten von Schlachten, die nie stattfanden. Sie sind detailliert. Sehr detailliert.",
    verstehen: [
      "Du liest eine Karte bis zum Ende und fragst: „Und dann?“ Die Höhle ist still. Das „Dann“ war nie geplant.",
      "„Du wolltest nur, dass es einmal anders ausgeht“, sagst du. „Das verstehe ich. Es geht anders aus — ohne Schlacht.“",
    ],
    frieden: "Die Höhle wird zum Archiv: Die Karten bleiben als Beweis der Würde, nicht als Anleitung.",
    insight: "Rachefantasien sind Selbstgespräche über Würde — sie erzeugen kurz ein Gefühl von Handlungsmacht. Sie loszulassen heißt nicht, das Unrecht zu entschuldigen, sondern die eigene Energie zurückzuholen.",
  }, [e("groll", "komorbid"), e("dauerschleife", "komorbid")]),

  n("wachhund", "Der Wachhund", "Bellt zuerst, fragt später", "wut", "schutz", 1, 1, {
    intro: "An einem Gartenzaun steht ein Hund, der jeden Passanten verbellt. Er ist todmüde. Er bellt weiter.",
    verstehen: [
      "Du gehst langsam vorbei, jeden Tag zur selben Zeit, mit denselben Worten. Am vierten Tag wedelt er kurz. Kurz nur.",
      "„Du bellst, weil du Angst hast, nicht weil du böse bist“, sagst du. Er legt sich hin. Erstmals tagsüber.",
    ],
    frieden: "Der Wachhund bleibt Wachhund — aber mit einem ruhigen Korb und klarem Feierabend.",
    insight: "Aggressive Vorsicht („erst mal knurren“) ist Schutz durch Abschreckung — sie verhindert die Überprüfung, ob die Gegenwart sicher ist. Sie wird ruhiger durch wiederholte, unbeschadete Begegnungen.",
  }, [e("verratserwartung", "schutz-vor"), e("dornenhecke", "komorbid")]),

  n("stau", "Der Stau", "Alles will raus, nichts darf", "wut", "zustand", 1, 11, {
    intro: "Auf einer Straße hier steht alles still: Gedanken, Gefühle, Worte. Alle hupen innerlich.",
    verstehen: [
      "Du öffnest eine einzige Seitenstraße: einen Satz, laut, an den Baum. Der Stau atmet. Eine Lücke tut sich auf.",
      "„Aufstauen war Ordnung“, sagst du. „Fließen ist auch Ordnung — eine lebendige.“",
    ],
    frieden: "Der Stau wird zum Kreisverkehr: Alles fließt, jeder kommt dran.",
    insight: "Das Aufstauen von Gefühlen und Bedürfnissen ist die Folge von „nicht jetzt, nicht hier“ über Jahre — Druck sucht sich dann eigene Wege (Körper, Ausbrüche). Kleine, regelmäßige Abflüsse sind die Verkehrsplanung.",
  }, [e("reizbar", "komorbid"), e("wutausbruch", "uebergang"), e("motor", "komorbid")]),

  n("streitfink", "Der Streitfink", "Sucht den Kampf, weil er Nähe meint", "wut", "muster", 1, 12, {
    intro: "Auf einem Marktplatz wird hier laut verhandelt — nicht um Ware, sondern um jedes Wort.",
    verstehen: [
      "Du bleibst nach dem Streit stehen und sagst: „Ich bin noch da.“ Der Fink verstummt. Darum ging es die ganze Zeit.",
      "„Streit war deine Sprache für ‚Bleib bei mir‘“, sagst du. „Es gibt leisere Wörter dafür.“",
    ],
    frieden: "Der Streitfink wird zum Debattenclub mit Umarmung am Ende: Feuer ja, Feindschaft nein.",
    insight: "Streitsuchen kann erlernte Nähe sein: Wo nur Konflikt Aufmerksamkeit brachte, wird der Kampf zur Bindungsform. Er verliert seine Notwendigkeit, wenn Nähe auch ohne Lautstärke verfügbar ist.",
  }, [e("naehe", "komorbid"), e("wiederholer", "komorbid")]),
];

// ─── MÜDIGKEIT & RÜCKZUG (Die Nebelbank) ───────────────────────────

const SEED_MUEDIGKEIT: PhenomenonSeed[] = [
  n("zurueckgezogen", "Der Rückzug", "Die Welt wird ein Zimmer, dann ein Bett", "muedigkeit", "zustand", 2, 215, {
    intro: "Die Wege dieses Ortes werden schmaler, je weiter man geht — bis nur noch ein Zimmer übrig ist.",
    verstehen: [
      "Du öffnest im Zimmer ein Fenster, nur einen Spalt. Frische Luft. Der Rückzug bemerkt es nicht sofort — dann dankbar.",
      "„Du hast mich vor Überforderung bewahrt“, sagst du. „Aber draußen wartet auch Luft.“",
    ],
    frieden: "Das Zimmer bekommt einen Balkon: Rückzug mit Horizont.",
    insight: "Sozialer Rückzug und Interessenverlust sind klassische Zeichen von Erschöpfung und Hypoarousal — das System spart. Es kommt nicht durch Druck zurück, sondern durch kleine, gelingende Außenkontakte in Eigenregie.",
  }, [e("vermeidung", "komorbid"), e("isolation", "komorbid"), e("leere", "uebergang")], "zurueckgezogen"),

  n("abstumpfung", "Die Abstumpfung", "Alles ist weit weg, auch das Gute", "muedigkeit", "zustand", 2, 220, {
    intro: "Auf diesem Feld liegt alles hinter einer dünnen Folie: Farben, Gerüche, Menschen. Da, aber fort.",
    verstehen: [
      "Du hältst einen Stein in der Hand, bis er warm wird. Die Folie bekommt ein Loch von Steingröße. Ein Anfang.",
      "„Du hast die Empfindlichkeit gedämpft, weil sie wehtat“, sagst du. „Sie darf zurück — in Steingröße.“",
    ],
    frieden: "Die Folie wird zu Folie im Bastelkasten: nützlich für Notfälle, nicht mehr für den Alltag.",
    insight: "Gefühlsabstumpfung ist die Miete für das Überleben von Überforderung — das System dreht alles herunter, nicht nur das Schlechte. Es löst sich über den Körper (Temperatur, Textur, Bewegung), nicht über Grübeln.",
  }, [e("taubheit", "komorbid"), e("betaubung", "komorbid"), e("vermeidung", "uebergang")], "gefuehlsabstumpfung"),

  n("bleimuede", "Die Bleimüdigkeit", "Schlaf füllt sie nicht mehr", "muedigkeit", "zustand", 2, 225, {
    intro: "Hier liegt Blei in den Gliedern der Landschaft: Die Bäume hängen, das Gras hängt, das Licht hängt.",
    verstehen: [
      "Du legst dich neben das Blei und ruhst, ohne dich zu schämen. Es wird nicht leichter — aber ehrlicher.",
      "„Du bist keine Faulheit“, sagst du. „Du bist die Rechnung für Jahre des Durchhaltens.“ Das Blei nickt schwer.",
    ],
    frieden: "Das Blei wird zu einem Gewicht in einer Tasche: Es bleibt spürbar, aber du trägst es nur noch abschnittsweise.",
    insight: "Erschöpfung, die Schlaf nicht füllt, ist das Ergebnis jahrelanger Doppelarbeit: Gas und Bremse zugleich. Sie braucht Erholung im Nervensystem (Regulation, Grenzen, Hilfe), nicht nur Stunden im Bett.",
  }, [e("zurueckgezogen", "komorbid"), e("schlaf", "komorbid")]),

  n("antriebslos", "Der schwere Start", "Jeder Anfang wiegt eine Tonne", "muedigkeit", "zustand", 1, 212, {
    intro: "An diesem Startblock steht alles bereit: Schuhe, Strecke, Morgen. Nur der Startschuss wiegt eine Tonne.",
    verstehen: [
      "Du verkleinerst den Start: Schuhe anziehen ist schon ein Start. Der Block wird leichter, sobald er kleiner darf.",
      "„Du bist nicht kaputt“, sagst du. „Du bist ein Motor im Winter. Warmwerden dauert — das ist Physik.“",
    ],
    frieden: "Der Startblock wird zur Anlaufstelle: schwer nur noch am Anfang, und das ist erlaubt.",
    insight: "Antriebslosigkeit ist kein Charakter, sondern ein Energiezustand des Systems. Der wirksame Hebel ist die Verkleinerung des ersten Schritts, bis er unter die Schwelle fällt — Motivation folgt dem Tun, nicht umgekehrt.",
  }, [e("bleimuede", "komorbid"), e("aufschieben", "komorbid")]),

  n("aufschieben", "Das Aufschieben", "Morgen, morgen, immer morgen", "muedigkeit", "schutz", 1, 218, {
    intro: "Ein Berg von Zetteln: „Erledigen — morgen“. Der Berg wächst nachts. Der Berg hat Angst.",
    verstehen: [
      "Du nimmst den obersten Zettel und erledigst nur dessen erste Zeile. Der Berg schrumpft um ein Molekül — und hört auf zu wachsen.",
      "„Du hast mich vor dem Scheitern geschützt“, sagst du. „Aber Anfangen ist nicht Scheitern.“",
    ],
    frieden: "Der Berg wird zu einem Stapel mit Datum: überschaubar, angehbar, menschlich.",
    insight: "Prokrastination ist selten Faulheit, sondern Vermeidung eines Gefühls (Überforderung, Angst vor dem Ergebnis). Der Ausstieg liegt in der Miniatur: eine Aktion, so klein, dass das Gefühl nicht anspringt.",
  }, [e("kritiker", "schutz-vor"), e("vermeidung", "komorbid"), e("bildschirmflucht", "komorbid")]),

  n("bettfestung", "Die Bettfestung", "Decken bis zum Kinn gegen die Welt", "muedigkeit", "schutz", 1, 230, {
    intro: "Eine Festung aus Decken und Kissen. Weiche Mauern. Absolute Sicherheit. Absolute Gefangenschaft.",
    verstehen: [
      "Du setzt dich auf den Rand der Festung, ein Fuß auf den Boden. Der Boden ist warm. Ein Fuß reicht für heute.",
      "„Du warst mein Bunker bei Sturm“, sagst du. „Der Sturm ist vorbei. Aber die Festung darf bleiben — als Bett.“",
    ],
    frieden: "Die Festung wird wieder zum Bett: Ort des Schlafs, nicht mehr der Verteidigung.",
    insight: "Rückzug ins Bett bei Überforderung ist ein urtümlicher Schutz — weich, warm, weg. Er wird zum Problem, wenn das Bett der einzige sichere Ort bleibt. Die Grenze verschiebt sich fußbreit: ein Fuß, ein Fenster, ein Anruf.",
  }, [e("panik", "schutz-vor"), e("bleimuede", "komorbid"), e("zurueckgezogen", "komorbid")]),

  n("interessenverlust", "Das verlorene Interesse", "Alles schmeckt nach nichts mehr", "muedigkeit", "zustand", 1, 222, {
    intro: "Eine Bibliothek voller Bücher, alle mit leeren Seiten. Sie waren mal voll. Sie erinnern sich vage.",
    verstehen: [
      "Du schlägst ein Buch auf und liest eine einzige Zeile. Die Zeile färbt sich schwach. Das Buch freut sich.",
      "„Interesse kommt zurück wie Wildtiere“, sagst du. „Man lockt es mit Geduld, nicht mit Rufen.“",
    ],
    frieden: "Die Bibliothek füllt sich — Zeile für Zeile, Buch für Buch, Tier für Tier.",
    insight: "Interessenverlust ist ein Kernzeichen von Erschöpfung und Depression — das Belohnungssystem ist im Sparmodus. Es reaktiviert sich über kleine, wiederholte Dosen ehemals geliebter Tätigkeit, ohne Erfolgsdruck.",
  }, [e("abstumpfung", "komorbid"), e("leere", "komorbid")]),

  n("funktion", "Die Funktion", "Läuft. Fragt nicht.", "muedigkeit", "schutz", 1, 228, {
    intro: "Eine Maschine erledigt hier alles: Job, Einkauf, Anrufe. Sie ist tadellos. Sie hat keinen Geschmack.",
    verstehen: [
      "Du drückst eine Pausentaste, die noch nie gedrückt wurde. Die Maschine steht. Sie zittert. Sie lebt.",
      "„Du hast mich durch Tage getragen, die ich nicht fühlte“, sagst du. „Jetzt fühlen wir sie nach — in Raten.“",
    ],
    frieden: "Die Funktion wird zum Werkzeug statt zur Haut: Sie läuft, wenn du läufst — nicht statt dir.",
    insight: "Der Funktionsmodus — alles läuft, nichts ist da — ist eine hochleistungsfähige Alltagsdissoziation, gesellschaftlich belohnt und innerlich teuer. Er weicht, wenn Pausen aufhören, sich wie Versagen anzufühlen.",
  }, [e("autopilot", "komorbid"), e("arbeitsturm", "komorbid")]),

  n("schlafhut", "Der Schlafhut", "Flucht in den Schlaf", "muedigkeit", "schutz", 1, 232, {
    intro: "Ein Hut aus Dämmerung liegt über diesem Ort. Wer ihn aufsetzt, schläft. Er passt jedem. Er passt zu gut.",
    verstehen: [
      "Du setzt den Hut ab und lässt die Augen sich an das Licht gewöhnen — eine Minute reicht.",
      "„Du hast die Stunden überbrückt, die nicht zu tragen waren“, sagst du. „Aber Schlaf als Versteck hat keinen Morgen.“",
    ],
    frieden: "Der Hut wird zum Schlafhut in Ehren: für die Nacht — und die Nacht reicht.",
    insight: "Flucht in den Schlaf — mehr, als der Körper braucht — ist Vermeidung mit biologischem Mantel: Sie verdunkelt die Tagesstruktur und verstärkt die Müdigkeit. Licht, Zeiten und ein Grund zum Aufstehen wirken besser als Willenskraft.",
  }, [e("graue-zeit", "schutz-vor"), e("bleimuede", "komorbid"), e("bettfestung", "komorbid")]),

  n("graue-zeit", "Die graue Zeit", "Tage ohne Innenleben", "muedigkeit", "zustand", 1, 235, {
    intro: "Die Kalenderblätter hier sind alle grau. Nicht traurig. Nicht froh. Grau.",
    verstehen: [
      "Du malst ein einziges Blatt an: einen Punkt, eine Linie, egal was. Das Blatt behält die Farbe.",
      "„Du bist kein Versagen“, sagst du. „Du bist der Winter des Kalenders. Er geht vorbei — ich bleibe.“",
    ],
    frieden: "Die Blätter bekommen ihre Farben zurück: nicht alle, aber jedes zweite — und das wächst.",
    insight: "Tage ohne Erleben sind das Gefühl der Hypoarousal-Dauerwelle: Das System läuft im Mindestbetrieb. Ein einziger bewusster, gestalteter Moment pro Tag ist der erforschte Anfang der Rückkehr.",
  }, [e("bleimuede", "komorbid"), e("interessenverlust", "komorbid")]),

  n("stapel", "Der Stapel", "Unbeantwortete Post aus dem eigenen Leben", "muedigkeit", "zustand", 1, 214, {
    intro: "Ein Stapel Briefe, alle ungeöffnet. Manche sind Einladungen. Manche sind Rechnungen. Alle sind gleich schwer.",
    verstehen: [
      "Du öffnest einen Brief — den kleinsten. Er enthält nichts Schlimmes. Sie enthalten fast nie etwas Schlimmes.",
      "„Du bist kein Chaos“, sagst du. „Du bist aufgeschobene Beziehung. Eine pro Woche reicht.“",
    ],
    frieden: "Der Stapel wird zum Postfach mit Laufzeit: geöffnet, geordnet, beantwortet — in Raten.",
    insight: "Unbeantwortete Post und liegengebliebene Anschlüsse sind die sichtbare Spur von Vermeidung und Erschöpfung — jedes Ungeöffnete wird schwerer. Die kleinste Öffnung zuerst ist die bewährte Taktik.",
  }, [e("aufschieben", "komorbid"), e("isolation", "komorbid")]),
];

// ─── Gesamtkatalog ─────────────────────────────────────────────────

export const GRAPH_SEEDS: PhenomenonSeed[] = [
  ...SEED_ALARM,
  ...SEED_GLAS,
  ...SEED_SCHAM,
  ...SEED_MISTRAUEN,
  ...SEED_WIEDERKEHR,
  ...SEED_KOERPER,
  ...SEED_BINDUNG,
  ...SEED_WUT,
  ...SEED_MUEDIGKEIT,
];
