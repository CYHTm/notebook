import { ArrowRight, Fan, Power, Thermometer, Wind } from "lucide-react";
import {
  Badge,
  GuideLink,
  Notice,
  PageHeading,
  SourceRefs,
} from "../components/ui";
import { CoolingDiagram } from "../components/CoolingDiagram";
import { coolingLabels } from "../lib/state";
import type { CoolingMode } from "../lib/state";
import { useLab } from "../lib/context";

export default function Cooling() {
  const { state, setCooling, navigate } = useLab();
  const latest = [...state.measurements].reverse().find((m) => m.cpu !== null);
  return (
    <>
      <PageHeading
        index="04"
        eyebrow="ОХЛАЖДЕНИЕ"
        title="Меньше тепла. Больше контроля."
        description="Улучшайте условия, уменьшайте ненужную нагрузку и сравнивайте. Подставка помогает воздухообмену, но не увеличивает возможности радиатора до бесконечности."
      />
      <div className="cooling-workspace">
        <section className="cooling-simulator">
          <div className="section-heading">
            <div>
              <span className="eyebrow">СХЕМА ПОДСТАВКИ</span>
              <h2>DeepCool MULTI CORE X6</h2>
            </div>
            <Badge>Не подключена к сайту</Badge>
          </div>
          <CoolingDiagram mode={state.cooling} />
          <div
            className="cooling-mode-buttons"
            role="group"
            aria-label="Схема вентиляторов X6"
          >
            {(Object.keys(coolingLabels) as CoolingMode[]).map((mode) => (
              <button
                key={mode}
                aria-pressed={state.cooling === mode}
                className={state.cooling === mode ? "active" : ""}
                onClick={() => setCooling(mode)}
              >
                {mode === "off" ? <Power size={15} /> : <Fan size={15} />}
                {mode === "all"
                  ? "Все 4"
                  : mode === "upper"
                    ? "Верхние"
                    : mode === "lower"
                      ? "Нижние"
                      : "Выкл."}
              </button>
            ))}
          </div>
          <p className="fine-print">
            Выбор меняет только схему и план теста. Реальный режим задаётся
            физическим переключателем подставки.
          </p>
          <SourceRefs ids={["cooler"]} />
        </section>
        <aside className="thermal-notes">
          <div className="thermal-limit">
            <div className="eyebrow">
              <Thermometer size={15} />
              ПРЕДЕЛ, А НЕ ЦЕЛЬ
            </div>
            <div className="thermal-number">
              95<span>°C</span>
            </div>
            <strong>Tjmax Ryzen 5 7535HS</strong>
            <p>
              Предел температуры кристалла по AMD. Не комфортная цель для игры и
              не показатель температуры корпуса, SSD или батареи.
            </p>
            <div className="thermal-scale">
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
            <SourceRefs compact ids={["amd-chip"]} />
          </div>
          <div className="last-temperature">
            <span>Ваш последний введённый максимум CPU</span>
            <strong>
              {latest ? latest.cpu : "—"}
              <span>°C</span>
            </strong>
            <p>
              {latest
                ? `${latest.game} · ${new Date(latest.createdAt).toLocaleDateString("ru-RU")}. Ручной замер, не текущая температура.`
                : "Замеров пока нет. Браузер не считывает датчики ноутбука."}
            </p>
            <button className="text-button" onClick={() => navigate("journal")}>
              Открыть журнал
              <ArrowRight size={15} />
            </button>
          </div>
        </aside>
      </div>
      <div className="cooler-facts">
        <div>
          <strong>4</strong>
          <span>вентилятора</span>
        </div>
        <div>
          <strong>
            140 + 100<span> мм</span>
          </strong>
          <span>два размера, по паре каждого</span>
        </div>
        <div>
          <strong>
            USB 5<span> В</span>
          </strong>
          <span>питание подставки</span>
        </div>
        <div>
          <strong>4</strong>
          <span>комбинации включения</span>
        </div>
      </div>
      <SourceRefs ids={["cooler"]} />
      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow">ПРАКТИЧЕСКИЙ ПРОТОКОЛ</span>
            <h2>Один параметр за один тест</h2>
          </div>
          <Wind size={26} strokeWidth={1.4} />
        </div>
        <div className="guide-library">
          <GuideLink id="cooler" number="01" />
          <GuideLink id="fps" number="02" />
          <GuideLink id="baseline" number="03" />
        </div>
      </section>
      <Notice tone="amber" title="Не задаём выдуманный «безопасный TDP»">
        Диапазон 35–54 Вт в спецификации CPU не подтверждает реальные лимиты
        Infinix. Совместимость undervolt, сторонних контроллеров мощности и
        кривой вентилятора для этой ревизии не установлена — в базовом маршруте
        их нет. <SourceRefs compact ids={["amd-chip", "carlcare"]} />
      </Notice>
      <section className="editorial-aside">
        <span className="eyebrow">КОГДА ОСТАНОВИТЬ ТЕСТ</span>
        <p>
          Самопроизвольные выключения, необычный запах, повреждение или вздутие
          батареи — повод прекратить нагрузку и обратиться в сервис, а не
          продолжать подбор параметров. Повторяющийся троттлинг оценивайте по
          длительности и производительности, а не по одному пику датчика.
        </p>
      </section>
    </>
  );
}
