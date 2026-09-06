import { checklistIds, getGuide, profilePresets } from "../data/guides";
import type { ProfileId } from "../data/guides";
import { RESEARCH_DATE, sources } from "../data/sources";

export type CoolingMode = "all" | "upper" | "lower" | "off";
export const coolingLabels: Record<CoolingMode, string> = {
  all: "Все 4 вентилятора",
  upper: "Верхняя пара",
  lower: "Нижняя пара",
  off: "Выключены",
};
export interface DeviceInfo {
  version: "unknown" | "23H2" | "24H2" | "25H2" | "other";
  edition: "unknown" | "Home" | "Pro" | "other";
  build: string;
  bios: string;
  driver: string;
  games: string;
  charger: "unknown" | "45" | "65" | "other";
  tweaks: string;
}
export interface Measurement {
  id: string;
  createdAt: string;
  stage: "before" | "after";
  game: string;
  scene: string;
  profile: ProfileId | "baseline";
  resolution: string;
  power: "mains" | "battery";
  cooling: CoolingMode;
  ambient: number | null;
  minutes: number;
  avg: number;
  low: number | null;
  cpu: number | null;
  gpu: number | null;
  noise: "unknown" | "quiet" | "audible" | "loud";
  notes: string;
}
export const noiseLabels: Record<Measurement["noise"], string> = {
  unknown: "Не оценено",
  quiet: "Тихо",
  audible: "Слышно, приемлемо",
  loud: "Громко",
};
export interface LabState {
  schemaVersion: 1;
  checked: string[];
  profile: { id: ProfileId; fps: number };
  device: DeviceInfo;
  measurements: Measurement[];
  cooling: CoolingMode;
}
export const STORAGE_KEY = "xbook-lab:v1";
export function initialState(): LabState {
  return {
    schemaVersion: 1,
    checked: [],
    profile: { id: "balanced", fps: 60 },
    cooling: "all",
    measurements: [],
    device: {
      version: "unknown",
      edition: "unknown",
      build: "",
      bios: "",
      driver: "",
      games: "",
      charger: "unknown",
      tweaks:
        "Использовались BoosterX и неизвестный консольный твикер. Установлен Process Lasso; конфигурация неизвестна.",
    },
  };
}
const record = (x: unknown): x is Record<string, unknown> =>
  typeof x === "object" && x !== null && !Array.isArray(x);
const finiteRange = (x: unknown, min: number, max: number): x is number =>
  typeof x === "number" && Number.isFinite(x) && x >= min && x <= max;
const nullableRange = (x: unknown, min: number, max: number) =>
  x === null || finiteRange(x, min, max);
const shortText = (x: unknown, max: number) =>
  typeof x === "string" && x.length <= max;
const oneOf = <T extends string>(
  x: unknown,
  options: readonly T[],
  fallback: T,
): T =>
  typeof x === "string" && options.includes(x as T) ? (x as T) : fallback;
export const profileName = (id: string) =>
  id === "baseline"
    ? "Исходная конфигурация"
    : (profilePresets.find((p) => p.id === id)?.name ?? "Неизвестно");

export function isMeasurement(x: unknown): x is Measurement {
  if (!record(x)) return false;
  return (
    typeof x.id === "string" &&
    x.id.length > 0 &&
    x.id.length <= 100 &&
    typeof x.createdAt === "string" &&
    Number.isFinite(Date.parse(x.createdAt)) &&
    typeof x.stage === "string" &&
    ["before", "after"].includes(x.stage) &&
    shortText(x.game, 100) &&
    String(x.game).trim().length > 0 &&
    shortText(x.scene, 150) &&
    String(x.scene).trim().length > 0 &&
    typeof x.profile === "string" &&
    ["baseline", "quiet", "balanced", "performance"].includes(x.profile) &&
    shortText(x.resolution, 50) &&
    String(x.resolution).trim().length > 0 &&
    typeof x.power === "string" &&
    ["mains", "battery"].includes(x.power) &&
    typeof x.cooling === "string" &&
    ["all", "upper", "lower", "off"].includes(x.cooling) &&
    nullableRange(x.ambient, 0, 50) &&
    finiteRange(x.minutes, 1, 240) &&
    finiteRange(x.avg, 0.1, 2000) &&
    nullableRange(x.low, 0.1, 2000) &&
    (x.low === null || (x.low as number) <= x.avg) &&
    nullableRange(x.cpu, 1, 120) &&
    nullableRange(x.gpu, 1, 120) &&
    typeof x.noise === "string" &&
    ["unknown", "quiet", "audible", "loud"].includes(x.noise) &&
    shortText(x.notes, 1000)
  );
}

