import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Check,
  Copy,
  CopyCheck,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

function SealMark() {
  return (
    <span className="seal-mark" aria-hidden="true">
      <span className="seal-petal petal-one" />
      <span className="seal-petal petal-two" />
      <span className="seal-petal petal-three" />
      <span className="seal-petal petal-four" />
      <span className="seal-petal petal-five" />
      <span className="seal-petal petal-six" />
      <span className="seal-core"><KeyRound size={11} strokeWidth={2.4} /></span>
    </span>
  );
}

function KeyScene() {
  return (
    <div className="key-scene" aria-label="A luminous brass key held in a hand">
      <div className="sun-wash" />
      <div className="leaf-shadow shadow-one" />
      <div className="leaf-shadow shadow-two" />
      <div className="glass-orbit orbit-one" />
      <div className="glass-orbit orbit-two" />
      <div className="scene-caption"><span className="caption-dot" /> shared keeping</div>
      <svg className="hand-illustration" viewBox="0 0 560 660" fill="none" role="img" aria-hidden="true">
        <defs>
          <linearGradient id="skinGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#e8b994" />
            <stop offset="0.6" stopColor="#c88969" />
            <stop offset="1" stopColor="#a96752" />
          </linearGradient>
          <linearGradient id="keyGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f2d48a" />
            <stop offset="0.48" stopColor="#b99042" />
            <stop offset="1" stopColor="#7e632d" />
          </linearGradient>
          <filter id="keyGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="7" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <path d="M114 662C119 583 136 502 172 449C203 404 238 378 264 328C286 286 295 236 309 191C319 157 346 142 368 157C394 175 388 209 378 247L358 324C371 297 391 264 413 253C439 240 459 257 457 279C454 310 419 350 402 378C432 349 461 335 478 352C498 372 479 403 454 428C425 456 409 484 400 527C391 568 393 611 408 662H114Z" fill="url(#skinGradient)" />
        <path d="M278 327C287 284 301 216 315 178C325 149 346 134 366 143C390 154 392 182 384 214L354 338" stroke="#9a5c4a" strokeOpacity=".42" strokeWidth="3" />
        <path d="M354 339C368 303 393 266 414 256C431 248 446 256 447 271C449 291 423 327 398 359" stroke="#9a5c4a" strokeOpacity=".4" strokeWidth="3" />
        <path d="M398 377C425 348 454 337 471 350C487 362 476 388 450 414" stroke="#9a5c4a" strokeOpacity=".4" strokeWidth="3" />
        <path d="M176 515C234 492 284 494 343 521" stroke="#fff0db" strokeOpacity=".22" strokeWidth="6" strokeLinecap="round" />
        <g className="hero-key" filter="url(#keyGlow)">
          <circle cx="274" cy="215" r="40" fill="none" stroke="url(#keyGradient)" strokeWidth="11" />
          <circle cx="274" cy="215" r="17" fill="none" stroke="#fff0b7" strokeOpacity=".55" strokeWidth="3" />
          <path d="M303 242L414 353" stroke="url(#keyGradient)" strokeWidth="14" strokeLinecap="round" />
          <path d="M371 310L401 280L422 301L392 331L417 356L390 382L365 357" fill="url(#keyGradient)" />
          <path d="M307 246L404 343" stroke="#ffe9a9" strokeOpacity=".58" strokeWidth="2" strokeLinecap="round" />
        </g>
      </svg>
      <div className="key-label"><span className="key-label-line" /> one key, kept unique</div>
    </div>
  );
}

function formatDate(value: Date | string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value));
}

type RegistryItem = { id: number; key: string; createdAt: Date | string };
type RegistryPage = { items: RegistryItem[]; total: number; totalPages: number };

