import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mkdir } from "node:fs/promises";
import { pages } from "../src/lib/routes";

const tags = ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"];

for (const route of pages) {
  test(`WCAG automated checks and desktop capture: ${route.id}`, async ({
    page,
  }) => {
    await page.goto(`/#/${route.id}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await mkdir(".cache/screenshots", { recursive: true });
    await page.screenshot({
      path: `.cache/screenshots/${route.id}-desktop.png`,
      fullPage: true,
    });
    const results = await new AxeBuilder({ page }).withTags(tags).analyze();
    expect(
      results.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
    ).toEqual([]);
  });
}

test("dialog semantics, visible focus trap and form accessibility", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await page.goto("/#/overview");
  await page
    .getByRole("button", { name: "Паспорт модели", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  for (let i = 0; i < 15; i++) {
    await page.keyboard.press("Tab");
    expect(
      await page.evaluate(
        () => document.activeElement?.closest("dialog") !== null,
      ),
    ).toBe(true);
  }
  let result = await new AxeBuilder({ page }).withTags(tags).analyze();
  expect(
    result.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  ).toEqual([]);
  await page
    .getByRole("group", { name: "Раздел паспорта" })
    .getByRole("button", { name: "Моя конфигурация", exact: true })
    .click();
  result = await new AxeBuilder({ page }).withTags(tags).analyze();
  expect(
    result.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  ).toEqual([]);
  await page.keyboard.press("Escape");
  await page.keyboard.press("Control+k");
  await expect(page.getByRole("combobox")).toBeFocused();
  result = await new AxeBuilder({ page }).withTags(tags).analyze();
  expect(
    result.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  ).toEqual([]);
  await page.getByRole("combobox").fill("Сохранить данные до изменений");
  await page.getByRole("combobox").press("Enter");
  await expect(
    page.getByRole("dialog", { name: "Сохранить данные до изменений" }),
  ).toBeVisible();
  result = await new AxeBuilder({ page }).withTags(tags).analyze();
  expect(
    result.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  ).toEqual([]);
  await page.keyboard.press("Escape");
  await page.goto("/#/journal");
  await page
    .getByRole("button", { name: "Добавить замер", exact: true })
    .click();
  result = await new AxeBuilder({ page }).withTags(tags).analyze();
  expect(
    result.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  ).toEqual([]);
});

test("Windows alternate views and expanded Cyrillic accordions are accessible", async ({
  page,
}) => {
  await page.goto("/#/windows");
  const tabs = page
    .getByRole("group", { name: "Раздел Windows" })
    .getByRole("button");
  for (let i = 0; i < 3; i++) {
    await tabs.nth(i).click();
    for (const button of await page.locator(".accordion > h3 button").all()) {
      if ((await button.getAttribute("aria-expanded")) === "false")
        await button.click();
    }
    const ids = await page
      .locator(".accordion > h3 button")
      .evaluateAll((buttons) =>
        buttons.map((button) => button.getAttribute("aria-controls")),
      );
    expect(new Set(ids).size).toBe(ids.length);
    const result = await new AxeBuilder({ page }).withTags(tags).analyze();
    expect(
      result.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
    ).toEqual([]);
  }
});

test("mobile and tablet layout captures, accessible mobile navigation and form", async ({
  page,
}) => {
  await mkdir(".cache/screenshots", { recursive: true });
  for (const width of [390, 768, 1024, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/#/overview");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `.cache/screenshots/overview-${width}.png`,
      fullPage: true,
    });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Открыть меню" }).click();
  let result = await new AxeBuilder({ page }).withTags(tags).analyze();
  expect(
    result.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  ).toEqual([]);
  await page
    .getByRole("navigation", { name: "Мобильная навигация" })
    .getByRole("link", { name: "Журнал замеров" })
    .click();
  await page
    .getByRole("button", { name: "Добавить замер", exact: true })
    .click();
  await page.screenshot({ path: ".cache/screenshots/measurement-mobile.png" });
  result = await new AxeBuilder({ page }).withTags(tags).analyze();
  expect(
    result.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  ).toEqual([]);
});
