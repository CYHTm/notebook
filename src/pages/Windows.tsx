import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleHelp,
  Download,
  Monitor,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import {
  Accordion,
  Badge,
  GuideLink,
  Notice,
  PageHeading,
  SourceRefs,
} from "../components/ui";
import { useLab } from "../lib/context";

export default function WindowsPage() {
  const [tab, setTab] = useState("choice");
  const { state, open } = useLab();
  const tabs = [
    { id: "choice", title: "Выбор системы" },
    { id: "updates", title: "Обновления и проблемы" },
    { id: "drivers", title: "Драйверы" },
  ];
  return (
    <>
      <PageHeading
        index="02"
        eyebrow="WINDOWS И ДРАЙВЕРЫ"
        title="Стабильность — не номер версии."
        description="Для этого XBOOK разумно сначала привести в порядок Windows 11. Переход на Windows 10 оцениваем по конкретной совместимости, а не по репутации «лёгкой системы»."
      />
      <div className="current-system">
        <Monitor size={20} />
        <div>
          <strong>Установленная Windows</strong>
          <span>
            {state.device.version === "unknown"
              ? state.device.build
                ? `Версия не указана · сборка ${state.device.build}`
                : "Версия и сборка пока неизвестны"
              : `${state.device.version} · ${state.device.edition === "unknown" ? "редакция не указана" : state.device.edition} · ${state.device.build || "сборка не указана"}`}
          </span>
        </div>
        <button
          className="text-button"
          onClick={() => open({ type: "device" })}
        >
          Уточнить
          <ArrowUpRight size={16} />
        </button>
      </div>
      <div className="page-tabs" role="group" aria-label="Раздел Windows">
        {tabs.map((item) => (
          <button
            key={item.id}
            aria-pressed={tab === item.id}
            className={tab === item.id ? "active" : ""}
            onClick={() => setTab(item.id)}
          >
            {item.title}
          </button>
        ))}
      </div>
      {tab === "choice" && (
        <div className="tab-content">
          <div className="os-comparison">
            <section className="os-card recommended">
              <div className="os-card-top">
                <span className="windows-logo" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
                <Badge tone="green">Основной вариант</Badge>
              </div>
              <h2>
                Windows 11<span>25H2</span>
              </h2>
              <p>
                Актуальная целевая ветка для рассмотрения после аудита и
                проверки совместимости.
              </p>
              <ul className="check-list">
                <li>
                  <Check size={16} />
                  Home/Pro: поддержка до 12.10.2027
                </li>
                <li>
                  <Check size={16} />
                  Не нужен переход на другую ОС ради отката твиков
                </li>
                <li>
                  <Check size={16} />
                  Обновление — когда предлагается Windows Update
                </li>
              </ul>
              <SourceRefs compact ids={["windows", "health"]} />
              <button
                className="button button-primary"
                onClick={() => open({ type: "guide", id: "updates" })}
              >
                Как обновлять безопасно
                <ArrowUpRight size={17} />
              </button>
            </section>
            <section className="os-card">
              <div className="os-card-top">
                <span className="os-ten mono">10</span>
                <Badge tone="amber">Только с обоснованием</Badge>
              </div>
              <h2>
                Windows 10<span>22H2 + ESU</span>
              </h2>
              <p>
                Временный вариант для конкретной несовместимости. Не способ
                автоматически снизить нагрев.
              </p>
              <ul className="os-caveats">
                <li>Обычная поддержка завершена 14.10.2025</li>
                <li>
                  Текущая потребительская ESU — до <strong>12.10.2027</strong>
                </li>
                <li>Требуется регистрация; условия зависят от региона</li>
                <li>ESU не включает новые функции и полную поддержку</li>
              </ul>
              <SourceRefs compact ids={["esu"]} />
              <p className="fine-print">
                Полный OEM-набор драйверов Windows 10 для этой ревизии не
                подтверждён. Драйвер AMD для CPU не доказывает совместимость
                всего ноутбука.
              </p>
            </section>
          </div>
          <Notice tone="blue" title="Не повторяем устаревшую дату ESU">
            На проверенной текущей странице Microsoft указано 12 октября 2027
            года. В старых статьях ещё встречается 13 октября 2026 года. Уже
            подключённые подходящие устройства продлеваются автоматически; сам
            факт установки Windows 10 не означает подключения к ESU.{" "}
            <SourceRefs compact ids={["esu"]} />
          </Notice>
          <section className="section-block">
            <div className="section-heading">
              <h2>Границы поддержки Home / Pro</h2>
              <SourceRefs compact ids={["windows"]} />
            </div>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Версия</th>
                    <th>Окончание обновлений</th>
                    <th>Что учитывать</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <strong>23H2</strong>
                    </td>
                    <td>11.11.2025</td>
                    <td>
                      <Badge tone="amber">Поддержка завершена</Badge>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>24H2</strong>
                    </td>
                    <td>13.10.2026</td>
                    <td>Подготовить переход; не обходить блокировки</td>
                  </tr>
                  <tr>
                    <td>
                      <strong>25H2</strong>
                    </td>
                    <td>12.10.2027</td>
                    <td>
                      <Badge tone="green">Целевая ветка после проверки</Badge>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <strong>26H1</strong>
                    </td>
                    <td>14.03.2028</td>
                    <td>
                      Для определённых новых устройств, не обновление этого
                      XBOOK
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="fine-print">
              Сроки Enterprise/Education отличаются. Заводская комплектация
              включает Home, но текущая редакция вашего ноутбука пока
              неизвестна.
            </p>
          </section>
          <section className="section-block">
            <div className="section-heading">
              <div>
                <span className="eyebrow">ПРАКТИКА</span>
                <h2>Настройки без крайностей</h2>
              </div>
            </div>
            <div className="guide-library">
              {[
                "power",
                "graphics",
                "autostart",
                "memory",
                "secure-boot",
                "updates",
              ].map((id) => (
                <GuideLink key={id} id={id} />
              ))}
            </div>
          </section>
          <Accordion title="Нужен ли новый Xbox mode?">
            Это отдельный полноэкранный интерфейс для управления играми, не
            обычный Game Mode. Microsoft указывает Windows 11 24H2 и новее и
            доступность только в поддерживаемых рынках. Если пункт есть, можно
            изучить его отдельно; принудительно включать скрытые функции не
            нужно. Для повседневного ноутбука это необязательная часть
            настройки. <SourceRefs ids={["xbox-mode"]} />
          </Accordion>
        </div>
      )}
      {tab === "updates" && (
        <div className="tab-content">
          <Notice
            tone="green"
            icon={<ShieldCheck size={21} />}
            title="База — обновления безопасности, не Preview"
          >
            Снимок обычного канала на 06.09.2026. Сентябрьского ежемесячного
            выпуска в проверенном журнале ещё нет. Перед установкой откройте
            актуальный журнал Microsoft.{" "}
            <SourceRefs compact ids={["windows"]} />
          </Notice>
          <div className="release-card">
            <div className="release-heading">
              <div>
                <span className="eyebrow">11 АВГУСТА 2026</span>
                <h2>KB5121003</h2>
              </div>
              <Badge tone="green">Обновление безопасности</Badge>
            </div>
            <div className="release-builds">
              <div>
                <span>Windows 11 25H2</span>
                <strong className="mono">26200.9168</strong>
              </div>
              <div>
                <span>Windows 11 24H2</span>
                <strong className="mono">26100.9168</strong>
              </div>
            </div>
            <p>
              Устанавливается через Windows Update с учётом совместимости. Для
              затронутых RGB-драйверами игр отдельно опубликовано устранение
              проблемы 26 августа; нужен перезапуск и применение исправления.
            </p>
            <SourceRefs ids={["windows", "health"]} />
          </div>
          <div className="release-card preview-release">
            <div className="release-heading">
              <div>
                <span className="eyebrow">27 АВГУСТА 2026</span>
                <h2>KB5120998</h2>
              </div>
              <Badge tone="amber">Необязательное Preview</Badge>
            </div>
            <div className="release-builds">
              <div>
                <span>Windows 11 25H2</span>
                <strong className="mono">26200.9278</strong>
              </div>
              <div>
                <span>Windows 11 24H2</span>
                <strong className="mono">26100.9278</strong>
              </div>
            </div>
            <p>
              Более новый номер не делает выпуск обязательным. Для базового
              игрового профиля не устанавливаем Preview без причины: описаны
              проблемы с фоном рабочего стола и пользовательскими курсорами.
            </p>
            <SourceRefs ids={["windows", "health"]} />
          </div>
          <section className="section-block">
            <div className="section-heading">
              <h2>Известные проблемы: что относится к вам</h2>
              <Badge>Проверено 06.09.2026</Badge>
            </div>
            <Accordion
              title="Игры зависают при определённых RGB-драйверах"
              defaultOpen
            >
              <Badge tone="green">Устранена · 26.08.2026</Badge>
              <p>
                Microsoft связывает проблему после KB5121003 с определёнными
                драйверами RGB-периферии. Исправление распространяется
                автоматически на неуправляемые устройства и требует перезапуска.
                Не означает, что любой игровой вылет на XBOOK имеет эту причину.
              </p>
              <SourceRefs ids={["health"]} />
            </Accordion>
            <Accordion title="Чёрный фон рабочего стола и сброс курсоров">
              <Badge tone="amber">Подтверждено · исправление ожидается</Badge>
              <p>
                Описано после Preview KB5120998: фон может стать чёрным, а
                пользовательские курсоры на неанглийских установках
                сбрасываться. Не устанавливайте новые твикеры персонализации для
                обхода этой ошибки. Перепроверьте статус у Microsoft.
              </p>
              <SourceRefs ids={["health"]} />
            </Accordion>
            <Accordion title="Уведомление «Microsoft Defender выключен»">
              <p>
                У Microsoft есть подтверждённая проблема ложных уведомлений при
                работающей защите. Но после BoosterX и неизвестного твикера
                нельзя автоматически считать любое предупреждение ложным:
                проверьте реальный статус защиты и поставщика антивируса.
              </p>
              <SourceRefs ids={["health"]} />
            </Accordion>
            <Accordion title="Проблема Teams и Outlook на ARM">
              <p>
                Описанное Microsoft ограничение относится к ARM-устройствам.
                Ryzen 5 7535HS — x86-64; не переносим эту проблему на него лишь
                потому, что версия Windows совпадает.
              </p>
              <SourceRefs ids={["health", "amd"]} />
            </Accordion>
          </section>
          <GuideLink id="secure-boot" />
          <GuideLink id="updates" />
        </div>
      )}
      {tab === "drivers" && (
        <div className="tab-content">
          <Notice
            tone="amber"
            icon={<TriangleAlert size={21} />}
            title="Для ноутбука сначала проверяем OEM"
          >
            AMD рекомендует проверенные производителем ноутбука драйверы. Если
            универсальный пакет вызывает проблемы со сном, яркостью или внешним
            экраном — возвращайтесь к совместимому OEM-пакету.{" "}
            <SourceRefs compact ids={["amd"]} />
          </Notice>
          <div className="driver-feature">
            <span className="driver-icon">
              <Download size={28} strokeWidth={1.4} />
            </span>
            <div>
              <div className="eyebrow">AMD SOFTWARE: ADRENALIN EDITION</div>
              <h2>
                26.8.1 <Badge tone="green">WHQL Recommended</Badge>
              </h2>
              <p>20.08.2026 · рекомендуемый пакет на странице Ryzen 5 7535HS</p>
              <SourceRefs compact ids={["amd"]} />
            </div>
            <a
              className="button button-secondary"
              href="https://www.amd.com/en/support/downloads/drivers.html/processors/ryzen/ryzen-7000-series/amd-ryzen-5-7535hs.html"
              target="_blank"
              rel="noreferrer"
            >
              Официальная страница
              <ArrowUpRight size={16} />
            </a>
          </div>
          <div className="driver-secondary">
            <span>
              <strong>26.9.1</strong> · 03.09.2026
            </span>
            <Badge tone="amber">WHQL Optional</Badge>
            <p>
              Более новый необязательный выпуск. Сначала примечания к версии и
              конкретная потребность, не автоматическая замена рабочего
              драйвера.
            </p>
          </div>
          <div className="table-scroll section-block">
            <table>
              <thead>
                <tr>
                  <th>Компонент</th>
                  <th>Состояние информации</th>
                  <th>Правильный маршрут</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>BIOS / EC</td>
                  <td>
                    <Badge tone="amber">Последняя версия не подтверждена</Badge>
                  </td>
                  <td>Carlcare / Infinix по точной модели и ревизии</td>
                </tr>
                <tr>
                  <td>Чипсет, Wi-Fi, Bluetooth, аудио</td>
                  <td>Установленные версии и поставщики неизвестны</td>
                  <td>OEM / Windows Update, не случайный драйвер-пак</td>
                </tr>
                <tr>
                  <td>Radeon 660M</td>
                  <td>AMD-пакеты проверены; ваш драйвер неизвестен</td>
                  <td>OEM в приоритете, затем совместимый AMD</td>
                </tr>
              </tbody>
            </table>
          </div>
          <SourceRefs ids={["carlcare", "amd"]} />
          <div className="two-column section-block">
            <section className="paper-panel">
              <h2>До установки</h2>
              <GuideLink id="drivers" />
              <p className="fine-print">
                Не прошивайте BIOS от другой комплектации B15. «Та же серия» не
                означает совместимость.
              </p>
            </section>
            <section className="paper-panel">
              <h2>Подбор по устройству</h2>
              <p>
                Серийный номер вводите только на официальной странице сервиса,
                не на этом сайте.
              </p>
              <a
                className="text-button"
                href="https://www.carlcare.com/global/drivers-download/"
                target="_blank"
                rel="noreferrer"
              >
                Carlcare · драйверы Infinix
                <ArrowUpRight size={16} />
              </a>
            </section>
          </div>
        </div>
      )}
      <div className="question-strip">
        <CircleHelp size={20} />
        <span>
          Не знаете, что стоит сейчас? Начните с команды <code>winver</code>.
        </span>
        <button
          className="text-button"
          onClick={() => open({ type: "guide", id: "inventory" })}
        >
          Как посмотреть
          <ArrowRight size={16} />
        </button>
        <ChevronRight className="mobile-only" size={16} />
      </div>
    </>
  );
}
