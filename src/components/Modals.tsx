import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Download,
  FileText,
  Info,
  Laptop,
  Search,
  ShieldCheck,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { Badge, CodeBlock, EmptyState, Modal, Notice, SourceRefs } from "./ui";
import { checklistIds, getGuide, guides, profilePresets } from "../data/guides";
import { hardwareGroups, unknownHardware } from "../data/hardware";
import { RESEARCH_DATE } from "../data/sources";
import { useLab } from "../lib/context";
import type { ModalState, PageId } from "../lib/context";
import { coolingLabels, isMeasurement, validateDevice } from "../lib/state";
import type { CoolingMode, DeviceInfo, Measurement } from "../lib/state";
import { pages } from "../lib/routes";

function FormError({ id, message }: { id?: string; message: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
    ref.current?.scrollIntoView({ block: "center" });
  }, [message]);
  return (
    <p ref={ref} id={id} className="form-error" role="alert" tabIndex={-1}>
      <TriangleAlert size={18} />
      {message}
    </p>
  );
}

function GuideModal({ id }: { id: string }) {
  const { close, state, toggleCheck, open } = useLab();
  const guide = getGuide(id);
  if (!guide)
    return (
      <Modal title="Инструкция не найдена" onClose={close}>
        <div className="modal-body">
          <p>Выберите материал через поиск или меню.</p>
          <button className="button button-primary" onClick={close}>
            Закрыть
          </button>
        </div>
      </Modal>
    );
  const checkable = checklistIds.includes(id);
  return (
    <Modal
      title={guide.title}
      eyebrow={`${guide.label} / ${guide.time}`}
      onClose={close}
      className="guide-modal"
    >
      <div className="modal-body">
        <p className="guide-lead">{guide.summary}</p>
        <div className="guide-meta">
          <Badge tone="green">
            <ShieldCheck size={13} />
            Осмысленный маршрут
          </Badge>
          <span>Редакция {RESEARCH_DATE}</span>
        </div>
        {guide.warning && (
          <Notice tone="amber" title="Важно перед началом">
            {guide.warning}
          </Notice>
        )}
        <ol className="guide-steps">
          {guide.steps.map((step, i) => (
            <li key={step.title}>
              <span className="guide-step-index mono">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
                {step.command && (
                  <CodeBlock
                    code={step.command}
                    changesSystem={step.changesSystem}
                  />
                )}
              </div>
            </li>
          ))}
        </ol>
        <div className="guide-outcomes">
          <section>
            <span className="eyebrow">
              <Check size={15} />
              КАК ПРОВЕРИТЬ
            </span>
            <p>{guide.verify}</p>
          </section>
          <section>
            <span className="eyebrow">ВОЗВРАТ НАЗАД</span>
            <p>{guide.rollback}</p>
          </section>
        </div>
        <SourceRefs ids={guide.sources} />
        <p className="fine-print">
          Редакционная последовательность на основе источников, не заводской
          профиль Infinix. Названия меню зависят от версии Windows и программ.
          Если условия не совпадают, не применяйте шаг вслепую.
        </p>
      </div>
      <div className="modal-footer">
        {checkable ? (
          <label className="guide-done">
            <input
              type="checkbox"
              checked={state.checked.includes(id)}
              onChange={() => toggleCheck(id)}
            />
            <span>Я выполнил и проверил этот шаг</span>
          </label>
        ) : (
          <span className="fine-print">
            Сайт ничего не запускает на компьютере
          </span>
        )}
        <button
          className="button button-primary"
          onClick={id === "inventory" ? () => open({ type: "device" }) : close}
        >
          {id === "inventory" ? "Заполнить паспорт" : "Готово"}
          <ArrowRight size={16} />
        </button>
      </div>
    </Modal>
  );
}

