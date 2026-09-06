import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleCheck,
  Cpu,
  Gamepad2,
  Leaf,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Badge, SourceRefs } from "../components/ui";
import { CoolingDiagram } from "../components/CoolingDiagram";
import { checklistIds } from "../data/guides";
import { useLab } from "../lib/context";
import { profileName } from "../lib/state";

export default function Overview() {
  const reducedMotion = useReducedMotion();
  const { state, canPersist, open, navigate } = useLab();
  const completed = state.checked.length;
  const route = [
    {
      title: "Узнать, что изменили твикеры",
      text: "Резервная копия и аудит Windows",
      page: "recovery" as const,
      ids: ["backup", "inventory", "booster", "protection"],
      icon: ShieldCheck,
    },
    {
      title: "Вернуть контроль над нагрузкой",
      text: "Питание и правила Process Lasso",
      page: "lasso" as const,
      ids: ["power", "lasso"],
      icon: Cpu,
    },
    {
      title: "Подобрать игровой профиль",
      text: "Графика, FPS и охлаждение",
      page: "profiles" as const,
      ids: ["fps"],
      icon: Gamepad2,
    },
    {
      title: "Проверить разницу в игре",
      text: "Замеры до и после, а не ощущения",
      page: "journal" as const,
      ids: ["baseline"],
      icon: CircleCheck,
    },
  ];
  return (
    <>
      <section className="overview-hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <div className="eyebrow">
            <span className="tiny-cross">✳</span>МАКСИМУМ В РАЗУМНЫХ ПРЕДЕЛАХ
          </div>
          <h1 id="hero-title">
            Больше кадров.
            <br />
            <span>Меньше лишнего.</span>
          </h1>
          <p>
            Ваш Infinix XBOOK B15 может работать лучше.
            <br className="desktop-break" /> Начнём с понятных настроек, а не
            новых твикеров.
          </p>
          <div className="hero-actions">
            <button
              className="button button-primary"
              onClick={() => navigate("recovery")}
            >
              {completed ? "Продолжить настройку" : "Начать с диагностики"}
              <ArrowUpRight size={18} />
            </button>
            <button
              className="text-button"
              onClick={() => open({ type: "device", tab: "specs" })}
            >
              Паспорт модели
              <ArrowRight size={16} />
            </button>
          </div>
          <div className="hero-note">
            <ShieldCheck size={15} />
            Без разгона. Без отключения защиты.
          </div>
        </div>
        <div className="hero-product">
          <div className="product-grid" aria-hidden="true" />
          <span className="product-index mono">ОБЪЕКТ / 01</span>
          <div className="product-orbit orbit-one" aria-hidden="true" />
          <div className="product-orbit orbit-two" aria-hidden="true" />
          <motion.img
            src={`${import.meta.env.BASE_URL}laptop-illustration.webp`}
            width="1100"
            height="614"
            alt="Иллюстративный AI-рендер серого ноутбука, не фотография конкретного экземпляра Infinix"
            className="laptop-image"
            initial={reducedMotion ? false : { opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reducedMotion ? 0 : 0.65,
              delay: reducedMotion ? 0 : 0.1,
            }}
            fetchPriority="high"
          />
          <div className="product-cpu">
            <span className="chip-mark">
              <Cpu size={18} />
            </span>
            <span>
              <span className="mono">AMD RYZEN 5</span>
              <strong>7535HS</strong>
            </span>
          </div>
          <div className="product-caption">
            <span>Infinix XBOOK B15</span>
            <span className="mono">BL51A7H</span>
          </div>
          <span className="illustration-note">
            Иллюстрация · не фото устройства
          </span>
        </div>
      </section>

      <section
        className="spec-strip"
        aria-label="Ключевые характеристики модели"
      >
        <div>
          <span className="spec-label">ПРОЦЕССОР</span>
          <strong>
            6 <span>/</span> 12
          </strong>
          <span className="spec-detail">ядер / потоков</span>
        </div>
        <div>
          <span className="spec-label">ГРАФИКА</span>
          <strong className="spec-text-value">Radeon 660M</strong>
          <span className="spec-detail">встроенная графика</span>
        </div>
        <div>
          <span className="spec-label">ПАМЯТЬ</span>
          <strong>
            16 <span>ГБ</span>
          </strong>
          <span className="spec-detail">LPDDR5-6400</span>
        </div>
        <div>
          <span className="spec-label">НАКОПИТЕЛЬ</span>
          <strong>
            512 <span>ГБ</span>
          </strong>
          <span className="spec-detail">SSD · M.2 PCIe</span>
        </div>
        <div>
          <span className="spec-label">ЭКРАН</span>
          <strong>
            15.6<span>″</span>
          </strong>
          <span className="spec-detail">Full HD · IPS · 60 Гц</span>
        </div>
      </section>
      <div className="spec-sources">
        <span>Комплектация 71005000295 · не данные диагностики</span>
        <SourceRefs compact ids={["dns", "amd-chip", "retailer"]} />
      </div>

      <section className="starting-alert">
        <span className="alert-symbol">
          <TriangleAlert size={21} strokeWidth={1.65} />
        </span>
        <div>
          <h2>Сначала разберёмся с тем, что уже изменено</h2>
          <p>
            BoosterX, неизвестный твикер и Process Lasso. Не накладываем новые
            настройки поверх старых.
          </p>
        </div>
        <button onClick={() => navigate("recovery")} className="alert-link">
          Что проверить
          <ArrowRight size={17} />
        </button>
      </section>

      <div className="overview-lower">
        <section className="route-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">ШАГ ЗА ШАГОМ</span>
              <h2>
                Ваш маршрут настройки<span className="heading-dot">.</span>
              </h2>
            </div>
            <span className="progress-fraction mono">
              {completed}
              <span> / {checklistIds.length}</span>
            </span>
          </div>
          <div
            className="progress-track"
            role="progressbar"
            aria-label="Отмеченные шаги настройки"
            aria-valuenow={completed}
            aria-valuemin={0}
            aria-valuemax={checklistIds.length}
          >
            <motion.span
              animate={{ width: `${(completed / checklistIds.length) * 100}%` }}
            />
          </div>
          <div className="route-list">
            {route.map((item, index) => {
              const done = item.ids.every((id) => state.checked.includes(id));
              return (
                <button
                  key={item.page}
                  className={`route-item ${done ? "done" : ""}`}
                  onClick={() => navigate(item.page)}
                >
                  <span className="route-item-number">
                    {done ? (
                      <Check size={16} />
                    ) : (
                      String(index + 1).padStart(2, "0")
                    )}
                  </span>
                  <span className="route-item-copy">
                    <strong>{item.title}</strong>
                    <span>{item.text}</span>
                  </span>
                  <item.icon
                    className="route-icon"
                    size={19}
                    strokeWidth={1.6}
                  />
                  <ChevronRight size={16} className="route-chevron" />
                </button>
              );
            })}
          </div>
          <div className="route-footnote">
            <span className="status-dot" />
            {canPersist
              ? "Прогресс сохраняется только в этом браузере"
              : "Прогресс только в текущем сеансе — скачайте отчёт"}
          </div>
        </section>
        <aside className="overview-aside">
          <section className="profile-preview">
            <div className="preview-top">
              <span className="eyebrow">ВАША ТОЧКА СТАРТА</span>
              <Leaf size={21} strokeWidth={1.5} />
            </div>
            <div className="profile-preview-title">
              <h2>{profileName(state.profile.id)}</h2>
              <Badge tone="green">Без крайностей</Badge>
            </div>
            <p>
              Отзывчивость в игре. Предсказуемое питание.
              <br />
              Никакой погони за частотой любой ценой.
            </p>
            <div className="preview-bottom">
              <div>
                <strong>
                  {state.profile.fps}
                  <span>FPS</span>
                </strong>
                <span>лимит для проверки, не прогноз</span>
              </div>
              <button
                className="round-button"
                aria-label="Подобрать игровой профиль"
                onClick={() => navigate("profiles")}
              >
                <ArrowUpRight size={21} />
              </button>
            </div>
          </section>
          <button className="cooler-teaser" onClick={() => navigate("cooling")}>
            <div>
              <span className="eyebrow">ОХЛАЖДЕНИЕ</span>
              <h3>
                DeepCool
                <br />
                MULTI CORE X6
              </h3>
              <span className="teaser-link">
                Настроить условия теста
                <ArrowUpRight size={14} />
              </span>
            </div>
            <CoolingDiagram mode={state.cooling} small />
          </button>
        </aside>
      </div>

      <section className="edition-note">
        <ArrowDownRight size={28} strokeWidth={1.4} />
        <div>
          <h2>Windows 10 или всё-таки 11?</h2>
          <p>
            Не выбираем по мифам. Смотрим на поддержку, совместимость и
            состояние вашей системы.
          </p>
        </div>
        <button className="text-button" onClick={() => navigate("windows")}>
          Разобраться
          <ArrowUpRight size={17} />
        </button>
      </section>
    </>
  );
}
