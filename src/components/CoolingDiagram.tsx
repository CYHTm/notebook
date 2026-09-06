import { Fan } from "lucide-react";
import type { CoolingMode } from "../lib/state";

export function CoolingDiagram({
  mode = "all",
  small = false,
}: {
  mode?: CoolingMode;
  small?: boolean;
}) {
  return (
    <div
      className={`cooling-diagram ${small ? "small" : ""}`}
      role="img"
      aria-label={`Схема подставки DeepCool X6: ${mode === "all" ? "включены все вентиляторы" : mode === "upper" ? "включена верхняя пара" : mode === "lower" ? "включена нижняя пара" : "вентиляторы выключены"}. Не управление устройством.`}
    >
      <div className="cooling-axis axis-x" />
      <div className="cooling-axis axis-y" />
      <div className="pad-outline">
        <div className="pad-mesh" />
        {[0, 1, 2, 3].map((i) => {
          const active =
            mode === "all" ||
            (mode === "upper" && i < 2) ||
            (mode === "lower" && i >= 2);
          return (
            <div
              key={i}
              className={`pad-fan fan-${i} ${active ? "active" : ""}`}
            >
              <div className="fan-ring" />
              <Fan size={small ? 39 : 65} strokeWidth={1} />
              <span className="fan-center" />
            </div>
          );
        })}
        <div className="pad-brand">DEEPCOOL</div>
      </div>
      {!small && (
        <>
          <span className="diagram-label diagram-label-top">
            ВЕРХНЯЯ ПАРА · 140 ММ
          </span>
          <span className="diagram-label diagram-label-bottom">
            НИЖНЯЯ ПАРА · 100 ММ
          </span>
          <span className="diagram-coordinate coordinate-left">A</span>
          <span className="diagram-coordinate coordinate-right">B</span>
        </>
      )}
    </div>
  );
}
