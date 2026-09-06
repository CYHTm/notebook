import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Gauge,
  Gamepad2,
  Leaf,
  Save,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import {
  Badge,
  GuideLink,
  Notice,
  PageHeading,
  SourceRefs,
} from "../components/ui";
import { profilePresets } from "../data/guides";
import type { ProfileId } from "../data/guides";
import { useLab } from "../lib/context";

export default function Profiles() {
  const reducedMotion = useReducedMotion();
  const { state, canPersist, saveProfile, navigate, open } = useLab();
  const [selected, setSelected] = useState<ProfileId>(state.profile.id);
  const [fps, setFps] = useState(state.profile.fps);
  const preset = profilePresets.find((p) => p.id === selected)!;
  const saved = state.profile.id === selected && state.profile.fps === fps;
  const icons = { quiet: Leaf, balanced: Scale, performance: Gauge };
  return (
    <>
      <PageHeading
        index="03"
        eyebrow="ИГРОВЫЕ ПРОФИЛИ"
        title="Выберите свой баланс."
        description="Три отправные точки, а не три волшебные кнопки. Сохраняем план в браузере, применяем настройки вручную и проверяем результат в игре."
        action={
          <Badge tone="green">
            <ShieldCheck size={13} />
            Без разгона
          </Badge>
        }
      />
      <div
        className="profile-options"
        role="group"
        aria-label="Игровой профиль"
      >
        {profilePresets.map((p) => {
          const Icon = icons[p.id];
          return (
            <button
              key={p.id}
              onClick={() => {
                setSelected(p.id);
                setFps(p.fps);
              }}
              aria-pressed={selected === p.id}
              className={`profile-option ${selected === p.id ? "selected" : ""}`}
            >
              <span className="profile-choice-top">
                <Icon size={26} strokeWidth={1.5} />
                <span className="profile-radio">
                  {selected === p.id && <span />}
                </span>
              </span>
              <strong>{p.name}</strong>
              <span>{p.subtitle}</span>
              {p.id === "balanced" && (
                <span className="profile-recommendation">
                  Рекомендуем начать здесь
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="profile-builder">
        <section className="profile-controls">
          <div className="section-heading">
            <div>
              <span className="eyebrow">01 / ЦЕЛЬ ЭКСПЕРИМЕНТА</span>
              <h2>Не рендерить лишнее</h2>
            </div>
            <Gamepad2 size={27} strokeWidth={1.5} />
          </div>
          <p>{preset.description}</p>
          <div className="fps-control">
            <div>
              <label htmlFor="fps-target">Целевой лимит кадров</label>
              <motion.div
                key={fps}
                initial={reducedMotion ? false : { opacity: 0.65 }}
                animate={{ opacity: 1 }}
                className="fps-value"
              >
                {fps}
                <span>FPS</span>
              </motion.div>
            </div>
            <input
              id="fps-target"
              type="range"
              min="30"
              max="120"
              step="5"
              value={fps}
              onChange={(event) => setFps(Number(event.target.value))}
              style={
                {
                  "--range-progress": `${((fps - 30) / 90) * 100}%`,
                } as React.CSSProperties
              }
              aria-valuetext={`${fps} кадров в секунду, целевой лимит`}
            />
            <div className="range-labels mono">
              <span>30 · тише</span>
              <span>60</span>
              <span>120 · выше нагрузка</span>
            </div>
          </div>
          <Notice
            tone={fps > 60 ? "amber" : "neutral"}
            title={
              fps > 60
                ? "На встроенном экране заявлено 60 Гц"
                : "Лимит — не обещанный FPS"
            }
          >
            {fps > 60
              ? "Более высокий FPS не превращает экран в 120-Гц. Проверяйте выигрыш в задержке и цену по нагреву. Для внешнего монитора отдельно уточните частоту."
              : "Если Radeon 660M не держит выбранный уровень, снижайте качество или лимит. Чужие результаты и настройки другой игры не являются гарантией."}{" "}
            <SourceRefs compact ids={["retailer", "chill"]} />
          </Notice>
          <div className="profile-tradeoff">
            <span className="eyebrow">КОМПРОМИСС</span>
            <p>{preset.tradeoff}</p>
          </div>
        </section>
        <section className="recipe-card">
          <div className="recipe-header">
            <span className="eyebrow">02 / ВАШ ПЛАН</span>
            <Badge tone="green">
              {saved
                ? canPersist
                  ? "Сохранён в браузере"
                  : "Только в этом сеансе"
                : "Есть изменения"}
            </Badge>
          </div>
          <h2>
            {preset.name}
            <span>.</span>
          </h2>
          <p className="recipe-subtitle">Infinix XBOOK B15 / Radeon 660M</p>
          <dl className="recipe-list">
            <div>
              <dt>Питание</dt>
              <dd>{preset.power}</dd>
            </div>
            <div>
              <dt>Лимит FPS</dt>
              <dd>{fps} · один ограничитель в игре</dd>
            </div>
            <div>
              <dt>Графика</dt>
              <dd>{preset.quality}</dd>
            </div>
            <div>
              <dt>Разрешение</dt>
              <dd>{preset.resolution}</dd>
            </div>
            <div>
              <dt>Process Lasso</dt>
              <dd>Без неизвестных ручных ограничений</dd>
            </div>
            <div>
              <dt>Проверка</dt>
              <dd>Та же сцена, 10–15 минут, замер до/после</dd>
            </div>
          </dl>
          <button
            className="button button-light"
            onClick={() => saveProfile(selected, fps)}
          >
            <Save size={17} />
            {saved ? "Сохранить план ещё раз" : "Сохранить мой план"}
            <ArrowUpRight size={17} />
          </button>
          <span className="recipe-disclaimer">
            <Check size={13} />
            Не меняет настройки компьютера
          </span>
        </section>
      </div>
      <div className="two-column section-block">
        <section className="paper-panel">
          <span className="eyebrow">ПРИМЕНИТЬ ВРУЧНУЮ</span>
          <h2>От плана к настройкам</h2>
          <GuideLink id="fps" />
          <GuideLink id="graphics" />
          <GuideLink id="power" />
        </section>
        <section className="paper-panel next-step-panel">
          <span className="eyebrow">03 / УБЕДИТЬСЯ В РЕЗУЛЬТАТЕ</span>
          <h2>
            Пусть решает замер,
            <br />а не название профиля.
          </h2>
          <p>
            Запишите исходный тест, измените один параметр и повторите ту же
            сцену. Падение температуры полезно только вместе с приемлемой
            плавностью.
          </p>
          <button
            className="button button-secondary"
            onClick={() => navigate("journal")}
          >
            Перейти к замерам
            <ArrowRight size={17} />
          </button>
          <button
            className="text-button"
            onClick={() => open({ type: "guide", id: "baseline" })}
          >
            Как сравнивать корректно
            <ArrowUpRight size={16} />
          </button>
        </section>
      </div>
    </>
  );
}
