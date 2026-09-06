import { useState } from "react";
import {
  ArrowDownUp,
  ArrowUpRight,
  BarChart3,
  Check,
  Download,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import {
  Badge,
  EmptyState,
  Notice,
  PageHeading,
  SourceRefs,
} from "../components/ui";
import { useLab } from "../lib/context";
import {
  compareMeasurements,
  coolingLabels,
  noiseLabels,
  profileName,
} from "../lib/state";
import type { Measurement } from "../lib/state";

const format = (n: number | null, suffix = "") =>
  n === null
    ? "—"
    : `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 }).format(n)}${suffix}`;
const signed = (n: number | null, suffix: string) =>
  n === null ? "Не измерено" : `${n > 0 ? "+" : ""}${format(n)}${suffix}`;
export default function Journal() {
  const { state, canPersist, open, exportReport } = useLab();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selected = selectedIds
    .map((id) => state.measurements.find((m) => m.id === id))
    .filter((m): m is Measurement => !!m);
  const toggle = (id: string) => {
    const valid = selected.map((m) => m.id);
    setSelectedIds(
      valid.includes(id)
        ? valid.filter((x) => x !== id)
        : valid.length < 2
          ? [...valid, id]
          : [valid[1], id],
    );
  };
  const comparison =
    selected.length === 2
      ? compareMeasurements(selected[0], selected[1])
      : null;
  return (
    <>
      <PageHeading
        index="06"
        eyebrow="ЖУРНАЛ ЗАМЕРОВ"
        title="Разница, которую можно проверить."
        description="Только ваши ручные измерения. Никаких выдуманных FPS или «живой» температуры. Сравнивайте одинаковые сцены и фиксируйте условия."
        action={
          <button
            className="button button-primary"
            onClick={() => open({ type: "measurement" })}
          >
            <Plus size={18} />
            Добавить замер
          </button>
        }
      />
      <div className="journal-toolbar">
        <div>
          <Badge tone={canPersist ? "green" : "amber"} dot>
            {canPersist ? "Локальное хранение" : "Только текущий сеанс"}
          </Badge>
          <span className="fine-print">
            {state.measurements.length} / 200 записей
          </span>
        </div>
        <button className="text-button" onClick={exportReport}>
          <Download size={16} />
          Скачать отчёт
        </button>
      </div>
      {!state.measurements.length ? (
        <div className="journal-empty">
          <div className="empty-chart" aria-hidden="true">
            <div className="chart-grid" />
            <span className="chart-axis y">FPS</span>
            <span className="chart-axis x">ВРЕМЯ</span>
            <div className="empty-chart-line" />
            <div className="chart-marker" />
            <span className="chart-wait-label">Здесь будет ваш результат</span>
          </div>
          <EmptyState
            icon={<BarChart3 size={26} />}
            title="Хорошая настройка начинается с замера"
            description="Запишите игру, сцену, средний FPS и максимум температуры. Если какой-то показатель недоступен, оставьте его пустым — не подставляйте ноль."
            action={
              <button
                className="button button-primary"
                onClick={() => open({ type: "measurement" })}
              >
                <Plus size={17} />
                Записать исходный тест
              </button>
            }
          />
        </div>
      ) : (
        <>
          <div className="comparison-selection">
            <span>Выберите две записи: первая — «до», вторая — «после».</span>
            <Badge>{selected.length} / 2 выбрано</Badge>
          </div>
          <div className="table-scroll">
            <table className="measurement-table">
              <thead>
                <tr>
                  <th>
                    <span className="sr-only">Выбор</span>
                  </th>
                  <th>Игра / условия</th>
                  <th>AVG FPS</th>
                  <th>1% low</th>
                  <th>CPU max</th>
                  <th>GPU max</th>
                  <th>
                    <span className="sr-only">Действия</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {state.measurements.map((m) => (
                  <tr
                    key={m.id}
                    className={selectedIds.includes(m.id) ? "selected-row" : ""}
                  >
                    <td>
                      <label className="check-control">
                        <input
                          type="checkbox"
                          checked={selected.some((x) => x.id === m.id)}
                          onChange={() => toggle(m.id)}
                          aria-label={`Выбрать для сравнения: ${m.game}, ${m.stage === "before" ? "до" : "после"}, ${m.avg} FPS`}
                        />
                        <span>
                          {selected.some((x) => x.id === m.id) && (
                            <Check size={14} />
                          )}
                        </span>
                      </label>
                    </td>
                    <td>
                      <strong>{m.game}</strong>
                      <span className="measurement-sub">
                        <Badge
                          tone={m.stage === "before" ? "neutral" : "green"}
                        >
                          {m.stage === "before" ? "До" : "После"}
                        </Badge>
                        {new Date(m.createdAt).toLocaleDateString("ru-RU", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </span>
                      <span className="measurement-sub">
                        {m.resolution} · {m.minutes} мин ·{" "}
                        {m.power === "mains" ? "сеть" : "батарея"}
                      </span>
                      <span className="measurement-sub">{m.scene}</span>
                    </td>
                    <td className="mono">
                      <strong>{format(m.avg)}</strong>
                    </td>
                    <td className="mono">{format(m.low)}</td>
                    <td className="mono">{format(m.cpu, "°")}</td>
                    <td className="mono">{format(m.gpu, "°")}</td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="icon-button"
                          aria-label={`Редактировать замер ${m.game}`}
                          onClick={() =>
                            open({ type: "measurement", id: m.id })
                          }
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          className="icon-button danger-hover"
                          aria-label={`Удалить замер ${m.game}`}
                          onClick={() => open({ type: "delete", id: m.id })}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {comparison && (
            <section className="comparison-result">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">СРАВНЕНИЕ ДВУХ ЗАПИСЕЙ</span>
                  <h2>
                    {selected[0].game}
                    {selected[0].game !== selected[1].game &&
                      ` → ${selected[1].game}`}
                  </h2>
                </div>
                <button
                  className="text-button"
                  onClick={() =>
                    setSelectedIds([selected[1].id, selected[0].id])
                  }
                >
                  <ArrowDownUp size={16} />
                  Поменять порядок
                </button>
              </div>
              <div className="comparison-context">
                <span>
                  До: {profileName(selected[0].profile)} ·{" "}
                  {coolingLabels[selected[0].cooling]}
                </span>
                <span>
                  После: {profileName(selected[1].profile)} ·{" "}
                  {coolingLabels[selected[1].cooling]}
                </span>
              </div>
              <div className="comparison-metrics">
                <div>
                  <span>СРЕДНИЙ FPS</span>
                  <strong>{signed(comparison.fpsPercent, "%")}</strong>
                  <small>
                    {format(selected[0].avg)} → {format(selected[1].avg)}
                  </small>
                </div>
                <div>
                  <span>1% LOW</span>
                  <strong
                    className={comparison.lowPercent === null ? "no-data" : ""}
                  >
                    {signed(comparison.lowPercent, "%")}
                  </strong>
                  <small>
                    {format(selected[0].low)} → {format(selected[1].low)}
                  </small>
                </div>
                <div>
                  <span>CPU MAX</span>
                  <strong
                    className={comparison.cpuDelta === null ? "no-data" : ""}
                  >
                    {signed(comparison.cpuDelta, " °C")}
                  </strong>
                  <small>
                    {format(selected[0].cpu)} → {format(selected[1].cpu)}
                  </small>
                </div>
                <div>
                  <span>GPU MAX</span>
                  <strong
                    className={comparison.gpuDelta === null ? "no-data" : ""}
                  >
                    {signed(comparison.gpuDelta, " °C")}
                  </strong>
                  <small>
                    {format(selected[0].gpu)} → {format(selected[1].gpu)}
                  </small>
                </div>
              </div>
              <div className="comparison-noise">
                <span>ШУМ ПО ОЩУЩЕНИЯМ</span>
                <strong>
                  {noiseLabels[selected[0].noise]} →{" "}
                  {noiseLabels[selected[1].noise]}
                </strong>
                <small>Субъективная оценка, не дБ(А)</small>
              </div>
              {comparison.warnings.length > 0 ? (
                <Notice
                  tone="amber"
                  title="Условия отличаются или не полностью записаны"
                >
                  <ul>
                    {comparison.warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                  Разницу нельзя уверенно приписать одной настройке. Если
                  тестируете именно изменённое условие, явно укажите это в
                  заметках.
                </Notice>
              ) : (
                <Notice tone="green" title="Записанные условия совпадают">
                  Это разница двух введённых результатов, не доказательство
                  причинности. Повторите тест 2–3 раза и оцените разброс, шум и
                  стабильность.
                </Notice>
              )}
            </section>
          )}
        </>
      )}
      <div className="two-column section-block">
        <section className="paper-panel">
          <span className="eyebrow">КАК ИЗМЕРЯТЬ</span>
          <h2>
            Одинаковая сцена.
            <br />
            Одинаковые условия.
          </h2>
          <p>
            Записывайте разрешение, питание, режим X6, температуру комнаты и
            длительность. Меняйте один параметр за тест.
          </p>
          <button
            className="text-button"
            onClick={() => open({ type: "guide", id: "baseline" })}
          >
            Полный протокол
            <ArrowUpRight size={16} />
          </button>
        </section>
        <section className="paper-panel">
          <span className="eyebrow">КАК ЧИТАТЬ РЕЗУЛЬТАТ</span>
          <h2>Не только средний FPS</h2>
          <p>
            1% low помогает оценить редкие просадки, но метод расчёта зависит от
            измерителя. Используйте один инструмент и одну версию для обеих
            записей. Отсутствующий показатель оставляйте пустым.
          </p>
          <p className="fine-print">
            95 °C — предел CPU по AMD, а не цель тестирования.
          </p>
          <SourceRefs compact ids={["amd-chip"]} />
        </section>
      </div>
    </>
  );
}
