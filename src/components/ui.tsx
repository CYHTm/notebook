import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  Copy,
  Info,
  ShieldCheck,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { getSource } from "../data/sources";
import { getGuide } from "../data/guides";
import { useLab } from "../lib/context";

export function SourceRefs({
  ids,
  compact = false,
}: {
  ids: string[];
  compact?: boolean;
}) {
  return (
    <span className={`source-refs ${compact ? "compact" : ""}`}>
      {!compact && <span className="source-prefix">Источники</span>}
      {ids.map((id) => {
        const s = getSource(id);
        return (
          <a
            key={id}
            href={s.url}
            target="_blank"
            rel="noreferrer"
            title={`${s.publisher}: ${s.title}`}
            aria-label={`${s.publisher}: ${s.title} (откроется в новой вкладке)`}
          >
            {s.publisher} <span>[{s.ref}]</span>
            <ArrowUpRight size={11} aria-hidden="true" />
          </a>
        );
      })}
    </span>
  );
}

export function Badge({
  children,
  tone = "neutral",
  dot = false,
}: {
  children: ReactNode;
  tone?: "neutral" | "green" | "amber" | "blue";
  dot?: boolean;
}) {
  return (
    <span className={`badge badge-${tone}`}>
      {dot && <span className="status-dot" aria-hidden="true" />}
      {children}
    </span>
  );
}

export function PageHeading({
  index,
  eyebrow,
  title,
  description,
  action,
}: {
  index: string;
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="eyebrow">
          <span>{index}</span>
          <span className="eyebrow-line" />
          {eyebrow}
        </div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}

export function Notice({
  title,
  children,
  tone = "neutral",
  icon,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  tone?: "neutral" | "green" | "amber" | "blue";
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={`notice notice-${tone} ${className}`}>
      <span className="notice-icon">{icon ?? <Info size={20} />}</span>
      <div>
        {title && <strong>{title}</strong>}
        <div className="notice-text">{children}</div>
      </div>
    </div>
  );
}

export function GuideLink({
  id,
  number,
  showTime = true,
}: {
  id: string;
  number?: string;
  showTime?: boolean;
}) {
  const { open, state } = useLab();
  const guide = getGuide(id);
  if (!guide) return null;
  return (
    <button
      className="guide-link group"
      onClick={() => open({ type: "guide", id })}
    >
      {number && (
        <span
          className={`guide-number ${state.checked.includes(id) ? "is-done" : ""}`}
        >
          {state.checked.includes(id) ? <Check size={17} /> : number}
        </span>
      )}
      <span className="guide-link-text">
        <strong>{guide.title}</strong>
        <span>
          {guide.label}
          {showTime && ` · ${guide.time}`}
        </span>
      </span>
      <ArrowUpRight className="guide-arrow" size={19} aria-hidden="true" />
    </button>
  );
}

export function ChecklistRow({ id, index }: { id: string; index: number }) {
  const { state, toggleCheck, open } = useLab();
  const g = getGuide(id);
  if (!g) return null;
  const checked = state.checked.includes(id);
  return (
    <div className={`checklist-row ${checked ? "completed" : ""}`}>
      <label className="check-control">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => toggleCheck(id)}
          aria-label={`Отметить выполненным: ${g.title}`}
        />
        <span>{checked && <Check size={15} />}</span>
      </label>
      <span className="checklist-index">
        {String(index + 1).padStart(2, "0")}
      </span>
      <button
        className="checklist-body"
        onClick={() => open({ type: "guide", id })}
      >
        <strong>{g.title}</strong>
        <span>{g.summary}</span>
      </button>
      <span className="checklist-time">{g.time}</span>
      <button
        className="icon-button"
        aria-label={`Открыть инструкцию: ${g.title}`}
        onClick={() => open({ type: "guide", id })}
      >
        <ArrowUpRight size={19} />
      </button>
    </div>
  );
}

export function Accordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(defaultOpen);
  const id = useId();
  return (
    <div className={`accordion ${expanded ? "expanded" : ""}`}>
      <h3>
        <button
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-controls={id}
        >
          {title}
          <ChevronDown size={18} />
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            id={id}
            initial={reducedMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.2 }}
            className="accordion-content"
          >
            <div>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Modal({
  title,
  children,
  onClose,
  className = "",
  eyebrow,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  className?: string;
  eyebrow?: string;
}) {
  const reducedMotion = useReducedMotion();
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const before = document.activeElement as HTMLElement | null;
    const oldOverflow = document.body.style.overflow;
    dialog?.showModal();
    // React autoFocus runs before a native dialog is opened. Focus explicitly
    // after showModal so keyboard search and the first form field work.
    dialog?.querySelector<HTMLElement>("[data-autofocus]")?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      dialog?.close();
      document.body.style.overflow = oldOverflow;
      if (before?.isConnected) before.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal ${className}`}
      aria-labelledby="modal-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <motion.div
        className="modal-shell"
        initial={reducedMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reducedMotion ? 0 : 0.2 }}
      >
        <div className="modal-top">
          <div>
            {eyebrow && <div className="eyebrow">{eyebrow}</div>}
            <h2 id="modal-title">{title}</h2>
          </div>
          <button
            className="icon-button modal-close"
            onClick={onClose}
            aria-label="Закрыть окно"
          >
            <X size={22} />
          </button>
        </div>
        {children}
      </motion.div>
    </dialog>
  );
}

export function CodeBlock({
  code,
  changesSystem = false,
}: {
  code: string;
  changesSystem?: boolean;
}) {
  const { toast } = useLab();
  const [copied, setCopied] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const codeRef = useRef<HTMLElement>(null);
  useEffect(
    () => () => {
      if (timeout.current) clearTimeout(timeout.current);
    },
    [],
  );
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast("Команда скопирована. Ничего не запущено.");
      if (timeout.current) clearTimeout(timeout.current);
      timeout.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      if (codeRef.current) {
        const range = document.createRange();
        range.selectNodeContents(codeRef.current);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
      toast("Буфер обмена недоступен. Текст выделен — скопируйте его вручную.");
    }
  };
  return (
    <div className="code-block">
      <div className="code-caption">
        <span>
          {changesSystem
            ? "Изменяет систему · администратор"
            : "Просмотр · ничего не сбрасывает"}
        </span>
        <button onClick={copy} aria-label={`Скопировать команду ${code}`}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
          {copied ? "Скопировано" : "Копировать"}
        </button>
      </div>
      <pre>
        <code ref={codeRef}>{code}</code>
      </pre>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">{icon}</span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function SafetyFootnote() {
  return (
    <div className="safety-footnote">
      <ShieldCheck size={15} />
      <span>Никаких автоматических твиков. Вы решаете, что менять.</span>
    </div>
  );
}