export function parseStoredState(raw: string | null): {
  state: LabState;
  issue: string | null;
} {
  const base = initialState();
  if (!raw) return { state: base, issue: null };
  try {
    const data: unknown = JSON.parse(raw);
    if (!record(data) || data.schemaVersion !== 1) throw new Error("schema");
    const d = record(data.device) ? data.device : {};
    const p = record(data.profile) ? data.profile : {};
    const id = oneOf(
      p.id,
      ["quiet", "balanced", "performance"] as const,
      "balanced",
    );
    const seen = new Set<string>();
    const measurements = Array.isArray(data.measurements)
      ? data.measurements
          .filter(isMeasurement)
          .filter((m) => {
            if (seen.has(m.id)) return false;
            seen.add(m.id);
            return true;
          })
          .slice(0, 200)
      : [];
    const removed =
      Array.isArray(data.measurements) &&
      measurements.length !== data.measurements.length;
    const state: LabState = {
      schemaVersion: 1,
      checked: Array.isArray(data.checked)
        ? [
            ...new Set(
              data.checked.filter(
                (x): x is string =>
                  typeof x === "string" && checklistIds.includes(x),
              ),
            ),
          ]
        : [],
      profile: {
        id,
        fps: finiteRange(p.fps, 30, 120)
          ? Math.round(p.fps / 5) * 5
          : profilePresets.find((x) => x.id === id)!.fps,
      },
      cooling: oneOf(
        data.cooling,
        ["all", "upper", "lower", "off"] as const,
        "all",
      ),
      measurements,
      device: {
        version: oneOf(
          d.version,
          ["unknown", "23H2", "24H2", "25H2", "other"] as const,
          "unknown",
        ),
        edition: oneOf(
          d.edition,
          ["unknown", "Home", "Pro", "other"] as const,
          "unknown",
        ),
        build:
          typeof d.build === "string" &&
          (!d.build || /^\d{4,6}(\.\d{1,5})?$/.test(d.build))
            ? d.build
            : "",
        bios: typeof d.bios === "string" ? d.bios.slice(0, 100) : "",
        driver: typeof d.driver === "string" ? d.driver.slice(0, 100) : "",
        games: typeof d.games === "string" ? d.games.slice(0, 300) : "",
        charger: oneOf(
          d.charger,
          ["unknown", "45", "65", "other"] as const,
          "unknown",
        ),
        tweaks:
          typeof d.tweaks === "string"
            ? d.tweaks.slice(0, 1000)
            : base.device.tweaks,
      },
    };
    const changed =
      removed ||
      !Array.isArray(data.measurements) ||
      JSON.stringify(state.checked) !== JSON.stringify(data.checked) ||
      state.profile.id !== p.id ||
      state.profile.fps !== p.fps ||
      state.cooling !== data.cooling ||
      Object.entries(state.device).some(([key, value]) => d[key] !== value) ||
      validateDevice(state.device) !== null;
    return {
      state,
      issue: changed
        ? "Часть сохранённых данных не прошла проверку. Исходные данные не перезаписаны. Скачайте исходную копию или доступный отчёт перед сбросом."
        : null,
    };
  } catch {
    return {
      state: base,
      issue:
        "Не удалось прочитать локальные данные. Сайт работает без их перезаписи. Для нового сохранения подтвердите сброс данных.",
    };
  }
}

export function validateDevice(device: DeviceInfo): string | null {
  if (device.build && !/^\d{4,6}(\.\d{1,5})?$/.test(device.build))
    return "Укажите сборку числом, например 26200.9168, или оставьте поле пустым.";
  if (
    device.version === "25H2" &&
    device.build &&
    device.build.split(".")[0] !== "26200"
  )
    return "Для 25H2 ожидается сборка 26200.x. Перепроверьте winver или выберите «Другая / не знаю».";
  if (
    device.version === "24H2" &&
    device.build &&
    device.build.split(".")[0] !== "26100"
  )
    return "Для 24H2 ожидается сборка 26100.x. Перепроверьте winver или выберите «Другая / не знаю».";
  if (
    device.version === "23H2" &&
    device.build &&
    device.build.split(".")[0] !== "22631"
  )
    return "Для 23H2 ожидается сборка 22631.x. Перепроверьте winver или выберите «Другая / не знаю».";
  return null;
}

const normalize = (text: string) =>
  text.trim().toLocaleLowerCase("ru-RU").replace(/\s+/g, " ");
