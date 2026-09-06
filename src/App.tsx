import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  ArrowUpRight,
  Asterisk,
  Check,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  Download,
  Laptop,
  Menu,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { LabContext } from "./lib/context";
import type { LabContextValue, ModalState, PageId } from "./lib/context";
import {
  downloadText,
  initialState,
  isMeasurement,
  makeReport,
  parseStoredState,
  STORAGE_KEY,
} from "./lib/state";
import type { LabState } from "./lib/state";
import { checklistIds } from "./data/guides";
import { RESEARCH_DATE } from "./data/sources";
import { pageFromHash, pages } from "./lib/routes";
import { Notice } from "./components/ui";
import Overview from "./pages/Overview";

const Recovery = lazy(() => import("./pages/Recovery"));
const WindowsPage = lazy(() => import("./pages/Windows"));
const Profiles = lazy(() => import("./pages/Profiles"));
const Cooling = lazy(() => import("./pages/Cooling"));
const Lasso = lazy(() => import("./pages/Lasso"));
const Journal = lazy(() => import("./pages/Journal"));
const Sources = lazy(() => import("./pages/Sources"));
const ModalHost = lazy(() => import("./components/Modals"));

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el && typeof el.showPopover === "function") el.showPopover();
  }, [message]);
  return (
    <div
      ref={ref}
      popover="manual"
      className="toast"
      role="status"
      aria-live="polite"
    >
      <span className="toast-icon">
        <Check size={15} />
      </span>
      <span>{message}</span>
      <button aria-label="Скрыть уведомление" onClick={onClose}>
        <X size={15} />
      </button>
    </div>
  );
}

