import {
  ArrowUpRight,
  ClipboardList,
  SearchCheck,
  ShieldCheck,
  Undo2,
} from "lucide-react";
import {
  Badge,
  ChecklistRow,
  GuideLink,
  Notice,
  PageHeading,
  SourceRefs,
} from "../components/ui";
import { useLab } from "../lib/context";

export default function Recovery() {
  const { open, state, navigate } = useLab();
  return (
    <>
      <PageHeading
        index="01"
        eyebrow="ПОСЛЕ ТВИКЕРОВ"
        title="Сначала — понятная основа."
        description="Не лечим неизвестные изменения новыми изменениями. Этот маршрут подходит и тогда, когда вы не помните название второго твикера."
        action={
          <Badge tone="amber" dot>
            Нужна диагностика
          </Badge>
        }
      />
      <div className="audit-tools">
        <span>Известно с ваших слов</span>
        <Badge>BoosterX</Badge>
        <Badge>Консольный твикер · неизвестен</Badge>
        <Badge>Process Lasso</Badge>
      </div>
      <div className="audit-flow">
        {[
          {
            icon: ClipboardList,
            title: "Зафиксировать",
            text: "Данные, версии, текущие правила",
          },
          {
            icon: SearchCheck,
            title: "Проверить",
            text: "Защиту, обновления, питание",
          },
          {
            icon: Undo2,
            title: "Вернуть контроль",
            text: "Только осмысленные изменения",
          },
        ].map((x, i) => (
          <div key={x.title}>
            <span className="flow-icon">
              <x.icon size={24} strokeWidth={1.4} />
            </span>
            <div>
              <span className="mono">0{i + 1}</span>
              <h2>{x.title}</h2>
              <p>{x.text}</p>
            </div>
            {i < 2 && <span className="flow-line" />}
          </div>
        ))}
      </div>
      <Notice
        tone="amber"
        title="Не удаляйте программы до сохранения их конфигурации"
      >
        В BoosterX может остаться резервная копия настроек. Её наличие и
        содержимое нужно проверить. Само удаление программы не подтверждает
        отмену твиков. <SourceRefs compact ids={["booster"]} />
      </Notice>
      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow">БАЗОВАЯ ПРОВЕРКА</span>
            <h2>Четыре шага до оптимизации</h2>
          </div>
          <span className="mono muted">
            {
              ["backup", "inventory", "booster", "protection"].filter((id) =>
                state.checked.includes(id),
              ).length
            }{" "}
            / 4
          </span>
        </div>
        <div className="checklist">
          {["backup", "inventory", "booster", "protection"].map((id, i) => (
            <ChecklistRow key={id} id={id} index={i} />
          ))}
        </div>
        <p className="fine-print">
          Отмечайте только то, что действительно проверили на ноутбуке. Галочка
          сохраняет прогресс, но не выполняет действие.
        </p>
      </section>
      <div className="two-column section-block">
        <section className="paper-panel">
          <span className="eyebrow">ДАЛЬШЕ ПО МАРШРУТУ</span>
          <h2>Питание и процессы</h2>
          <GuideLink id="power" number="05" />
          <GuideLink id="lasso" number="06" />
          <button
            className="text-button panel-footer-link"
            onClick={() => navigate("lasso")}
          >
            Открыть раздел Process Lasso
            <ArrowUpRight size={17} />
          </button>
        </section>
        <section className="paper-panel">
          <span className="eyebrow">ТОЛЬКО ПРИ ПРОБЛЕМАХ</span>
          <h2>Если система нестабильна</h2>
          <GuideLink id="repair" />
          <GuideLink id="reinstall" />
          <p className="fine-print">
            DISM/SFC не отменяют все твики. Чистая установка — отдельное решение
            после резервного копирования, не обязательный пункт.
          </p>
        </section>
      </div>
      <Notice
        tone="green"
        icon={<ShieldCheck size={22} />}
        title="Ноутбука пока нет рядом?"
      >
        Можно спокойно изучить маршрут. Сборка, BIOS и результаты остаются
        неизвестными, пока вы не внесёте их сами.{" "}
        <button
          className="inline-link"
          onClick={() => open({ type: "device" })}
        >
          Открыть мой паспорт
        </button>
      </Notice>
      <section className="editorial-aside">
        <span className="eyebrow">ЧЕГО МЫ НЕ ДЕЛАЕМ</span>
        <p>
          Не отключаем защиту ради FPS. Не удаляем службы готовым списком. Не
          запускаем скрипты из случайной инструкции. Не считаем количество
          процессов показателем здоровья Windows.
        </p>
      </section>
    </>
  );
}
