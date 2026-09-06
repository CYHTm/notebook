import {
  BookOpen,
  Gamepad2,
  LayoutDashboard,
  ListChecks,
  Monitor,
  NotebookPen,
  ScanLine,
  SlidersHorizontal,
  Wind,
} from "lucide-react";
import type { PageId } from "./context";

export const pages = [
  {
    id: "overview",
    title: "Обзор ноутбука",
    icon: LayoutDashboard,
    keywords: "главная характеристики Infinix XBOOK B15 паспорт Ryzen Radeon",
  },
  {
    id: "recovery",
    title: "После твикеров",
    icon: ScanLine,
    keywords: "BoosterX консоль восстановление Windows ошибки",
  },
  {
    id: "windows",
    title: "Windows и драйверы",
    icon: Monitor,
    keywords: "Windows 10 11 25H2 24H2 ESU KB обновления AMD драйверы BIOS",
  },
  {
    id: "profiles",
    title: "Игровые профили",
    icon: Gamepad2,
    keywords: "FPS лимит баланс тихая игра производительность",
  },
  {
    id: "cooling",
    title: "Охлаждение",
    icon: Wind,
    keywords: "температура нагрев DeepCool X6 подставка вентиляторы TDP",
  },
  {
    id: "lasso",
    title: "Process Lasso",
    icon: SlidersHorizontal,
    keywords: "ProBalance приоритеты affinity питание процессы",
  },
  {
    id: "journal",
    title: "Журнал замеров",
    icon: NotebookPen,
    keywords: "FPS измерения до после результаты сравнение 1% low",
  },
  {
    id: "sources",
    title: "Источники и метод",
    icon: BookOpen,
    keywords: "Microsoft AMD Bitsum проверка официальные дата документация",
  },
] as const;
export const checklistIcon = ListChecks;
export function pageFromHash(hash: string): PageId {
  const value = hash.replace(/^#\/?/, "").split("?")[0];
  return pages.find((p) => p.id === value)?.id ?? "overview";
}
