import { describe, expect, it } from "vitest";
import { checklistIds, guides, profilePresets } from "../data/guides";
import { sources, RESEARCH_DATE } from "../data/sources";
import { pageFromHash, pages } from "./routes";
import {
  compareMeasurements,
  initialState,
  isMeasurement,
  makeReport,
  parseStoredState,
  validateDevice,
  type Measurement,
} from "./state";

// Synthetic fixtures are exclusively test data; they never seed the application.
const measurement = (overrides: Partial<Measurement> = {}): Measurement => ({
  id: "test-before",
  createdAt: "2026-09-06T10:00:00.000Z",
  stage: "before",
  game: "Test game",
  scene: "Built-in benchmark, low",
  profile: "baseline",
  resolution: "1920 × 1080",
  power: "mains",
  cooling: "all",
  ambient: 22,
  minutes: 15,
  avg: 60,
  low: 40,
  cpu: 80,
  gpu: 72,
  noise: "audible",
  notes: "",
  ...overrides,
});

describe("local state validation", () => {
  it("starts with an unknown device, no completed steps and no pretend measurements", () => {
    const state = initialState();
    expect(state.measurements).toEqual([]);
    expect(state.checked).toEqual([]);
    expect(state.device.version).toBe("unknown");
    expect(state.device.charger).toBe("unknown");
    expect(state.device.build).toBe("");
    expect(state.device.tweaks).toContain("BoosterX");
    expect(parseStoredState(null)).toEqual({ state, issue: null });
  });
  it("returns independent defaults", () => {
    const a = initialState();
    a.checked.push("backup");
    expect(initialState().checked).toEqual([]);
  });
  it("round-trips valid data without a recovery warning", () => {
    const state = initialState();
    state.checked = ["backup"];
    state.profile = { id: "quiet", fps: 35 };
    state.measurements = [measurement()];
    expect(parseStoredState(JSON.stringify(state))).toEqual({
      state,
      issue: null,
    });
  });
  it.each(["{bad json", "null", "[]", "{}", '{"schemaVersion":2}'])(
    "protects malformed or unsupported storage: %s",
    (raw) => {
      const result = parseStoredState(raw);
      expect(result.issue).toBeTruthy();
      expect(result.state).toEqual(initialState());
    },
  );
  it("deduplicates and validates checklist IDs without silently losing the original", () => {
    const result = parseStoredState(
      JSON.stringify({
        ...initialState(),
        checked: ["backup", "unknown", "backup", 4],
      }),
    );
    expect(result.state.checked).toEqual(["backup"]);
    expect(result.issue).toBeTruthy();
  });
  it("validates device fields and protects damaged profile data too", () => {
    const result = parseStoredState(
      JSON.stringify({
        ...initialState(),
        profile: { id: "turbo", fps: 9999 },
        device: { build: "<script>", version: "26H1" },
      }),
    );
    expect(result.state.profile).toEqual(initialState().profile);
    expect(result.state.device.version).toBe("unknown");
    expect(result.state.device.build).toBe("");
    expect(result.issue).toBeTruthy();
  });
  it("keeps only valid unique measurements and reports recovery", () => {
    const original = measurement();
    const result = parseStoredState(
      JSON.stringify({
        ...initialState(),
        measurements: [original, original, measurement({ id: "bad", avg: -1 })],
      }),
    );
    expect(result.state.measurements).toEqual([original]);
    expect(result.issue).toBeTruthy();
  });
  it("caps imported records at 200 and protects the original", () => {
    const result = parseStoredState(
      JSON.stringify({
        ...initialState(),
        measurements: Array.from({ length: 201 }, (_, i) =>
          measurement({ id: String(i) }),
        ),
      }),
    );
    expect(result.state.measurements).toHaveLength(200);
    expect(result.issue).toBeTruthy();
  });
  it("normalizes off-step FPS targets within the range and reports the repair", () => {
    const result = parseStoredState(
      JSON.stringify({ ...initialState(), profile: { id: "quiet", fps: 42 } }),
    );
    expect(result.state.profile.fps).toBe(40);
    expect(result.issue).toBeTruthy();
  });
});

describe("manual measurement contract", () => {
  it("accepts explicit unknown optional metrics without converting them to zeros", () => {
    expect(
      isMeasurement(
        measurement({
          low: null,
          cpu: null,
          gpu: null,
          ambient: null,
          noise: "unknown",
        }),
      ),
    ).toBe(true);
  });
  it.each([
    ["avg", 0],
    ["avg", NaN],
    ["avg", Infinity],
    ["avg", "60"],
    ["avg", 2001],
    ["low", 61],
    ["cpu", 121],
    ["minutes", 0],
    ["ambient", 51],
    ["game", "  "],
    ["scene", ""],
    ["resolution", ""],
    ["createdAt", "not a date"],
    ["power", ["mains"]],
    ["stage", ["before"]],
    ["cooling", ["all"]],
    ["noise", ["quiet"]],
  ])("rejects invalid %s=%s", (field, value) => {
    expect(isMeasurement({ ...measurement(), [field]: value })).toBe(false);
  });
  it("allows a user-reported hot value to be recorded, not represented as a safe target", () => {
    expect(isMeasurement(measurement({ cpu: 95 }))).toBe(true);
  });
});

