import { test, expect, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { initialState, STORAGE_KEY } from "../src/lib/state";
import { pages } from "../src/lib/routes";

async function visit(page: Page, route = "overview") {
  await page.goto(`/#/${route}`);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
}
async function openDevice(page: Page) {
  await page.getByRole("button", { name: /Infinix XBOOK B15 BL51A7H/ }).click();
  await expect(page.getByRole("dialog", { name: "Мой ноутбук" })).toBeVisible();
}
async function fillMeasurement(
  page: Page,
  values = { avg: "60", low: "40", cpu: "80", stage: "before" },
) {
  await page
    .getByRole("button", { name: "Добавить замер", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog
    .getByRole("textbox", { name: "Игра обязательно", exact: true })
    .fill("Test game");
  await dialog
    .getByLabel("Сцена и графические настройки", { exact: false })
    .fill("Built-in benchmark, low");
  await dialog
    .getByRole("combobox", { name: "Этап", exact: true })
    .selectOption(values.stage);
  await dialog.getByLabel("В комнате, °C").fill("22");
  await dialog.getByLabel("Средний FPS", { exact: false }).fill(values.avg);
  await dialog.getByLabel("1% low, FPS").fill(values.low);
  await dialog.getByLabel("CPU максимум, °C").fill(values.cpu);
  await dialog.getByLabel("Шум по ощущениям").selectOption("audible");
}
async function saveMeasurement(page: Page) {
  await page
    .getByRole("button", { name: "Сохранить замер", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
}

test("all navigation routes work without page errors or horizontal overflow", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await visit(page);
  for (const route of pages) {
    await page.getByRole("link", { name: route.title, exact: true }).click();
    await expect(page).toHaveTitle(`${route.title} — XBOOK LAB`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  expect(errors).toEqual([]);
  await page.goto("/#/nonexistent");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Больше кадров",
  );
});

test("empty state never invents a Windows build, measurements or sensor readings", async ({
  page,
}) => {
  await visit(page, "windows");
  await expect(page.getByText("Версия и сборка пока неизвестны")).toBeVisible();
  await visit(page, "journal");
  await expect(page.getByText("0 / 200 записей")).toBeVisible();
  await expect(page.locator(".measurement-table")).toHaveCount(0);
  await visit(page, "cooling");
  await expect(page.locator(".last-temperature")).toContainText(
    "Замеров пока нет",
  );
  await expect(page.locator(".last-temperature strong")).toHaveText("—°C");
});

test("checklist completion and the guide command copy persist correctly", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await visit(page, "recovery");
  await page
    .getByRole("button", {
      name: "Открыть инструкцию: Сохранить данные до изменений",
      exact: true,
    })
    .click();
  await page
    .getByRole("checkbox", { name: "Я выполнил и проверил этот шаг" })
    .check();
  await page.keyboard.press("Escape");
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(
    page.getByRole("checkbox", {
      name: "Отметить выполненным: Сохранить данные до изменений",
      exact: true,
    }),
  ).toBeChecked();
  await page
    .getByRole("button", {
      name: "Открыть инструкцию: Зафиксировать состояние ноутбука",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "Скопировать команду winver", exact: true })
    .click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toBe("winver");
  await expect(page.getByRole("status")).toContainText("Ничего не запущено");
});

test("keyboard search supports selection, escape, focus return and empty results", async ({
  page,
}) => {
  await visit(page);
  const trigger = page.getByRole("button", {
    name: "Найти настройку",
    exact: true,
  });
  await trigger.focus();
  await page.keyboard.press("Control+k");
  const input = page.getByRole("combobox", { name: "Поиск по справочнику" });
  await expect(input).toBeFocused();
  await input.fill("не-существующий-запрос-987");
  await expect(page.getByText("Ничего не найдено")).toBeVisible();
  await input.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await input.press("Escape");
  await expect(trigger).toBeFocused();
  await page.keyboard.press("/");
  await input.fill("winver");
  await expect(page.getByRole("option").first()).toBeVisible();
  await input.press("ArrowDown");
  await expect(page.getByRole("option").nth(1)).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await input.fill("Сохранить данные до изменений");
  await input.press("Enter");
  await expect(
    page.getByRole("dialog", { name: "Сохранить данные до изменений" }),
  ).toBeVisible();
});

test("unknown passport works and incompatible Windows builds are rejected", async ({
  page,
}) => {
  await visit(page);
  await openDevice(page);
  await expect(page.getByLabel("Версия Windows 11")).toHaveValue("unknown");
  await page.getByRole("button", { name: "Сохранить паспорт" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await openDevice(page);
  await page.getByLabel("Версия Windows 11").selectOption("24H2");
  await page.getByLabel("Сборка из winver").fill("26200.9168");
  await page.getByRole("button", { name: "Сохранить паспорт" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "Для 24H2 ожидается сборка 26100.x",
  );
  await page.getByLabel("Сборка из winver").fill("26100.9168");
  await page.getByLabel("Адаптер по этикетке").selectOption("45");
  await page.getByRole("button", { name: "Сохранить паспорт" }).click();
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await openDevice(page);
  await expect(page.getByLabel("Версия Windows 11")).toHaveValue("24H2");
  await expect(page.getByLabel("Сборка из winver")).toHaveValue("26100.9168");
  await expect(page.getByLabel("Адаптер по этикетке")).toHaveValue("45");
});

test("game profile has a keyboard slider and saves the plan, not OS settings", async ({
  page,
}) => {
  await visit(page, "profiles");
  await page.getByRole("button", { name: /Тихая игра Комфорт/ }).click();
  const slider = page.getByRole("slider", { name: "Целевой лимит кадров" });
  await expect(slider).toHaveValue("30");
  await slider.focus();
  await slider.press("ArrowRight");
  await expect(slider).toHaveValue("35");
  await expect(page.getByText("Есть изменения")).toBeVisible();
  await page.getByRole("button", { name: "Сохранить мой план" }).click();
  await expect(page.getByText("Сохранён в браузере")).toBeVisible();
  await expect(page.getByText("Не меняет настройки компьютера")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(slider).toHaveValue("35");
  await expect(
    page.getByRole("button", { name: /Тихая игра Комфорт/ }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("X6 controls change and persist only the explanatory diagram", async ({
  page,
}) => {
  await visit(page, "cooling");
  await page.getByRole("button", { name: "Верхние", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Верхние", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".cooling-simulator")).toContainText(
    "Выбор меняет только схему и план теста",
  );
  await expect(page.locator(".pad-fan.active")).toHaveCount(2);
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Верхние", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Выкл.", exact: true }).click();
  await expect(page.locator(".pad-fan.active")).toHaveCount(0);
});

test("measurements validate, compare, edit, export, persist and delete with confirmation", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await visit(page, "journal");
  await fillMeasurement(page);
  await saveMeasurement(page);
  await fillMeasurement(page, {
    avg: "66",
    low: "70",
    cpu: "76",
    stage: "after",
  });
  await page.getByRole("button", { name: "Сохранить замер" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "1% low не должен превышать средний FPS",
  );
  await page.getByLabel("1% low, FPS").fill("44");
  await page.getByLabel("Шум по ощущениям").selectOption("quiet");
  await saveMeasurement(page);
  await expect(page.getByText("2 / 200 записей")).toBeVisible();
  await page
    .getByRole("checkbox", {
      name: "Выбрать для сравнения: Test game, до, 60 FPS",
      exact: true,
    })
    .check();
  await page
    .getByRole("checkbox", {
      name: "Выбрать для сравнения: Test game, после, 66 FPS",
      exact: true,
    })
    .check();
  const comparison = page.locator(".comparison-result");
  await expect(comparison).toContainText("+10%");
  await expect(comparison).toContainText("-4 °C");
  await expect(comparison).toContainText("Слышно, приемлемо → Тихо");
  await expect(comparison).toContainText("Записанные условия совпадают");
  await expect(comparison).toContainText("Не измерено");
  await page
    .getByRole("button", { name: "Редактировать замер Test game", exact: true })
    .nth(1)
    .click();
  await page.getByLabel("Средний FPS", { exact: false }).fill("63");
  await page.getByLabel("Режим X6").selectOption("off");
  await saveMeasurement(page);
  await expect(comparison).toContainText("+5%");
  await expect(comparison).toContainText("Разные режимы подставки");
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Скачать отчёт", exact: true })
    .click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("xbook-lab-report.txt");
  const text = await readFile((await download.path())!, "utf-8");
  expect(text).toContain("Test game");
  expect(text).toContain("AVG: 63 FPS");
  expect(text).toContain("введены вручную");
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator(".measurement-table tbody tr")).toHaveCount(2);
  await page.setViewportSize({ width: 320, height: 800 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(
    await page
      .locator(".table-scroll")
      .evaluate((el) => el.scrollWidth > el.clientWidth),
  ).toBe(true);
  await page
    .getByRole("button", { name: "Удалить замер Test game", exact: true })
    .nth(1)
    .click();
  await page.getByRole("button", { name: "Отмена", exact: true }).click();
  await expect(page.locator(".measurement-table tbody tr")).toHaveCount(2);
  await page
    .getByRole("button", { name: "Удалить замер Test game", exact: true })
    .nth(1)
    .click();
  await page
    .getByRole("button", { name: "Удалить замер", exact: true })
    .click();
  await expect(page.locator(".measurement-table tbody tr")).toHaveCount(1);
});

test("bad local storage stays intact until explicit reset, and can be exported raw", async ({
  page,
}) => {
  const raw = "{corrupted-local-data";
  await page.addInitScript(
    ({ key, raw }) => {
      if (!sessionStorage.getItem("seeded")) {
        localStorage.setItem(key, raw);
        localStorage.setItem("unrelated-app", "keep me");
        sessionStorage.setItem("seeded", "1");
      }
    },
    { key: STORAGE_KEY, raw },
  );
  await visit(page, "profiles");
  await expect(page.getByText("Локальное сохранение недоступно")).toBeVisible();
  await page.getByRole("button", { name: /Тихая игра Комфорт/ }).click();
  await page.getByRole("button", { name: "Сохранить мой план" }).click();
  await expect(page.getByText("Только в этом сеансе")).toBeVisible();
  expect(
    await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY),
  ).toBe(raw);
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Скачать исходную копию" }).click();
  expect(await readFile((await (await downloadPromise).path())!, "utf-8")).toBe(
    raw,
  );
  await page.getByRole("button", { name: "Управление данными" }).click();
  await page.getByRole("button", { name: "Отмена", exact: true }).click();
  expect(
    await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY),
  ).toBe(raw);
  await page.getByRole("button", { name: "Управление данными" }).click();
  await page.getByRole("button", { name: "Удалить данные сайта" }).click();
  await expect(page.getByText("Локальное сохранение недоступно")).toHaveCount(
    0,
  );
  await expect(page.getByRole("slider")).toHaveValue("60");
  expect(
    await page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)!),
      STORAGE_KEY,
    ),
  ).toEqual(initialState());
  expect(await page.evaluate(() => localStorage.getItem("unrelated-app"))).toBe(
    "keep me",
  );
});

test("blocked storage is honestly described and never crashes the app", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Unavailable in this test", "QuotaExceededError");
    };
  });
  await visit(page, "profiles");
  await expect(page.getByText("Локальное сохранение недоступно")).toBeVisible();
  await page.getByRole("button", { name: /Тихая игра Комфорт/ }).click();
  await page.getByRole("button", { name: "Сохранить мой план" }).click();
  await expect(page.getByText("Только в этом сеансе")).toBeVisible();
});

test("sources filter by provenance and local search", async ({ page }) => {
  await visit(page, "sources");
  await page.getByRole("button", { name: "Продавцы", exact: true }).click();
  await expect(page.locator(".source-row")).toHaveCount(2);
  await page.getByRole("button", { name: "Официальные", exact: true }).click();
  await page
    .getByRole("searchbox", { name: "Поиск источников" })
    .fill("DeepCool");
  await expect(page.locator(".source-row")).toHaveCount(1);
  await expect(page.locator(".source-row")).toContainText("MULTI CORE X6");
  await page
    .getByRole("searchbox", { name: "Поиск источников" })
    .fill("ничего-987");
  await expect(page.locator(".source-row")).toHaveCount(0);
});

test("mobile menu, forms and all eight pages fit a narrow viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await visit(page);
  for (const route of pages) {
    await page.getByRole("button", { name: "Открыть меню" }).click();
    await page
      .getByRole("navigation", { name: "Мобильная навигация" })
      .getByRole("link", { name: route.title, exact: true })
      .click();
    await expect(page).toHaveTitle(`${route.title} — XBOOK LAB`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      route.id,
    ).toBe(true);
  }
  await visit(page, "journal");
  await page
    .getByRole("button", { name: "Добавить замер", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Сохранить замер" }),
  ).toBeInViewport();
  const box = await page.getByRole("dialog").boundingBox();
  expect(box!.width).toBeLessThanOrEqual(360);
});