export function compareMeasurements(before: Measurement, after: Measurement) {
  const warnings: string[] = [];
  if (normalize(before.game) !== normalize(after.game))
    warnings.push("Разные игры");
  if (normalize(before.scene) !== normalize(after.scene))
    warnings.push("Разные сцены / настройки");
  if (normalize(before.resolution) !== normalize(after.resolution))
    warnings.push("Разное разрешение");
  if (before.power !== after.power) warnings.push("Разное питание");
  if (before.cooling !== after.cooling)
    warnings.push("Разные режимы подставки");
  if (before.profile !== after.profile)
    warnings.push("Разные профили: уточните изменённый параметр в заметках");
  if (before.minutes !== after.minutes) warnings.push("Разная длительность");
  if (before.ambient === null || after.ambient === null)
    warnings.push("Температура комнаты не записана хотя бы в одном тесте");
  else if (before.ambient !== after.ambient)
    warnings.push("Температура комнаты отличается");
  if (before.stage === after.stage)
    warnings.push(
      "Обе записи помечены одинаковым этапом; порядок сравнения задан вручную",
    );
  else if (before.stage === "after" || after.stage === "before")
    warnings.push("Порядок сравнения обратен меткам «до/после»");
  return {
    fpsPercent: ((after.avg - before.avg) / before.avg) * 100,
    lowPercent:
      before.low !== null && after.low !== null
        ? ((after.low - before.low) / before.low) * 100
        : null,
    cpuDelta:
      before.cpu !== null && after.cpu !== null ? after.cpu - before.cpu : null,
    gpuDelta:
      before.gpu !== null && after.gpu !== null ? after.gpu - before.gpu : null,
    warnings,
  };
}

export function makeReport(state: LabState): string {
  const lines = [
    "XBOOK LAB — личный отчёт",
    "Infinix XBOOK B15 BL51A7H · SKU 71005000295",
    `Редакция справочника: ${RESEARCH_DATE}. Источники не обновляются автоматически.`,
    "Все результаты ниже введены вручную. Сайт не подключён к датчикам и не меняет Windows.",
    "",
    "ПАСПОРТ",
    `Windows: ${state.device.version === "unknown" ? "версия неизвестна" : state.device.version}; редакция: ${state.device.edition === "unknown" ? "неизвестна" : state.device.edition}; сборка: ${state.device.build || "неизвестна"}`,
    `BIOS: ${state.device.bios || "неизвестен"}`,
    `Адаптер по этикетке: ${state.device.charger === "unknown" ? "не проверен" : state.device.charger === "other" ? "другое значение, не уточнено" : state.device.charger + " Вт"}`,
    `Графический драйвер: ${state.device.driver || "неизвестен"}`,
    `Игры: ${state.device.games || "не указаны"}`,
    `Предыдущие изменения: ${state.device.tweaks || "не указаны"}`,
    "",
    "ПЛАН",
    `Профиль: ${profileName(state.profile.id)}. Целевой лимит: ${state.profile.fps} FPS (не прогноз).`,
    `Подставка: ${coolingLabels[state.cooling]}`,
    `Отмечено пользователем: ${state.checked.length}/${checklistIds.length} шагов.`,
    ...checklistIds.map(
      (id) =>
        `${state.checked.includes(id) ? "[x]" : "[ ]"} ${getGuide(id)?.title ?? id}`,
    ),
    "",
    "ЗАМЕРЫ",
  ];
  if (!state.measurements.length) lines.push("Замеров пока нет.");
  for (const m of state.measurements)
    lines.push(
      "",
      `${m.game} · ${m.stage === "before" ? "До" : "После"} · записано ${m.createdAt}`,
      `Сцена/настройки: ${m.scene}; ${m.resolution}; ${m.minutes} мин`,
      `Питание: ${m.power === "mains" ? "от сети" : "батарея"}; X6: ${coolingLabels[m.cooling]}; комната: ${m.ambient ?? "не измерено"} °C`,
      `Профиль: ${profileName(m.profile)}; AVG: ${m.avg} FPS; 1% low: ${m.low ?? "не измерено"} FPS`,
      `CPU max: ${m.cpu ?? "не измерено"} °C; GPU max: ${m.gpu ?? "не измерено"} °C; шум (субъективно): ${noiseLabels[m.noise]}`,
      `Примечание: ${m.notes || "нет"}`,
    );
  lines.push("", "ИСТОЧНИКИ");
  for (const s of sources) lines.push(`${s.publisher} — ${s.title}\n${s.url}`);
  return lines.join("\n");
}

export function downloadText(
  filename: string,
  text: string,
  type = "text/plain;charset=utf-8",
) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