describe("device passport", () => {
  it("allows all hardware-dependent values to stay unknown", () => {
    expect(validateDevice(initialState().device)).toBeNull();
  });
  it.each([
    ["23H2", "22631.1234"],
    ["24H2", "26100.9168"],
    ["25H2", "26200.9168"],
  ] as const)("accepts %s / %s", (version, build) => {
    expect(
      validateDevice({ ...initialState().device, version, build }),
    ).toBeNull();
  });
  it.each(["26200.9168", "261000.1"])(
    "rejects a mismatched 24H2 build %s",
    (build) => {
      expect(
        validateDevice({ ...initialState().device, version: "24H2", build }),
      ).toContain("26100");
    },
  );
  it("rejects non-build text but permits a build with unknown version", () => {
    expect(
      validateDevice({ ...initialState().device, build: "Windows 11" }),
    ).toBeTruthy();
    expect(
      validateDevice({ ...initialState().device, build: "26200.9168" }),
    ).toBeNull();
  });
});

describe("honest comparison", () => {
  it("does not call slightly different room temperatures identical", () => {
    const result = compareMeasurements(
      measurement(),
      measurement({ stage: "after", ambient: 22.2 }),
    );
    expect(result.warnings).toContain("Температура комнаты отличается");
  });
  it("computes deltas from entered values, never assumed gains", () => {
    const result = compareMeasurements(
      measurement(),
      measurement({
        id: "after",
        stage: "after",
        avg: 66,
        low: 44,
        cpu: 76,
        gpu: 70,
      }),
    );
    expect(result.fpsPercent).toBeCloseTo(10);
    expect(result.lowPercent).toBeCloseTo(10);
    expect(result.cpuDelta).toBe(-4);
    expect(result.gpuDelta).toBe(-2);
    expect(result.warnings).toEqual([]);
  });
  it("preserves missing data in calculated comparisons", () => {
    const result = compareMeasurements(
      measurement({ low: null, cpu: null }),
      measurement({ id: "after", stage: "after", gpu: null, ambient: null }),
    );
    expect(result.lowPercent).toBeNull();
    expect(result.cpuDelta).toBeNull();
    expect(result.gpuDelta).toBeNull();
    expect(result.warnings).toContain(
      "Температура комнаты не записана хотя бы в одном тесте",
    );
  });
  it("warns on all meaningful condition mismatches, including changed profiles", () => {
    const result = compareMeasurements(
      measurement(),
      measurement({
        game: "Other",
        scene: "Other",
        resolution: "1600 × 900",
        power: "battery",
        cooling: "off",
        minutes: 5,
        ambient: 27,
        profile: "quiet",
      }),
    );
    expect(result.warnings).toHaveLength(9);
    expect(result.warnings).toContain("Разные режимы подставки");
  });
  it("normalizes case and whitespace, not the underlying conditions", () => {
    const result = compareMeasurements(
      measurement(),
      measurement({
        stage: "after",
        game: "  TEST   game  ",
        scene: "built-IN benchmark, low",
      }),
    );
    expect(result.warnings).toEqual([]);
  });
  it("warns when the comparison order reverses recorded stages", () => {
    expect(
      compareMeasurements(measurement({ stage: "after" }), measurement())
        .warnings,
    ).toContain("Порядок сравнения обратен меткам «до/после»");
  });
});

describe("report and content integrity", () => {
  it("exports readable user data, uncertainties and source URLs", () => {
    const state = initialState();
    state.device.charger = "45";
    state.checked = ["backup"];
    state.measurements = [
      measurement({ notes: "Only a test fixture", cpu: null }),
    ];
    const text = makeReport(state);
    expect(text).toContain("71005000295");
    expect(text).toContain(RESEARCH_DATE);
    expect(text).toContain("Адаптер по этикетке: 45 Вт");
    expect(text).toContain("[x] Сохранить данные до изменений");
    expect(text).toContain("CPU max: не измерено");
    expect(text).toContain("Слышно, приемлемо");
    expect(text).toContain("Only a test fixture");
    expect(text).toContain("не прогноз");
    for (const source of sources) expect(text).toContain(source.url);
  });
  it("does not generate empty-state measurements in the report", () => {
    expect(makeReport(initialState())).toContain("Замеров пока нет.");
    expect(makeReport(initialState())).not.toContain("AVG:");
  });
  it("has unique IDs and resolves every guide source and checklist item", () => {
    expect(new Set(guides.map((g) => g.id)).size).toBe(guides.length);
    expect(new Set(sources.map((s) => s.id)).size).toBe(sources.length);
    for (const id of checklistIds)
      expect(guides.find((g) => g.id === id)).toBeDefined();
    for (const guide of guides) {
      expect(guide.steps.length).toBeGreaterThan(0);
      expect(guide.verify.length).toBeGreaterThan(20);
      expect(guide.rollback.length).toBeGreaterThan(20);
      for (const id of guide.sources)
        expect(
          sources.find((s) => s.id === id),
          `${guide.id}: ${id}`,
        ).toBeDefined();
    }
    for (const source of sources)
      expect(new URL(source.url).protocol).toBe("https:");
    for (const preset of profilePresets)
      expect(preset.fps).toBeGreaterThanOrEqual(30);
  });
  it("only exposes reviewed commands and labels system-changing commands", () => {
    const readOnly = [
      "winver",
      "msinfo32",
      "powercfg /list\npowercfg /getactivescheme",
      "powercfg /getactivescheme",
    ];
    const repairs = [
      "DISM.exe /Online /Cleanup-image /Restorehealth",
      "sfc /scannow",
    ];
    for (const guide of guides)
      for (const step of guide.steps)
        if (step.command) {
          expect([...readOnly, ...repairs]).toContain(step.command);
          if (repairs.includes(step.command))
            expect(step.changesSystem).toBe(true);
        }
  });
  it("routes all known pages and safely handles unknown hashes", () => {
    for (const page of pages)
      expect(pageFromHash(`#/${page.id}`)).toBe(page.id);
    expect(pageFromHash("#/not-a-page")).toBe("overview");
    expect(pageFromHash("")).toBe("overview");
    expect(pageFromHash("#/journal?filter=test")).toBe("journal");
  });
});
