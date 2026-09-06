import {
  ArrowRight,
  ArrowUpRight,
  Cpu,
  GitBranch,
  Power,
  ShieldCheck,
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

const rules = [
  {
    name: "ProBalance",
    tag: "Штатная конфигурация",
    tone: "green" as const,
    detail:
      "Начать со стандартных настроек. Смотреть журнал вмешательств, не добавлять исключения всем играм заранее.",
  },
  {
    name: "Performance Mode",
    tag: "Проверить схему",
    tone: "amber" as const,
    detail:
      "Проверить автоматическое обнаружение игр и выбранный план. Постоянный Bitsum Highest Performance не является целью.",
  },
  {
    name: "CPU Priority",
    tag: "Без принудительного Real-time",
    tone: "neutral" as const,
    detail:
      "Для базового теста не задавать вручную High/Real-time. Сначала сохранить и разобрать уже существующие правила.",
  },
  {
    name: "CPU Affinity / CPU Sets",
    tag: "Без случайного ограничения ядер",
    tone: "neutral" as const,
    detail:
      "Не переносить маски ядер от Intel или Ryzen X3D. Не ограничивать игру одним ядром и не отключать SMT вслепую.",
  },
  {
    name: "Efficiency Mode / CPU Limiter",
    tag: "Проверить правила игры",
    tone: "amber" as const,
    detail:
      "Убедиться, что игре не назначены неизвестные ограничения. Менять по одному правилу, сохраняя исходное состояние.",
  },
  {
    name: "SmartTrim / Startup Boost",
    tag: "Не добавлять без причины",
    tone: "neutral" as const,
    detail:
      "Ручная очистка памяти и новые алгоритмы не обязательны. Сначала сравнить базовую конфигурацию и конкретный симптом.",
  },
];

export default function Lasso() {
  const { open, navigate } = useLab();
  return (
    <>
      <PageHeading
        index="05"
        eyebrow="PROCESS LASSO"
        title="Не больше правил. Больше смысла."
        description="Process Lasso — инструмент управления, а не готовый рецепт FPS. Сейчас его конфигурация неизвестна, поэтому начинаем с сохранения и аудита."
      />
      <div className="lasso-intro">
        <section className="lasso-thesis">
          <span className="lasso-symbol">
            <GitBranch size={38} strokeWidth={1.3} />
          </span>
          <div>
            <span className="eyebrow">ГЛАВНОЕ РАЗЛИЧИЕ</span>
            <h2>ProBalance ≠ Performance Mode</h2>
            <p>
              Первый помогает с отзывчивостью при конкурирующей CPU-нагрузке.
              Второй может переключить план питания. Они решают разные задачи.
            </p>
            <SourceRefs ids={["lasso", "lasso-mode"]} />
          </div>
        </section>
        <aside className="lasso-version">
          <span className="eyebrow">СТАБИЛЬНЫЙ ВЫПУСК</span>
          <strong className="mono">18.3.0.34</strong>
          <span>02 сентября 2026</span>
          <Badge tone="green">Не Beta</Badge>
          <SourceRefs compact ids={["lasso-release"]} />
          <p>Установленную версию проверьте на ноутбуке.</p>
        </aside>
      </div>
      <Notice
        tone="amber"
        icon={<Power size={21} />}
        title="Проверьте, не включается ли «максимум» сам"
      >
        Bitsum Highest Performance препятствует снижению частоты CPU ниже
        базовой. Для тонкого ноутбука с приоритетом охлаждения разумнее сравнить
        штатный баланс, чем постоянно удерживать такой режим. Это рекомендация
        для теста, не утверждение о вашей текущей конфигурации.{" "}
        <SourceRefs compact ids={["lasso"]} />
      </Notice>
      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow">КАРТА АУДИТА</span>
            <h2>Что посмотреть в первую очередь</h2>
          </div>
          <button
            className="button button-secondary"
            onClick={() => open({ type: "guide", id: "lasso" })}
          >
            Пошаговая инструкция
            <ArrowUpRight size={16} />
          </button>
        </div>
        <div className="lasso-rules">
          {rules.map((rule, i) => (
            <div className="lasso-rule" key={rule.name}>
              <span className="mono rule-number">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3>{rule.name}</h3>
                <p>{rule.detail}</p>
              </div>
              <Badge tone={rule.tone}>{rule.tag}</Badge>
            </div>
          ))}
        </div>
        <p className="fine-print">
          Это редакционная карта проверки, а не считанные настройки вашего
          Process Lasso. Названия пунктов могут зависеть от установленной
          версии.
        </p>
        <SourceRefs ids={["lasso", "lasso-mode", "lasso-release", "amd"]} />
      </section>
      <div className="two-column section-block">
        <section className="paper-panel">
          <span className="eyebrow">ВАШ ПРОЦЕССОР</span>
          <div className="processor-note">
            <Cpu size={34} strokeWidth={1.3} />
            <div>
              <h2>6 ядер. 12 потоков.</h2>
              <p>Ryzen 5 7535HS / Zen 3+</p>
            </div>
          </div>
          <p>
            Это не гибридный Intel с P/E-ядрами и не многокристальный X3D.
            Советы «убрать E-ядра» или «выбрать игровой CCD» не являются
            настройкой для этой модели.
          </p>
          <SourceRefs ids={["amd"]} />
        </section>
        <section className="paper-panel">
          <span className="eyebrow">КРИТЕРИЙ УСПЕХА</span>
          <h2>Плавность без лишнего нагрева</h2>
          <p>
            Один и тот же игровой тест до и после. Если разницы нет,
            дополнительное правило не нужно сохранять просто потому, что оно
            существует.
          </p>
          <button className="text-button" onClick={() => navigate("journal")}>
            Сравнить результаты
            <ArrowRight size={16} />
          </button>
        </section>
      </div>
      <Accordion title="Нужно ли удалять Process Lasso?">
        Само наличие программы не является неисправностью. Сначала сохраните
        конфигурацию, проверьте правила и сравните поведение. Если функции не
        нужны и нет измеримой пользы, можно отказаться от программы, учитывая
        оставшуюся активную схему питания. <SourceRefs ids={["lasso"]} />
      </Accordion>
      <Accordion title="Закрыть окно — значит выключить все правила?">
        Не обязательно: фоновый движок Process Governor может продолжать работу.
        Кроме того, отдельные правила могут быть закреплены в реестре. Для
        чистого сравнения нужно понимать, какие функции действительно активны, а
        не ориентироваться только на значок окна.{" "}
        <SourceRefs ids={["lasso", "lasso-release"]} />
      </Accordion>
      <GuideLink id="power" />
      <div className="safety-footnote">
        <ShieldCheck size={15} />
        Ни одно правило Process Lasso не изменяется этим сайтом.
      </div>
    </>
  );
}