export default function Home() {
  const [keyValue, setKeyValue] = useState("");
  const [copiedKeyId, setCopiedKeyId] = useState<number | null>(null);
  const [keyPage, setKeyPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [recent, setRecent] = useState<RegistryItem[]>([]);
  const [recentTotal, setRecentTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [registryLoading, setRegistryLoading] = useState(true);
  const [isAddingKey, setIsAddingKey] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "duplicate" | "error"; text: string } | null>(null);

  const loadRegistry = useCallback(async (page: number) => {
    try {
      const [statsResponse, recentResponse] = await Promise.all([
        fetch("/api/registry?operation=stats"),
        fetch(`/api/registry?operation=recent&page=${page}&pageSize=5`),
      ]);
      if (!statsResponse.ok || !recentResponse.ok) throw new Error("The registry is unavailable right now.");
      const stats = await statsResponse.json() as { total: number };
      const pageData = await recentResponse.json() as RegistryPage;
      setTotal(stats.total);
      setRecent(pageData.items);
      setRecentTotal(pageData.total);
      setTotalPages(pageData.totalPages);
    } catch (error) {
      setNotice({ type: "error", text: error instanceof Error ? error.message : "The registry is unavailable right now." });
    } finally {
      setRegistryLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRegistry(keyPage);
  }, [keyPage, loadRegistry]);
  const keyHint = useMemo(() => {
    const trimmed = keyValue.trim();
    if (!trimmed) return "Your Nushuk key";
    return `${trimmed.length} characters`;
  }, [keyValue]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice(null);
    const normalized = keyValue.trim();
    if (normalized.length < 4) {
      setNotice({ type: "error", text: "Enter at least 4 characters to add a key." });
      return;
    }
    setIsAddingKey(true);
    void fetch("/api/registry?operation=add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: normalized }),
    })
      .then(async response => {
        const result = await response.json() as { maskedKey?: string; message?: string };
        if (!response.ok) {
          setNotice({ type: response.status === 409 ? "duplicate" : "error", text: result.message ?? "The registry is taking a breath. Please try again." });
          return;
        }
        setNotice({ type: "success", text: `${result.maskedKey} is now part of the collection.` });
        setKeyValue("");
        setKeyPage(1);
        await loadRegistry(1);
      })
      .catch(() => setNotice({ type: "error", text: "The registry is taking a breath. Please try again." }))
      .finally(() => setIsAddingKey(false));
  };

  const handleAddCtaClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const target = document.getElementById("add-key");
    const input = document.getElementById("nushuk-key") as HTMLInputElement | null;
    if (!target || !input) return;

    const bounds = target.getBoundingClientRect();
    const isOutsideViewport = bounds.top < 0 || bounds.bottom > window.innerHeight;
    if (isOutsideViewport) target.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => input.focus(), isOutsideViewport ? 350 : 0);
  };

  const handleCopy = async (id: number, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKeyId(id);
      window.setTimeout(() => setCopiedKeyId(current => current === id ? null : current), 1800);
    } catch {
      setNotice({ type: "error", text: "Copy was not available here. Select the key and copy it manually." });
    }
  };

  return (
    <main className="site-shell">
      <div className="grain" aria-hidden="true" />
      <header className="site-header page-pad">
        <a className="brand" href="#top" aria-label="Nushuk Key Collector home">
          <SealMark />
          <span className="brand-lockup"><strong>Nushuk</strong><em>Key Collector</em></span>
        </a>
      </header>

      <section className="hero page-pad" id="top">
        <div className="hero-copy reveal reveal-one">
          <div className="eyebrow"><span className="eyebrow-dot" /> A shared Umrah registry</div>
          <h1>Leave one key.<br /><span>Collect hundreds.</span></h1>
          <p className="hero-lede">A quiet place to register your Nushuk key for the journey ahead — with one simple promise: no repeats.</p>
          <a className="primary-cta" href="#add-key" onClick={handleAddCtaClick}>Add your Nushuk key <ArrowUpRight size={18} /></a>
          <div className="trust-note"><ShieldCheck size={16} /> Unique by design · public by purpose</div>
        </div>

        <KeyScene />

        <aside className="hero-rail hero-collector reveal reveal-three" aria-label="Nushuk key collection" id="collection">
          <div className="rail-intro"><span>01 / live collection</span><span className="rail-rule" /></div>
          <div className="collection-total"><span>keys kept</span><strong>{registryLoading ? "—" : total.toLocaleString()}</strong><span><span className="status-dot" /> syncing live</span></div>
          <div className="collector-panel" id="add-key">
            <form onSubmit={handleSubmit} className="key-form">
              <label htmlFor="nushuk-key">Nushuk key</label>
              <div className="input-wrap">
                <KeyRound size={19} />
                <input id="nushuk-key" value={keyValue} onChange={event => setKeyValue(event.target.value)} placeholder={keyHint} autoComplete="off" spellCheck={false} maxLength={160} />
                <span className="input-count">{keyValue.length}/160</span>
              </div>
              <button className="submit-key" type="submit" disabled={isAddingKey}>{isAddingKey ? "Checking the collection…" : "Keep this key unique"}<ArrowUpRight size={17} /></button>
            </form>
            {notice && <div className={`notice notice-${notice.type}`} role="status"><span className="notice-icon">{notice.type === "success" ? <Check size={15} /> : <span>!</span>}</span><span>{notice.text}</span></div>}
            <div className="form-footnote"><LockKeyhole size={14} /> Keys are shared here so the community can copy them easily.</div>
            <div className="key-list" aria-label="Shared Nushuk key list">
              <div className="key-list-header"><span><span className="list-live-dot" /> shared key list</span><span>{recentTotal} total</span></div>
              {recent.length > 0 ? recent.map(item => (
                <div className="key-list-row" key={item.id}>
                  <div className="key-list-value"><span className="activity-mark"><Check size={12} /></span><code>{item.key}</code></div>
                  <div className="key-list-meta"><span>{formatDate(item.createdAt)}</span><button className="copy-key" type="button" onClick={() => void handleCopy(item.id, item.key)} aria-label={`Copy key ${item.key}`}>{copiedKeyId === item.id ? <><CopyCheck size={14} /> copied</> : <><Copy size={14} /> copy</>}</button></div>
                </div>
              )) : <div className="key-list-empty">Your submitted key will appear here for easy sharing.</div>}
              {totalPages > 1 && <div className="key-pagination"><button type="button" className="page-button" onClick={() => setKeyPage(page => Math.max(1, page - 1))} disabled={keyPage <= 1}><ChevronLeft size={14} /> previous</button><span>page {keyPage} of {totalPages}</span><button type="button" className="page-button" onClick={() => setKeyPage(page => Math.min(totalPages, page + 1))} disabled={keyPage >= totalPages}>next <ChevronRight size={14} /></button></div>}
            </div>
          </div>
        </aside>
      </section>

      <footer className="site-footer page-pad"><div className="footer-brand"><SealMark /><span>Nushuk Key Collector</span></div><span>Developed by <a href="https://www.kompilex.com/" target="_blank" rel="noreferrer">KompileX.com</a></span><span className="footer-year">© {new Date().getFullYear()}</span></footer>
    </main>
  );
}