function App() {
  const reducedMotion = useReducedMotion();
  const [loaded] = useState(() => {
    try {
      return parseStoredState(localStorage.getItem(STORAGE_KEY));
    } catch {
      return {
        state: initialState(),
        issue:
          "Браузер запретил локальное хранение. Работа доступна, но изменения сохранятся только до закрытия страницы. Скачайте отчёт.",
      };
    }
  });
  const [state, setState] = useState<LabState>(loaded.state);
  const [storageIssue, setStorageIssue] = useState<string | null>(loaded.issue);
  const [canPersist, setCanPersist] = useState(!loaded.issue);
  const [page, setPage] = useState<PageId>(() =>
    pageFromHash(window.location.hash),
  );
  const [modal, setModal] = useState<ModalState>(null);
  const [message, setMessage] = useState("");
  const [resetRevision, setResetRevision] = useState(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mainRef = useRef<HTMLElement>(null);
  const firstPage = useRef(true);
  const toast = useCallback((text: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setMessage(text);
    toastTimer.current = setTimeout(() => setMessage(""), 5000);
  }, []);
  const navigate = useCallback((next: PageId) => {
    setModal(null);
    window.location.hash = `/${next}`;
    if (pageFromHash(window.location.hash) === next) setPage(next);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);
  useEffect(() => {
    if (!canPersist) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      setStorageIssue(
        "Не удалось сохранить изменения в браузере. Они остаются в памяти до закрытия страницы. Скачайте отчёт, чтобы не потерять данные.",
      );
      setCanPersist(false);
    }
  }, [state, canPersist]);
  useEffect(() => {
    const hashChange = () => {
      setPage(pageFromHash(window.location.hash));
      setModal(null);
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    const keys = (e: KeyboardEvent) => {
      const element = e.target as HTMLElement;
      const typing =
        ["INPUT", "TEXTAREA", "SELECT"].includes(element.tagName) ||
        element.isContentEditable;
      if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") ||
        (!typing && e.key === "/" && !e.ctrlKey && !e.altKey && !e.metaKey)
      ) {
        e.preventDefault();
        setModal({ type: "search" });
      }
    };
    window.addEventListener("hashchange", hashChange);
    window.addEventListener("keydown", keys);
    return () => {
      window.removeEventListener("hashchange", hashChange);
      window.removeEventListener("keydown", keys);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);
  useEffect(() => {
    document.title = `${pages.find((p) => p.id === page)?.title ?? "Обзор"} — XBOOK LAB`;
    if (firstPage.current) firstPage.current = false;
    else mainRef.current?.focus({ preventScroll: true });
  }, [page]);
  const exportReport = () => {
    downloadText("xbook-lab-report.txt", makeReport(state));
    toast("Отчёт подготовлен. В нём только ваши данные и ссылки на источники.");
  };
  const exportOriginal = () => {
    try {
      const original = localStorage.getItem(STORAGE_KEY);
      if (original === null) {
        toast(
          "В хранилище нет исходной записи. Можно скачать отчёт текущего сеанса.",
        );
        return;
      }
      downloadText("xbook-lab-original.txt", original);
      toast("Исходная локальная запись выгружена без изменений.");
    } catch {
      toast(
        "Браузер не дал прочитать хранилище. Можно скачать отчёт текущего сеанса.",
      );
    }
  };
  const context: LabContextValue = {
    state,
    canPersist,
    page,
    navigate,
    toast,
    open: setModal,
    close: () => setModal(null),
    exportReport,
    toggleCheck: (id) => {
      if (!checklistIds.includes(id)) return;
      setState((prev) => ({
        ...prev,
        checked: prev.checked.includes(id)
          ? prev.checked.filter((x) => x !== id)
          : [...prev.checked, id],
      }));
    },
    saveDevice: (device) => {
      setState((prev) => ({ ...prev, device }));
      setModal(null);
      toast("Паспорт обновлён. Настройки Windows не изменялись.");
    },
    saveProfile: (id, fps) => {
      setState((prev) => ({ ...prev, profile: { id, fps } }));
      toast("План обновлён. Настройки игры и Windows нужно изменить вручную.");
    },
    saveMeasurement: (measurement) => {
      if (!isMeasurement(measurement)) {
        toast("Замер не сохранён: проверьте значения.");
        return;
      }
      if (
        state.measurements.length >= 200 &&
        !state.measurements.some((m) => m.id === measurement.id)
      ) {
        toast(
          "Достигнут лимит 200 записей. Скачайте отчёт и удалите ненужные замеры.",
        );
        return;
      }
      setState((prev) => ({
        ...prev,
        measurements: prev.measurements.some((m) => m.id === measurement.id)
          ? prev.measurements.map((m) =>
              m.id === measurement.id ? measurement : m,
            )
          : [...prev.measurements, measurement],
      }));
      setModal(null);
      toast("Ручная запись обновлена в журнале.");
    },
    deleteMeasurement: (id) => {
      setState((prev) => ({
        ...prev,
        measurements: prev.measurements.filter((m) => m.id !== id),
      }));
      setModal(null);
      toast("Замер удалён из журнала.");
    },
    setCooling: (cooling) => setState((prev) => ({ ...prev, cooling })),
    resetData: () => {
      try {
        localStorage.removeItem(STORAGE_KEY);
        setCanPersist(true);
        setStorageIssue(null);
        toast("Личные данные сайта очищены. Настройки ноутбука не затронуты.");
      } catch {
        setCanPersist(false);
        setStorageIssue(
          "Браузер не разрешил удалить локальную запись. Она могла сохраниться. Для полного удаления используйте настройки данных этого сайта в браузере.",
        );
        toast(
          "Очищена только память текущей страницы. Локальное удаление не подтверждено.",
        );
      }
      setState(initialState());
      setResetRevision((revision) => revision + 1);
      setModal(null);
    },
  };
  const currentPage = pages.find((p) => p.id === page)!;
  const Page = {
    overview: Overview,
    recovery: Recovery,
    windows: WindowsPage,
    profiles: Profiles,
    cooling: Cooling,
    lasso: Lasso,
    journal: Journal,
    sources: Sources,
  }[page];
  return (
    <MotionConfig reducedMotion="user">
      <LabContext.Provider value={context}>
        <a
          className="skip-link"
          href="#main-content"
          onClick={(e) => {
            e.preventDefault();
            mainRef.current?.focus();
            mainRef.current?.scrollIntoView();
          }}
        >
          К содержимому
        </a>
        <aside className="sidebar">
          <a
            href="#/overview"
            className="brand"
            aria-label="XBOOK LAB — главная"
          >
            <span className="brand-icon">
              <Asterisk size={27} strokeWidth={1.7} />
            </span>
            <span>
              XBOOK<span className="brand-lab">LAB</span>
            </span>
          </a>
          <div className="sidebar-content">
            <button
              className="device-switcher"
              onClick={() => setModal({ type: "device" })}
            >
              <span className="device-icon">
                <Laptop size={22} strokeWidth={1.4} />
              </span>
              <span>
                <strong>Infinix XBOOK B15</strong>
                <span>BL51A7H · AMD Ryzen 5</span>
              </span>
              <ChevronDown size={14} />
            </button>
            <span className="nav-label">ВАШ СПРАВОЧНИК</span>
            <nav className="primary-nav" aria-label="Основная навигация">
              {pages
                .filter((p) => p.id !== "sources")
                .map((p) => (
                  <a
                    href={`#/${p.id}`}
                    key={p.id}
                    className={page === p.id ? "active" : ""}
                    aria-current={page === p.id ? "page" : undefined}
                  >
                    <p.icon size={19} strokeWidth={1.6} />
                    <span>{p.title}</span>
                    {page === p.id && <span className="nav-current-dot" />}
                    {p.id === "recovery" && page !== "recovery" && (
                      <span className="nav-attention-dot" />
                    )}
                  </a>
                ))}
            </nav>
            <div className="sidebar-progress">
              <div>
                <span>Ваш прогресс</span>
                <strong className="mono">
                  {state.checked.length}
                  <span>/{checklistIds.length}</span>
                </strong>
              </div>
              <div className="mini-progress">
                <span
                  style={{
                    width: `${(state.checked.length / checklistIds.length) * 100}%`,
                  }}
                />
              </div>
              <span>Без спешки. По одному шагу.</span>
            </div>
          </div>
          <div className="sidebar-bottom">
            <a
              href="#/sources"
              className={`sidebar-source-link ${page === "sources" ? "active" : ""}`}
              aria-current={page === "sources" ? "page" : undefined}
            >
              <ShieldCheck size={18} strokeWidth={1.6} />
              Источники и метод
              <ArrowUpRight size={14} />
            </a>
            <button onClick={exportReport}>
              <Download size={17} />
              Скачать мой отчёт
            </button>
            <div className="sidebar-edition">
              <span className="status-dot" />
              <span>Редакция {RESEARCH_DATE}</span>
              <span className="mono">v.01</span>
            </div>
          </div>
        </aside>
        <div className="app-shell">
          <header className="topbar">
            <div className="topbar-left">
              <button
                className="icon-button mobile-menu-button"
                onClick={() => setModal({ type: "mobile-nav" })}
                aria-label="Открыть меню"
              >
                <Menu size={23} />
              </button>
              <span className="breadcrumb-root">Личный гид</span>
              <ChevronRight size={14} className="breadcrumb-chevron" />
              <span className="breadcrumb-current">{currentPage.title}</span>
            </div>
            <div className="topbar-right">
              <button
                className="search-trigger"
                aria-label="Найти настройку"
                onClick={() => setModal({ type: "search" })}
              >
                <Search size={16} />
                <span>Найти настройку</span>
                <kbd>Ctrl K</kbd>
              </button>
              <button
                className="verified-button"
                onClick={() => navigate("sources")}
                aria-label={`Источники проверены ${RESEARCH_DATE}`}
              >
                <CircleCheck size={15} />
                <span>{RESEARCH_DATE}</span>
              </button>
            </div>
          </header>
          <main
            className={`main-content page-${page}`}
            id="main-content"
            tabIndex={-1}
            ref={mainRef}
          >
            {storageIssue && (
              <Notice
                tone="amber"
                title="Локальное сохранение недоступно"
                className="storage-warning"
              >
                {storageIssue}{" "}
                <button className="inline-link" onClick={exportOriginal}>
                  Скачать исходную копию
                </button>
                {" · "}
                <button
                  className="inline-link"
                  onClick={() => setModal({ type: "reset" })}
                >
                  Управление данными
                </button>
              </Notice>
            )}
            <Suspense
              fallback={
                <div className="loading-section">
                  <span className="loading-dot" />
                  Открываем раздел…
                </div>
              }
            >
              <motion.div
                key={`${page}-${resetRevision}`}
                initial={reducedMotion ? false : { opacity: 0, y: 7 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reducedMotion ? 0 : 0.24 }}
              >
                <Page />
              </motion.div>
            </Suspense>
            <footer className="page-footer">
              <div>
                <Asterisk size={17} strokeWidth={1.5} />
                <span>XBOOK LAB</span>
                <span className="footer-divider" />
                Настраивать осознанно.
              </div>
              <button
                className="text-button"
                onClick={() => navigate("sources")}
              >
                Источники, не догадки
                <ArrowUpRight size={14} />
              </button>
            </footer>
          </main>
        </div>
        {modal && (
          <Suspense
            fallback={
              <div className="opening-modal" role="status">
                Открываем…
              </div>
            }
          >
            <ModalHost modal={modal} />
          </Suspense>
        )}
        <AnimatePresence>
          {message && (
            <Toast message={message} onClose={() => setMessage("")} />
          )}
        </AnimatePresence>
      </LabContext.Provider>
    </MotionConfig>
  );
}
export default App;
