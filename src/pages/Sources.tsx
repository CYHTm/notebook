import { useMemo, useState } from "react";
import { ArrowUpRight, BookOpen, Search, ShieldCheck } from "lucide-react";
import { Badge, EmptyState, Notice, PageHeading } from "../components/ui";
import { RESEARCH_DATE, sources } from "../data/sources";
import { unknownHardware } from "../data/hardware";

export default function SourcesPage() {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const filtered = useMemo(
    () =>
      sources.filter(
        (s) =>
          (kind === "all" || s.kind === kind) &&
          `${s.publisher} ${s.title} ${s.scope}`
            .toLocaleLowerCase("ru")
            .includes(query.toLocaleLowerCase("ru")),
      ),
    [query, kind],
  );
  return (
    <>
      <PageHeading
        index="07"
        eyebrow="ИСТОЧНИКИ И МЕТОД"
        title="У каждой рекомендации — основание."
        description="Документация важнее обещаний оптимизатора. Здесь указано, что проверено, где есть расхождения и каких данных пока не хватает."
        action={
          <Badge tone="green">
            <ShieldCheck size={14} />
            Проверено {RESEARCH_DATE}
          </Badge>
        }
      />
      <div className="source-method">
        <div>
          <strong>{sources.filter((s) => s.kind === "primary").length}</strong>
          <span>официальных источников</span>
        </div>
        <div>
          <strong>{sources.filter((s) => s.kind === "retailer").length}</strong>
          <span>карточки продавцов</span>
        </div>
        <div>
          <strong>0</strong>
          <span>выдуманных замеров</span>
        </div>
        <p>
          Дата означает проверку редакции справочника, а не подключение к
          серверам обновлений в реальном времени.
        </p>
      </div>
      <Notice tone="blue" title="Три разных уровня данных">
        Факты документации сопровождаются ссылками. Игровые профили —
        редакционные отправные точки для теста, не готовые заводские режимы.
        Ваши сведения и замеры вводятся вручную и не считаются независимым
        подтверждением спецификации.
      </Notice>
      <div className="source-controls">
        <label className="source-search">
          <Search size={17} />
          <span className="sr-only">Поиск источников</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Название, производитель или тема"
            type="search"
          />
        </label>
        <div className="filter-buttons" role="group" aria-label="Тип источника">
          {[
            { id: "all", text: "Все" },
            { id: "primary", text: "Официальные" },
            { id: "retailer", text: "Продавцы" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setKind(item.id)}
              aria-pressed={kind === item.id}
              className={kind === item.id ? "active" : ""}
            >
              {item.text}
            </button>
          ))}
        </div>
      </div>
      <div className="sources-list">
        {filtered.map((source) => (
          <article className="source-row" key={source.id}>
            <div className="source-publisher">
              <span className="source-initial">
                {source.publisher.charAt(0)}
              </span>
              <div>
                <strong>{source.publisher}</strong>
                <span>
                  {source.kind === "primary"
                    ? "Официальный источник"
                    : "Карточка продавца"}
                </span>
              </div>
            </div>
            <div className="source-description">
              <h2>
                <a href={source.url} target="_blank" rel="noreferrer">
                  {source.title} <span>[{source.ref}]</span>
                  <ArrowUpRight size={17} />
                </a>
              </h2>
              <p>{source.scope}</p>
            </div>
          </article>
        ))}
      </div>
      {!filtered.length && (
        <EmptyState
          icon={<BookOpen size={25} />}
          title="Совпадений нет"
          description="Попробуйте название производителя или более короткий запрос."
          action={
            <button
              className="button button-secondary"
              onClick={() => {
                setQuery("");
                setKind("all");
              }}
            >
              Показать все источники
            </button>
          }
        />
      )}
      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow">ЧЕСТНО ОБ ОГРАНИЧЕНИЯХ</span>
            <h2>Что пока не подтверждено</h2>
          </div>
        </div>
        <div className="unknown-grid">
          {unknownHardware.map((item, i) => (
            <article key={item.title}>
              <span className="mono">0{i + 1}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="editorial-aside">
        <span className="eyebrow">О ПРОЕКТЕ</span>
        <p>
          XBOOK LAB — независимый справочник, не официальный сайт Infinix.
          Иллюстрация ноутбука создана с помощью AI и не является фотографией
          модели или доказательством расположения портов. Схема X6 условная, не
          инженерный чертёж. Нет телеметрии, регистрации и отправки личных
          замеров на сервер.
        </p>
        <p className="fine-print">
          Материалы и версии проверены на {RESEARCH_DATE}. Ссылки ведут на
          внешние сайты, где действуют их собственные правила. Справочник не
          обновляется автоматически: перед системными изменениями перепроверьте
          официальный источник.
        </p>
      </section>
    </>
  );
}
