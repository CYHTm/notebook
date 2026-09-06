export const RESEARCH_DATE = "06.09.2026";
export const RESEARCH_ISO_DATE = "2026-09-06";

export interface Source {
  id: string;
  ref: number;
  publisher: string;
  title: string;
  url: string;
  kind: "primary" | "retailer";
  scope: string;
}

// Reference numbers retain the corresponding search-result IDs. They are not
// unique bibliography numbers: the publisher and URL identify each document.
export const sources: Source[] = [
  {
    id: "amd-chip",
    ref: 1,
    publisher: "AMD",
    title: "Ryzen 5 7535HS · параметры процессора",
    url: "https://www.amd.com/en/products/processors/laptop/ryzen/7000-series/amd-ryzen-5-7535hs.html",
    kind: "primary",
    scope:
      "Zen 3+, 6 ядер / 12 потоков, до 4,55 ГГц, Radeon 660M, Tjmax 95 °C, cTDP 35–54 Вт. Это возможности чипа, не подтверждение лимитов питания, охлаждения и апгрейда конкретного ноутбука.",
  },
  {
    id: "secure-boot",
    ref: 2,
    publisher: "Microsoft",
    title: "Статус сертификатов Secure Boot в Windows Security",
    url: "https://support.microsoft.com/en-us/servicing/os/secure-boot/2026/03/secure-boot-certificate-update-status-in-the-windows-security-app",
    kind: "primary",
    scope:
      "Начиная с апреля 2026 разворачивается отображение статуса в «Безопасность устройства → Безопасная загрузка». Для большинства устройств обновление автоматическое; возможны блокировки совместимости или необходимость помощи OEM.",
  },
  {
    id: "secure-boot-dates",
    ref: 1,
    publisher: "Microsoft",
    title: "Сертификаты Secure Boot 2011 → 2023",
    url: "https://support.microsoft.com/en-us/topic/windows-secure-boot-certificate-expiration-and-ca-updates-7ff40d33-95dc-4c3c-8725-a9b95457578e",
    kind: "primary",
    scope:
      "Старые сертификаты начинают истекать в июне 2026; Windows Production PCA 2011 — 19.10.2026. Это не означает немедленную остановку загрузки, но важно для дальнейшего обслуживания безопасности загрузочной цепочки.",
  },
  {
    id: "dns",
    ref: 3,
    publisher: "DNS",
    title: "XBOOK B15 BL51A7H · 71005000295",
    url: "https://www.dns-shop.ru/product/48a46a589e7cd9cb/156-noutbuk-infinix-xbook-b15-bl51a7h-seryj/",
    kind: "retailer",
    scope:
      "Комплектация с Ryzen 5 7535HS, Radeon 660M, 16/512 ГБ и Windows 11 Home. Это карточка продавца, не сервисное руководство. Проверена также доступная грузинская версия этой же карточки.",
  },
  {
    id: "retailer",
    ref: 9,
    publisher: "iPioneer",
    title: "Подробная карточка того же SKU",
    url: "https://ipioneer.ru/product/111516-15-6-noutbuk-infinix-xbook-b15-bl51a7h-seryj/",
    kind: "retailer",
    scope:
      "Экран, LPDDR5, размеры и интерфейсы. Есть расхождения с другими карточками по адаптеру и материалу корпуса: эти параметры не считаем окончательно установленными.",
  },
  {
    id: "amd",
    ref: 2,
    publisher: "AMD",
    title: "Ryzen 5 7535HS · драйверы AMD",
    url: "https://www.amd.com/en/support/downloads/drivers.html/processors/ryzen/ryzen-7000-series/amd-ryzen-5-7535hs.html",
    kind: "primary",
    scope:
      "Adrenalin 26.8.1 WHQL Recommended от 20.08.2026 и 26.9.1 WHQL Optional от 03.09.2026. Для ноутбуков AMD рекомендует сначала проверять OEM-пакеты; наличие драйвера AMD не подтверждает весь комплект OEM-драйверов для Windows 10.",
  },
  {
    id: "windows",
    ref: 1,
    publisher: "Microsoft",
    title: "Windows 11 · журнал выпусков",
    url: "https://learn.microsoft.com/en-us/windows/release-health/windows11-release-information",
    kind: "primary",
    scope:
      "Сроки поддержки версий Home/Pro, обычные накопительные обновления и отдельный статус 26H1. Enterprise Hotpatch не используется в рекомендациях для домашнего ноутбука.",
  },
  {
    id: "health",
    ref: 2,
    publisher: "Microsoft",
    title: "Windows 11 25H2 · известные проблемы",
    url: "https://learn.microsoft.com/en-us/windows/release-health/status-windows-11-25h2",
    kind: "primary",
    scope:
      "Проблемы августовских обновлений: RGB-драйверы и игры, фон рабочего стола, курсоры, уведомления Defender. Проверено по полному тексту, а не только поисковому сниппету.",
  },
  {
    id: "esu",
    ref: 1,
    publisher: "Microsoft",
    title: "Windows 10 · потребительская ESU",
    url: "https://www.microsoft.com/en-US/windows/extended-security-updates?r=1",
    kind: "primary",
    scope:
      "Текущая страница указывает 12.10.2027. Прежняя дата 13.10.2026 ещё встречается в старых материалах. Требуется регистрация подходящего устройства; варианты подключения зависят от региона. ESU не возвращает полную поддержку.",
  },
  {
    id: "lasso",
    ref: 3,
    publisher: "Bitsum",
    title: "Process Lasso · FAQ",
    url: "https://bitsum.com/process-lasso-faq/",
    kind: "primary",
    scope:
      "ProBalance, правила процессов, схемы питания, автоматическое обнаружение игр. Bitsum не обещает универсального выигрыша от ручных affinity и приоритетов.",
  },
  {
    id: "lasso-mode",
    ref: 4,
    publisher: "Bitsum",
    title: "Что делает Performance Mode",
    url: "https://bitsum.com/apps/process-lasso/docs/algorithms/performance-mode/",
    kind: "primary",
    scope:
      "Переключение активной схемы питания и исключение целевого процесса из ProBalance. Можно выбрать альтернативу Bitsum Highest Performance.",
  },
  {
    id: "lasso-release",
    ref: 4,
    publisher: "Bitsum",
    title: "Process Lasso · официальный стабильный выпуск",
    url: "https://bitsum.com/download-process-lasso/",
    kind: "primary",
    scope:
      "18.3.0.34 от 02.09.2026. Отдельно предлагается бета 18.4.0.3; её не включаем в базовую настройку.",
  },
  {
    id: "cooler",
    ref: 5,
    publisher: "DeepCool",
    title: "MULTI CORE X6 · спецификация",
    url: "https://global.deepcool.com/products/Cooling/laptopcoolers/2021/11399.shtml",
    kind: "primary",
    scope:
      "Четыре вентилятора, четыре комбинации включения, питание USB 5 В. Заявленные характеристики подставки — не измеренный эффект на этом ноутбуке.",
  },
  {
    id: "booster",
    ref: 1,
    publisher: "BoosterX",
    title: "Резервные копии и ограничения отката",
    url: "https://boosterx.org/en/",
    kind: "primary",
    scope:
      "По заявлению разработчика, большая часть настроек может быть восстановлена из копии/профиля. Очистка файлов и удаление приложений могут быть необратимы. Версия и применённый профиль пользователя неизвестны.",
  },
  {
    id: "repair",
    ref: 1,
    publisher: "Microsoft",
    title: "Проверка системных файлов: DISM и SFC",
    url: "https://support.microsoft.com/en-us/windows/using-system-file-checker-in-windows-365e0031-36b1-6031-f804-8fd86e0ef4ca",
    kind: "primary",
    scope:
      "Официальная последовательность восстановления хранилища компонентов и системных файлов. Это не универсальный сброс всех твиков и политик.",
  },
  {
    id: "power",
    ref: 4,
    publisher: "Microsoft",
    title: "Выбор режима питания Windows",
    url: "https://support.microsoft.com/en-us/windows/change-the-power-mode-for-your-windows-pc-c2aff038-22c9-f46d-5ca0-78696fdf2de8",
    kind: "primary",
    scope:
      "Энергоэффективность, баланс, производительность. Пользовательская схема может блокировать выбор режима; Microsoft предлагает проверить стандартную сбалансированную схему.",
  },
  {
    id: "windowed",
    ref: 1,
    publisher: "Microsoft",
    title: "Оптимизация для игр в оконном режиме",
    url: "https://support.microsoft.com/en-us/windows/hardware/display-graphics/optimizations-for-windowed-games-in-windows-11",
    kind: "primary",
    scope:
      "Оптимизация совместимых DX10/DX11-игр в окне и без рамки. Можно отключить для отдельной игры; после изменения нужен перезапуск игры.",
  },
  {
    id: "game-mode",
    ref: 4,
    publisher: "Xbox Support",
    title: "Игровой режим Windows",
    url: "https://support.xbox.com/en-HR/help/games-apps/game-setup-and-play/use-game-mode-gaming-on-pc",
    kind: "primary",
    scope:
      "Игровой режим включён по умолчанию. Эффект на стабильность кадров зависит от конкретной игры и системы.",
  },
  {
    id: "chill",
    ref: 4,
    publisher: "AMD",
    title: "Radeon Chill, Anti-Lag и Boost",
    url: "https://www.amd.com/en/resources/support-articles/faqs/DH3-033.html",
    kind: "primary",
    scope:
      "Chill динамически ограничивает FPS. В проверенной инструкции Chill несовместим с одновременным Anti-Lag/Boost. Названия и доступность функций зависят от драйвера и оборудования.",
  },
  {
    id: "carlcare",
    ref: 1,
    publisher: "Carlcare",
    title: "Официальный подбор драйверов Infinix",
    url: "https://www.carlcare.com/global/drivers-download/",
    kind: "primary",
    scope:
      "Подбор по модели или серийному номеру на стороне сервиса. Конкретный последний BIOS для BL51A7H / 71005000295 публично подтвердить не удалось; прошивку не предлагаем.",
  },
  {
    id: "xbox-mode",
    ref: 1,
    publisher: "Microsoft",
    title: "Xbox mode в Windows 11",
    url: "https://support.microsoft.com/en-us/topic/windows-gaming-full-screen-experience-67fb8d12-5467-4a95-8adf-0a10789576ab",
    kind: "primary",
    scope:
      "Отдельный полноэкранный интерфейс, Windows 11 24H2 и новее, поддерживаемые рынки. Не путать с обычным Game Mode и не включать принудительно сторонними средствами.",
  },
];

export function getSource(id: string): Source {
  const source = sources.find((item) => item.id === id);
  if (!source) throw new Error(`Unknown source: ${id}`);
  return source;
}
