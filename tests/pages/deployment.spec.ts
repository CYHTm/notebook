import { test, expect } from "@playwright/test";
import { pages } from "../../src/lib/routes";

test("production assets, hash navigation and reload work below /notebook/", async ({
  page,
  baseURL,
}) => {
  const errors: string[] = [];
  const missing: string[] = [];
  const escaped: string[] = [];
  const origin = new URL(baseURL!).origin;
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400)
      missing.push(`${response.status()} ${response.url()}`);
  });
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.origin === origin && !url.pathname.startsWith("/notebook/"))
      escaped.push(url.pathname);
  });

  await page.goto("./", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Больше кадров",
  );
  const image = page.locator(".laptop-image");
  await expect(image).toBeVisible();
  expect(
    await image.evaluate(
      (element: HTMLImageElement) =>
        element.complete && element.naturalWidth > 0,
    ),
  ).toBe(true);
  const imageURL = await image.evaluate(
    (element: HTMLImageElement) => element.currentSrc,
  );
  expect(new URL(imageURL).pathname).toBe("/notebook/laptop-illustration.webp");
  await page.evaluate(() => document.fonts.ready);
  expect(
    await page
      .getByRole("heading", { level: 1 })
      .evaluate((element) => parseFloat(getComputedStyle(element).fontSize)),
  ).toBeGreaterThan(30);
  const favicon = await page.locator('link[rel="icon"]').getAttribute("href");
  expect(new URL(favicon!, page.url()).pathname).toBe("/notebook/favicon.svg");
  const iconResponse = await page.request.get(
    new URL(favicon!, page.url()).href,
  );
  expect(iconResponse.ok()).toBe(true);
  expect(iconResponse.headers()["content-type"]).toContain("image/svg+xml");

  for (const route of pages) {
    await page.getByRole("link", { name: route.title, exact: true }).click();
    await expect(page).toHaveTitle(`${route.title} — XBOOK LAB`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(new URL(page.url()).pathname).toBe("/notebook/");
    expect(new URL(page.url()).hash).toBe(`#/${route.id}`);
  }

  await page.goto("./#/journal");
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Разница",
  );
  await page
    .getByRole("button", { name: "Добавить замер", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Новый игровой замер" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Найти настройку", exact: true })
    .click();
  await page.getByRole("combobox").fill("winver");
  await expect(page.getByRole("option").first()).toBeVisible();

  expect(escaped, "Local assets must not escape the repository path").toEqual(
    [],
  );
  expect(missing, "Production responses must not be missing").toEqual([]);
  expect(errors, "Production must not throw page errors").toEqual([]);
});