function DeviceModal({ tab: initialTab }: { tab?: "my" | "specs" }) {
  const { state, saveDevice, close, open, exportReport } = useLab();
  const [tab, setTab] = useState<"my" | "specs">(initialTab ?? "my");
  const [device, setDevice] = useState<DeviceInfo>({ ...state.device });
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof DeviceInfo>(key: K, value: DeviceInfo[K]) => {
    setDevice((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };
  const submit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const clean = {
      ...device,
      build: device.build.trim(),
      bios: device.bios.trim(),
      games: device.games.trim(),
      driver: device.driver.trim(),
      tweaks: device.tweaks.trim(),
    };
    const issue = validateDevice(clean);
    if (issue) {
      setError(issue);
      return;
    }
    saveDevice(clean);
  };
  return (
    <Modal
      title="Мой ноутбук"
      eyebrow="INFINIX XBOOK B15 / BL51A7H"
      onClose={close}
      className="device-modal"
    >
      <div className="modal-tabs" role="group" aria-label="Раздел паспорта">
        <button
          aria-pressed={tab === "my"}
          onClick={() => setTab("my")}
          className={tab === "my" ? "active" : ""}
        >
          Моя конфигурация
        </button>
        <button
          aria-pressed={tab === "specs"}
          onClick={() => setTab("specs")}
          className={tab === "specs" ? "active" : ""}
        >
          Паспорт модели
        </button>
      </div>
      {tab === "my" ? (
        <form onSubmit={submit}>
          <div className="modal-body">
            <Notice tone="blue" title="Не знаете значение? Оставьте пустым">
              Ноутбук сейчас не у вас — это нормально. Не подставляем
              предполагаемую сборку или температуру. Серийные номера и ключи
              восстановления здесь не нужны.
            </Notice>
            <fieldset className="form-section">
              <legend>Windows и оборудование</legend>
              <div className="form-grid">
                <label className="field">
                  <span>Версия Windows 11</span>
                  <select
                    value={device.version}
                    onChange={(e) =>
                      set("version", e.target.value as DeviceInfo["version"])
                    }
                  >
                    <option value="unknown">Пока не знаю</option>
                    <option value="23H2">23H2</option>
                    <option value="24H2">24H2</option>
                    <option value="25H2">25H2</option>
                    <option value="other">Другая / не знаю</option>
                  </select>
                </label>
                <label className="field">
                  <span>Редакция</span>
                  <select
                    value={device.edition}
                    onChange={(e) =>
                      set("edition", e.target.value as DeviceInfo["edition"])
                    }
                  >
                    <option value="unknown">Пока не знаю</option>
                    <option value="Home">Home</option>
                    <option value="Pro">Pro</option>
                    <option value="other">Другая</option>
                  </select>
                </label>
                <label className="field">
                  <span>Сборка из winver</span>
                  <input
                    value={device.build}
                    onChange={(e) => set("build", e.target.value)}
                    placeholder="Например, 26200.9168"
                    maxLength={12}
                    inputMode="decimal"
                    autoComplete="off"
                    aria-invalid={!!error}
                    aria-describedby={error ? "device-error" : undefined}
                  />
                </label>
                <label className="field">
                  <span>Версия BIOS</span>
                  <input
                    value={device.bios}
                    onChange={(e) => set("bios", e.target.value)}
                    placeholder="Можно заполнить позже"
                    maxLength={100}
                  />
                </label>
                <label className="field">
                  <span>Графический драйвер</span>
                  <input
                    value={device.driver}
                    onChange={(e) => set("driver", e.target.value)}
                    placeholder="Версия из свойств драйвера"
                    maxLength={100}
                  />
                </label>
                <label className="field">
                  <span>Адаптер по этикетке</span>
                  <select
                    value={device.charger}
                    onChange={(e) =>
                      set("charger", e.target.value as DeviceInfo["charger"])
                    }
                  >
                    <option value="unknown">Не проверен</option>
                    <option value="45">45 Вт</option>
                    <option value="65">65 Вт</option>
                    <option value="other">Другое значение</option>
                  </select>
                </label>
              </div>
            </fieldset>
            <fieldset className="form-section">
              <legend>Ваш сценарий</legend>
              <label className="field">
                <span>В какие игры играете?</span>
                <input
                  value={device.games}
                  onChange={(e) => set("games", e.target.value)}
                  placeholder="Названия игр — когда будете знать"
                  maxLength={300}
                />
              </label>
              <label className="field">
                <span>Какие изменения уже вносились?</span>
                <textarea
                  value={device.tweaks}
                  onChange={(e) => set("tweaks", e.target.value)}
                  rows={4}
                  maxLength={1000}
                />
              </label>
            </fieldset>
            {error && <FormError id="device-error" message={error} />}
            <p className="fine-print">
              <Info size={14} />
              Данные остаются в этом браузере. Сайт не диагностирует ноутбук
              автоматически.
            </p>
            <div className="data-actions">
              <button
                type="button"
                className="text-button"
                onClick={exportReport}
              >
                <Download size={15} />
                Скачать мои данные
              </button>
              <button
                type="button"
                className="text-button danger-text"
                onClick={() => open({ type: "reset" })}
              >
                <Trash2 size={14} />
                Удалить локальные данные
              </button>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="text-button"
              onClick={() => open({ type: "guide", id: "inventory" })}
            >
              Где посмотреть значения?
              <ArrowUpRight size={15} />
            </button>
            <button type="submit" className="button button-primary">
              Сохранить паспорт
              <Check size={17} />
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="modal-body">
            <div className="passport-model">
              <Laptop size={31} strokeWidth={1.5} />
              <div>
                <h3>Infinix XBOOK B15 BL51A7H</h3>
                <span className="mono">Код производителя: 71005000295</span>
              </div>
              <Badge tone="green">AMD 7535HS</Badge>
            </div>
            <p className="fine-print">
              Характеристики из документации AMD и карточек именно этого SKU. Не
              считываются с вашего ноутбука. Другие варианты B15 могут
              отличаться.
            </p>
            {hardwareGroups.map((group) => (
              <section className="hardware-group" key={group.title}>
                <h3>{group.title}</h3>
                <dl>
                  {group.rows.map(([name, value, source]) => (
                    <div key={name}>
                      <dt>{name}</dt>
                      <dd>
                        {value}
                        <SourceRefs compact ids={[source]} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))}
            <div className="hardware-unknown">
              <h3>Нужно проверить отдельно</h3>
              {unknownHardware.map((item) => (
                <div key={item.title}>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
            <Notice
              tone="neutral"
              title="Что рекламное описание не гарантирует"
            >
              16 ГБ не гарантируют отсутствие зависаний в любых программах. «50
              фильмов» зависит от размера файлов. Kensington — возможность
              физического крепления, а не абсолютная защита от кражи. Скорость
              зарядки требует проверки условий и адаптера; чужой рекламный замер
              не переносится на ваш экземпляр.
            </Notice>
          </div>
          <div className="modal-footer">
            <span className="fine-print">Проверено {RESEARCH_DATE}</span>
            <button
              className="button button-primary"
              onClick={() => setTab("my")}
            >
              Моя конфигурация
              <ArrowRight size={16} />
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}

type MeasurementDraft = {
  [
    K in
      | "game"
      | "scene"
      | "resolution"
      | "notes"
      | "ambient"
      | "minutes"
      | "avg"
      | "low"
      | "cpu"
      | "gpu"
  ]: string;
} & Pick<Measurement, "stage" | "profile" | "power" | "cooling" | "noise">;
function MeasurementModal({ id }: { id?: string }) {
  const { state, close, saveMeasurement } = useLab();
  const existing = state.measurements.find((m) => m.id === id);
  const [draft, setDraft] = useState<MeasurementDraft>(() => ({
    game: existing?.game ?? "",
    scene: existing?.scene ?? "",
    stage: existing?.stage ?? "before",
    profile: existing?.profile ?? "baseline",
    resolution: existing?.resolution ?? "1920 × 1080",
    power: existing?.power ?? "mains",
    cooling: existing?.cooling ?? state.cooling,
    ambient: existing?.ambient?.toString() ?? "",
    minutes: existing?.minutes?.toString() ?? "15",
    avg: existing?.avg?.toString() ?? "",
    low: existing?.low?.toString() ?? "",
    cpu: existing?.cpu?.toString() ?? "",
    gpu: existing?.gpu?.toString() ?? "",
    noise: existing?.noise ?? "unknown",
    notes: existing?.notes ?? "",
  }));
  const [error, setError] = useState("");
  const set = <K extends keyof MeasurementDraft>(
    key: K,
    value: MeasurementDraft[K],
  ) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setError("");
  };
  const submit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nullable = (s: string) =>
      s.trim() === "" ? null : Number(s.replace(",", "."));
    const result: Measurement = {
      ...draft,
      id: existing?.id ?? crypto.randomUUID(),
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      game: draft.game.trim(),
      scene: draft.scene.trim(),
      resolution: draft.resolution.trim(),
      notes: draft.notes.trim(),
      ambient: nullable(draft.ambient),
      minutes: Number(draft.minutes),
      avg: Number(draft.avg),
      low: nullable(draft.low),
      cpu: nullable(draft.cpu),
      gpu: nullable(draft.gpu),
    };
    if (result.low !== null && result.low > result.avg) {
      setError(
        "1% low не должен превышать средний FPS. Проверьте, что сравниваете показатели одной записи.",
      );
      return;
    }
    if (!isMeasurement(result)) {
      setError(
        "Проверьте игру, сцену и числовые значения. FPS должен быть больше нуля; неизвестные показатели оставьте пустыми.",
      );
      return;
    }
    saveMeasurement(result);
  };
  return (
    <Modal
      title={existing ? "Редактировать замер" : "Новый игровой замер"}
      eyebrow="РУЧНОЙ ВВОД / НИЧЕГО НЕ СЧИТЫВАЕТСЯ"
      onClose={close}
      className="measurement-modal"
    >
      <form onSubmit={submit}>
        <div className="modal-body">
          <div className="form-grid">
            <label className="field">
              <span>
                Игра <small>обязательно</small>
              </span>
              <input
                value={draft.game}
                onChange={(e) => set("game", e.target.value)}
                placeholder="Название игры"
                required
                maxLength={100}
                data-autofocus=""
              />
            </label>
            <label className="field">
              <span>Этап</span>
              <select
                value={draft.stage}
                onChange={(e) =>
                  set("stage", e.target.value as Measurement["stage"])
                }
              >
                <option value="before">До настройки</option>
                <option value="after">После настройки</option>
              </select>
            </label>
            <label className="field field-full">
              <span>
                Сцена и графические настройки <small>обязательно</small>
              </span>
              <input
                value={draft.scene}
                onChange={(e) => set("scene", e.target.value)}
                placeholder="Например: встроенный тест, низкие настройки"
                required
                maxLength={150}
              />
            </label>
            <label className="field">
              <span>Профиль в этом тесте</span>
              <select
                value={draft.profile}
                onChange={(e) =>
                  set("profile", e.target.value as Measurement["profile"])
                }
              >
                <option value="baseline">Исходная конфигурация</option>
                {profilePresets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Разрешение</span>
              <input
                value={draft.resolution}
                onChange={(e) => set("resolution", e.target.value)}
                required
                maxLength={50}
              />
            </label>
          </div>
          <fieldset className="form-section">
            <legend>Условия теста</legend>
            <div className="form-grid">
              <label className="field">
                <span>Питание</span>
                <select
                  value={draft.power}
                  onChange={(e) =>
                    set("power", e.target.value as Measurement["power"])
                  }
                >
                  <option value="mains">От сети</option>
                  <option value="battery">От батареи</option>
                </select>
              </label>
              <label className="field">
                <span>Режим X6</span>
                <select
                  value={draft.cooling}
                  onChange={(e) =>
                    set("cooling", e.target.value as CoolingMode)
                  }
                >
                  {Object.entries(coolingLabels).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Длительность, мин</span>
                <input
                  type="number"
                  value={draft.minutes}
                  onChange={(e) => set("minutes", e.target.value)}
                  required
                  min="1"
                  max="240"
                  step="1"
                />
              </label>
              <label className="field">
                <span>В комнате, °C</span>
                <input
                  type="number"
                  value={draft.ambient}
                  onChange={(e) => set("ambient", e.target.value)}
                  min="0"
                  max="50"
                  step="0.1"
                  placeholder="Не измерено"
                />
              </label>
            </div>
          </fieldset>
          <fieldset className="form-section">
            <legend>Измеренные показатели</legend>
            <p className="fine-print">
              Пустое поле = не измерено. Все температуры — максимумы за одну и
              ту же игровую сессию.
            </p>
            <div className="form-grid">
              <label className="field">
                <span>
                  Средний FPS <small>обязательно</small>
                </span>
                <input
                  type="number"
                  value={draft.avg}
                  onChange={(e) => set("avg", e.target.value)}
                  min="0.1"
                  max="2000"
                  step="0.1"
                  required
                  placeholder="Результат теста"
                />
              </label>
              <label className="field">
                <span>1% low, FPS</span>
                <input
                  type="number"
                  value={draft.low}
                  onChange={(e) => set("low", e.target.value)}
                  min="0.1"
                  max="2000"
                  step="0.1"
                  placeholder="Не измерено"
                />
              </label>
              <label className="field">
                <span>CPU максимум, °C</span>
                <input
                  type="number"
                  value={draft.cpu}
                  onChange={(e) => set("cpu", e.target.value)}
                  min="1"
                  max="120"
                  step="0.1"
                  placeholder="Не измерено"
                />
              </label>
              <label className="field">
                <span>GPU максимум, °C</span>
                <input
                  type="number"
                  value={draft.gpu}
                  onChange={(e) => set("gpu", e.target.value)}
                  min="1"
                  max="120"
                  step="0.1"
                  placeholder="Не измерено"
                />
              </label>
              <label className="field">
                <span>Шум по ощущениям</span>
                <select
                  value={draft.noise}
                  onChange={(e) =>
                    set("noise", e.target.value as Measurement["noise"])
                  }
                >
                  <option value="unknown">Не оценивал</option>
                  <option value="quiet">Тихо</option>
                  <option value="audible">Слышно, приемлемо</option>
                  <option value="loud">Громко</option>
                </select>
              </label>
            </div>
          </fieldset>
          {draft.cpu !== "" && Number(draft.cpu) >= 95 && (
            <Notice tone="amber" title="Значение на уровне или выше Tjmax CPU">
              95 °C — предел процессора по AMD, не цель. Перепроверьте датчик и
              единицы. При устойчивом упоре в предел, троттлинге или сбоях
              прекратите нагрузку и разберитесь с охлаждением.{" "}
              <SourceRefs compact ids={["amd-chip"]} />
            </Notice>
          )}
          <label className="field">
            <span>Что изменили / примечание</span>
            <textarea
              value={draft.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={3}
              maxLength={1000}
              placeholder="Измеритель и его версия, изменённый параметр, особенности теста"
            />
          </label>
          {error && <FormError message={error} />}
        </div>
        <div className="modal-footer">
          <span className="fine-print">
            Проверьте условия: значения по умолчанию не являются замером.
          </span>
          <button className="button button-primary" type="submit">
            Сохранить замер
            <Check size={17} />
          </button>
        </div>
      </form>
    </Modal>
  );
}

function SearchModal() {
  const { close, navigate, open } = useLab();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const entries = useMemo(
    () => [
      ...pages.map((p) => ({
        type: "page" as const,
        id: p.id,
        title: p.title,
        subtitle: "Раздел справочника",
        text: `${p.title} ${p.keywords}`,
      })),
      ...guides.map((g) => ({
        type: "guide" as const,
        id: g.id,
        title: g.title,
        subtitle: `${g.label} · ${g.time}`,
        text: `${g.title} ${g.summary} ${g.steps.map((s) => `${s.title} ${s.text} ${s.command ?? ""}`).join(" ")}`,
      })),
    ],
    [],
  );
  const normalized = query.trim().toLocaleLowerCase("ru").replaceAll("ё", "е");
  const results = normalized
    ? entries
        .filter((entry) =>
          normalized
            .split(/\s+/)
            .every((term) =>
              entry.text
                .toLocaleLowerCase("ru")
                .replaceAll("ё", "е")
                .includes(term),
            ),
        )
        .sort(
          (a, b) =>
            Number(b.title.toLocaleLowerCase("ru").includes(normalized)) -
            Number(a.title.toLocaleLowerCase("ru").includes(normalized)),
        )
    : entries.filter((e) => e.type === "page").slice(0, 7);
  const choose = (index: number) => {
    const item = results[index];
    if (!item) return;
    if (item.type === "page") navigate(item.id as PageId);
    else open({ type: "guide", id: item.id });
  };
  return (
    <Modal title="Найти настройку" onClose={close} className="search-modal">
      <div className="search-box">
        <Search size={21} />
        <input
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls="search-results"
          aria-autocomplete="list"
          aria-activedescendant={
            results.length
              ? `search-result-${Math.min(active, results.length - 1)}`
              : undefined
          }
          data-autofocus=""
          aria-label="Поиск по справочнику"
          placeholder="Windows, нагрев, Process Lasso…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown" && results.length) {
              e.preventDefault();
              const next = (active + 1) % results.length;
              setActive(next);
              document
                .getElementById(`search-result-${next}`)
                ?.scrollIntoView({ block: "nearest" });
            }
            if (e.key === "ArrowUp" && results.length) {
              e.preventDefault();
              const next = (active - 1 + results.length) % results.length;
              setActive(next);
              document
                .getElementById(`search-result-${next}`)
                ?.scrollIntoView({ block: "nearest" });
            }
            if (e.key === "Enter") {
              e.preventDefault();
              choose(active);
            }
          }}
        />
        <kbd>Esc</kbd>
      </div>
      <div className="search-results-heading" aria-live="polite">
        {normalized ? `Найдено: ${results.length}` : "Быстрый переход"}
      </div>
      <div
        className="search-results"
        id="search-results"
        role="listbox"
        aria-label="Результаты поиска"
      >
        {results.map((r, i) => (
          <button
            type="button"
            id={`search-result-${i}`}
            key={`${r.type}-${r.id}`}
            role="option"
            aria-selected={i === active}
            tabIndex={-1}
            className={i === active ? "active" : ""}
            onMouseEnter={() => setActive(i)}
            onClick={() => choose(i)}
          >
            {r.type === "guide" ? <FileText size={19} /> : <Search size={18} />}
            <span>
              <strong>{r.title}</strong>
              <span>{r.subtitle}</span>
            </span>
            <ArrowUpRight size={16} />
          </button>
        ))}
      </div>
      {!results.length && (
        <EmptyState
          icon={<Search size={25} />}
          title="Ничего не найдено"
          description="Попробуйте «питание», «Windows 10», «FPS» или название программы."
        />
      )}
      <div className="search-help">
        <span>
          <kbd>↑</kbd>
          <kbd>↓</kbd>выбрать
        </span>
        <span>
          <kbd>Enter</kbd>открыть
        </span>
        <span>
          <kbd>Esc</kbd>закрыть
        </span>
      </div>
    </Modal>
  );
}

export default function ModalHost({ modal }: { modal: ModalState }) {
  const { close, resetData, deleteMeasurement, exportReport, navigate, state } =
    useLab();
  if (!modal) return null;
  if (modal.type === "guide")
    return <GuideModal key={modal.id} id={modal.id} />;
  if (modal.type === "device") return <DeviceModal tab={modal.tab} />;
  if (modal.type === "measurement") return <MeasurementModal id={modal.id} />;
  if (modal.type === "search") return <SearchModal />;
  if (modal.type === "mobile-nav")
    return (
      <Modal
        title="Разделы справочника"
        onClose={close}
        className="mobile-navigation"
      >
        <nav aria-label="Мобильная навигация" className="mobile-nav-links">
          {pages.map((p) => (
            <a
              key={p.id}
              href={`#/${p.id}`}
              onClick={(e) => {
                e.preventDefault();
                navigate(p.id);
              }}
            >
              <p.icon size={20} />
              <span>{p.title}</span>
              <ChevronRight size={16} />
            </a>
          ))}
        </nav>
        <div className="mobile-nav-note">
          <ShieldCheck size={17} />
          Личный гид. Без автоматических твиков.
        </div>
      </Modal>
    );
  if (modal.type === "reset")
    return (
      <Modal
        title="Удалить локальные данные?"
        eyebrow="ТОЛЬКО ДАННЫЕ ЭТОГО САЙТА"
        onClose={close}
        className="confirm-modal"
      >
        <div className="modal-body">
          <Notice tone="amber">
            Будут удалены ваш паспорт, выбранный профиль, отметки и{" "}
            {state.measurements.length} замеров в этом браузере. Отменить
            удаление нельзя. Настройки Windows и файлы ноутбука не
            затрагиваются.
          </Notice>
          <button className="text-button" onClick={exportReport}>
            <Download size={16} />
            Сначала скачать отчёт
          </button>
        </div>
        <div className="modal-footer">
          <button className="button button-secondary" onClick={close}>
            Отмена
          </button>
          <button className="button button-danger" onClick={resetData}>
            Удалить данные сайта
            <Trash2 size={16} />
          </button>
        </div>
      </Modal>
    );
  return (
    <Modal
      title="Удалить этот замер?"
      onClose={close}
      className="confirm-modal"
    >
      <div className="modal-body">
        <p>
          Запись «
          {state.measurements.find((m) => m.id === modal.id)?.game ?? "Замер"}»
          будет удалена из этого браузера. Это действие нельзя отменить.
        </p>
      </div>
      <div className="modal-footer">
        <button className="button button-secondary" onClick={close}>
          Отмена
        </button>
        <button
          className="button button-danger"
          onClick={() => deleteMeasurement(modal.id)}
        >
          Удалить замер
          <Trash2 size={16} />
        </button>
      </div>
    </Modal>
  );
}
