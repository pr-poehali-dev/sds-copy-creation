import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

const NAV_ITEMS = [
  { id: "home", label: "Главная" },
  { id: "scheme", label: "Схема аварии" },
  { id: "description", label: "Описание инцидента" },
  { id: "analysis", label: "Анализ и выводы" },
  { id: "documents", label: "Документы и отчёты" },
  { id: "contacts", label: "Контакты" },
];

const INCIDENT_POINTS = [
  {
    id: "A",
    x: 180,
    y: 140,
    color: "#ef4444",
    label: "Точка возгорания",
    description: "Первичное место возникновения аварийной ситуации. Зафиксировано в 04:32 мск.",
    type: "danger",
  },
  {
    id: "B",
    x: 320,
    y: 220,
    color: "#f59e0b",
    label: "Зона поражения",
    description: "Площадь распространения последствий аварии. Радиус — 150 метров.",
    type: "warning",
  },
  {
    id: "C",
    x: 460,
    y: 160,
    color: "#3b82f6",
    label: "Пост мониторинга",
    description: "Стационарный пост контроля параметров. Показания зафиксированы.",
    type: "info",
  },
  {
    id: "D",
    x: 260,
    y: 320,
    color: "#f59e0b",
    label: "Вторичный очаг",
    description: "Зона вторичного поражения. Выявлено в ходе технического расследования.",
    type: "warning",
  },
  {
    id: "E",
    x: 400,
    y: 300,
    color: "#22c55e",
    label: "Точка эвакуации",
    description: "Маршрут эвакуации персонала. Задействован в 04:45 мск.",
    type: "safe",
  },
];

const DOCUMENTS = [
  { id: 1, title: "Акт технического расследования", date: "15.03.2024", type: "Акт", pages: 24 },
  { id: 2, title: "Протокол осмотра места аварии", date: "15.03.2024", type: "Протокол", pages: 8 },
  { id: 3, title: "Заключение экспертной комиссии", date: "28.03.2024", type: "Заключение", pages: 36 },
  { id: 4, title: "Предписание об устранении нарушений", date: "02.04.2024", type: "Предписание", pages: 5 },
  { id: 5, title: "Отчёт о выполнении мероприятий", date: "20.04.2024", type: "Отчёт", pages: 12 },
];

function InteractiveScheme() {
  const [tooltip, setTooltip] = useState<{ point: (typeof INCIDENT_POINTS)[0]; x: number; y: number } | null>(null);
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale((s) => Math.min(Math.max(s * delta, 0.5), 4));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleReset = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  const typeColor = (type: string) => {
    switch (type) {
      case "danger": return "#ef4444";
      case "warning": return "#f59e0b";
      case "info": return "#3b82f6";
      case "safe": return "#22c55e";
      default: return "#94a3b8";
    }
  };

  return (
    <div className="relative bg-[#0d1117] border border-[hsl(var(--border))] rounded-sm overflow-hidden select-none">
      <div className="absolute top-3 right-3 z-10 flex gap-2">
        <button
          onClick={() => setScale((s) => Math.min(s * 1.2, 4))}
          className="w-8 h-8 bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] flex items-center justify-center hover:bg-[hsl(var(--accent))] transition-colors text-sm font-mono"
        >+</button>
        <button
          onClick={() => setScale((s) => Math.max(s * 0.8, 0.5))}
          className="w-8 h-8 bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] flex items-center justify-center hover:bg-[hsl(var(--accent))] transition-colors text-sm font-mono"
        >−</button>
        <button
          onClick={handleReset}
          className="w-8 h-8 bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] text-[hsl(var(--foreground))] flex items-center justify-center hover:bg-[hsl(var(--accent))] transition-colors"
        >
          <Icon name="RotateCcw" size={13} />
        </button>
      </div>

      <div className="absolute top-3 left-3 z-10">
        <div className="bg-[hsl(var(--surface))] border border-[hsl(var(--border))] px-3 py-2 text-xs font-mono text-[hsl(var(--muted-foreground))]">
          <div className="text-[hsl(var(--foreground))] font-medium mb-1">МАСШТАБ: {(scale * 100).toFixed(0)}%</div>
          <div>Прокрутка — зум · Перетащите — панорама</div>
        </div>
      </div>

      <svg
        ref={svgRef}
        className={`w-full h-[480px] ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e2a38" strokeWidth="0.5" />
          </pattern>
          <filter id="glow-red">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-amber">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
            <polygon points="0 0, 6 2, 0 4" fill="#3b82f6" opacity="0.6" />
          </marker>
        </defs>

        <rect width="100%" height="100%" fill="url(#grid)" />

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${scale})`} style={{ transformOrigin: "50% 50%" }}>
          {/* Территория объекта */}
          <rect x="80" y="80" width="460" height="300" rx="2" fill="none" stroke="#1e3a5f" strokeWidth="1.5" strokeDasharray="8,4" />
          <text x="90" y="72" fill="#2563eb" fontSize="9" fontFamily="IBM Plex Mono" opacity="0.7">ТЕРРИТОРИЯ ОБЪЕКТА</text>

          {/* Здания */}
          <rect x="120" y="110" width="80" height="60" fill="#111827" stroke="#1e3a5f" strokeWidth="1" />
          <text x="160" y="144" textAnchor="middle" fill="#4b5563" fontSize="8" fontFamily="IBM Plex Mono">КОРП. 1</text>

          <rect x="350" y="110" width="100" height="70" fill="#111827" stroke="#1e3a5f" strokeWidth="1" />
          <text x="400" y="149" textAnchor="middle" fill="#4b5563" fontSize="8" fontFamily="IBM Plex Mono">КОРП. 2</text>

          <rect x="200" y="260" width="120" height="80" fill="#111827" stroke="#1e3a5f" strokeWidth="1" />
          <text x="260" y="304" textAnchor="middle" fill="#4b5563" fontSize="8" fontFamily="IBM Plex Mono">СКЛАД</text>

          {/* Дороги */}
          <line x1="80" y1="200" x2="540" y2="200" stroke="#1e3a5f" strokeWidth="8" opacity="0.4" />
          <line x1="310" y1="80" x2="310" y2="380" stroke="#1e3a5f" strokeWidth="8" opacity="0.4" />
          <line x1="80" y1="200" x2="540" y2="200" stroke="#243447" strokeWidth="1" strokeDasharray="12,8" />

          {/* Связи между точками */}
          <line x1="180" y1="140" x2="320" y2="220" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4,3" opacity="0.4" markerEnd="url(#arrowhead)" />
          <line x1="320" y1="220" x2="260" y2="320" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4,3" opacity="0.4" markerEnd="url(#arrowhead)" />
          <line x1="460" y1="160" x2="400" y2="300" stroke="#22c55e" strokeWidth="1" strokeDasharray="4,3" opacity="0.3" markerEnd="url(#arrowhead)" />

          {/* Зона поражения */}
          <circle cx="180" cy="140" r="60" fill="#ef4444" fillOpacity="0.05" stroke="#ef4444" strokeWidth="0.5" strokeDasharray="6,3" />

          {/* Точки инцидента */}
          {INCIDENT_POINTS.map((point) => (
            <g
              key={point.id}
              onMouseEnter={(e) => {
                const rect = svgRef.current?.getBoundingClientRect();
                if (rect) {
                  setTooltip({
                    point,
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                  });
                }
              }}
              onMouseLeave={() => setTooltip(null)}
              style={{ cursor: "pointer" }}
            >
              <circle cx={point.x} cy={point.y} r="18" fill={typeColor(point.type)} fillOpacity="0.1" stroke={typeColor(point.type)} strokeWidth="0.5" />
              <circle cx={point.x} cy={point.y} r="8" fill={typeColor(point.type)} fillOpacity="0.2" stroke={typeColor(point.type)} strokeWidth="1.5" filter={point.type === "danger" ? "url(#glow-red)" : undefined} />
              <circle cx={point.x} cy={point.y} r="3" fill={typeColor(point.type)} />
              <text x={point.x} y={point.y - 22} textAnchor="middle" fill={typeColor(point.type)} fontSize="9" fontFamily="IBM Plex Mono" fontWeight="600">{point.id}</text>
            </g>
          ))}
        </g>
      </svg>

      {tooltip && (
        <div
          className="absolute z-20 pointer-events-none"
          style={{ left: tooltip.x + 16, top: tooltip.y - 16 }}
        >
          <div className="bg-[#0d1520] border border-[hsl(var(--border))] p-3 max-w-[220px] shadow-2xl">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: typeColor(tooltip.point.type) }} />
              <span className="text-xs font-semibold text-[hsl(var(--foreground))] font-mono">{tooltip.point.label}</span>
            </div>
            <p className="text-[11px] text-[hsl(var(--muted-foreground))] leading-relaxed">{tooltip.point.description}</p>
          </div>
        </div>
      )}

      {/* Легенда */}
      <div className="border-t border-[hsl(var(--border))] px-4 py-3 flex flex-wrap gap-4 bg-[hsl(var(--surface))]">
        {[
          { color: "#ef4444", label: "Место аварии" },
          { color: "#f59e0b", label: "Зона поражения" },
          { color: "#3b82f6", label: "Мониторинг" },
          { color: "#22c55e", label: "Эвакуация" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-[11px] text-[hsl(var(--muted-foreground))] font-mono">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Index() {
  const [activeSection, setActiveSection] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollTo = (id: string) => {
    setActiveSection(id);
    setMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0.3 }
    );
    NAV_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] font-[IBM_Plex_Sans,sans-serif] text-[hsl(var(--foreground))]">

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border border-[hsl(var(--destructive))] flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-[hsl(var(--destructive))]" />
            </div>
            <span className="text-sm font-semibold tracking-widest uppercase text-[hsl(var(--foreground))]">ГИОСДС</span>
            <span className="hidden md:block text-[hsl(var(--muted-foreground))] text-xs font-mono">/ Документация инцидента</span>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`px-3 py-1.5 text-xs font-medium tracking-wide transition-colors ${
                  activeSection === item.id
                    ? "text-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10"
                    : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
            <Icon name={menuOpen ? "X" : "Menu"} size={18} />
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-[hsl(var(--border))] bg-[hsl(var(--surface))]">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="w-full text-left px-6 py-3 text-sm text-[hsl(var(--foreground))] border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </header>

      <main className="pt-14">

        {/* HOME */}
        <section id="home" className="min-h-screen flex items-center relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_39px,hsl(var(--border))_39px,hsl(var(--border))_40px),repeating-linear-gradient(90deg,transparent,transparent_39px,hsl(var(--border))_39px,hsl(var(--border))_40px)]" style={{ opacity: 0.15 }} />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[hsl(var(--destructive))]/5 via-transparent to-[hsl(var(--primary))]/5" />
          </div>

          <div className="max-w-7xl mx-auto px-6 py-24 relative z-10">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="h-px w-12 bg-[hsl(var(--destructive))]" />
                <span className="text-xs font-mono text-[hsl(var(--destructive))] tracking-widest uppercase">Инцидент задокументирован</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 tracking-tight">
                Техническое расследование
                <span className="block text-[hsl(var(--muted-foreground))] font-light text-3xl md:text-4xl mt-2">аварийного инцидента</span>
              </h1>

              <p className="text-[hsl(var(--muted-foreground))] text-lg leading-relaxed mb-10 max-w-xl">
                Документация содержит полное описание аварийной ситуации, интерактивную схему инцидента, анализ причин и перечень принятых мер.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                {[
                  { label: "Дата инцидента", value: "15.03.2024", icon: "Calendar" },
                  { label: "Время фиксации", value: "04:32 мск", icon: "Clock" },
                  { label: "Статус", value: "Расследован", icon: "CheckCircle" },
                  { label: "Документов", value: "5", icon: "FileText" },
                ].map((stat) => (
                  <div key={stat.label} className="border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-4">
                    <Icon name={stat.icon} size={16} className="text-[hsl(var(--muted-foreground))] mb-2" />
                    <div className="text-lg font-semibold font-mono text-[hsl(var(--foreground))]">{stat.value}</div>
                    <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => scrollTo("scheme")}
                  className="flex items-center gap-2 px-6 py-3 bg-[hsl(var(--primary))] text-white text-sm font-medium hover:bg-[hsl(var(--primary))]/90 transition-colors"
                >
                  <Icon name="Map" size={15} />
                  Смотреть схему аварии
                </button>
                <button
                  onClick={() => scrollTo("documents")}
                  className="flex items-center gap-2 px-6 py-3 border border-[hsl(var(--border))] text-sm font-medium hover:bg-[hsl(var(--accent))] transition-colors text-[hsl(var(--foreground))]"
                >
                  <Icon name="Download" size={15} />
                  Документы
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SCHEME */}
        <section id="scheme" className="py-24 border-t border-[hsl(var(--border))]">
          <div className="max-w-7xl mx-auto px-6">
            <SectionHeader
              tag="02 / Схема"
              title="Интерактивная схема аварии"
              description="Наведите курсор на маркеры для получения подробной информации по каждой точке инцидента. Используйте колесо мыши для масштабирования."
            />
            <InteractiveScheme />
          </div>
        </section>

        {/* DESCRIPTION */}
        <section id="description" className="py-24 border-t border-[hsl(var(--border))]">
          <div className="max-w-7xl mx-auto px-6">
            <SectionHeader
              tag="03 / Инцидент"
              title="Описание инцидента"
              description="Хронология событий и детальное описание аварийной ситуации"
            />

            <div className="grid md:grid-cols-2 gap-8 mb-10">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold tracking-widest uppercase text-[hsl(var(--muted-foreground))] mb-4">Хронология событий</h3>
                {[
                  { time: "04:32", event: "Фиксация первичного сигнала тревоги", type: "danger" },
                  { time: "04:35", event: "Прибытие дежурной бригады на объект", type: "warning" },
                  { time: "04:41", event: "Установление зоны поражения", type: "warning" },
                  { time: "04:45", event: "Начало эвакуации персонала", type: "info" },
                  { time: "05:10", event: "Локализация аварийной зоны", type: "info" },
                  { time: "06:30", event: "Ликвидация непосредственной угрозы", type: "safe" },
                  { time: "08:00", event: "Начало технического расследования", type: "safe" },
                ].map((item) => (
                  <div key={item.time} className="flex gap-4 items-start">
                    <span className="text-xs font-mono text-[hsl(var(--muted-foreground))] w-12 flex-shrink-0 pt-0.5">{item.time}</span>
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        item.type === "danger" ? "bg-red-500" :
                        item.type === "warning" ? "bg-amber-500" :
                        item.type === "info" ? "bg-blue-500" : "bg-green-500"
                      }`} />
                      <span className="text-sm text-[hsl(var(--foreground))] leading-relaxed">{item.event}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold tracking-widest uppercase text-[hsl(var(--muted-foreground))] mb-4">Характеристики инцидента</h3>
                {[
                  { label: "Категория аварии", value: "Производственная" },
                  { label: "Класс опасности", value: "II класс" },
                  { label: "Площадь зоны поражения", value: "≈ 70 600 м²" },
                  { label: "Задействовано персонала", value: "24 человека" },
                  { label: "Пострадавших", value: "0 человек" },
                  { label: "Продолжительность ликвидации", value: "1 час 58 минут" },
                  { label: "Материальный ущерб", value: "Уточняется" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-3 border-b border-[hsl(var(--border))]">
                    <span className="text-sm text-[hsl(var(--muted-foreground))]">{item.label}</span>
                    <span className="text-sm font-medium font-mono text-[hsl(var(--foreground))]">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-[hsl(var(--muted-foreground))] mb-3">Краткое описание</h3>
              <p className="text-sm leading-relaxed text-[hsl(var(--foreground))]">
                В ходе планового ночного дежурства в 04:32 мск была зафиксирована аварийная ситуация на территории объекта. Дежурная бригада оперативно прибыла на место, установила зону поражения и организовала эвакуацию персонала согласно утверждённому плану. Благодаря слаженным действиям служб пострадавших среди персонала не имеется. К 06:30 непосредственная угроза была ликвидирована. Технической расследование начато в 08:00 того же дня.
              </p>
            </div>
          </div>
        </section>

        {/* ANALYSIS */}
        <section id="analysis" className="py-24 border-t border-[hsl(var(--border))]">
          <div className="max-w-7xl mx-auto px-6">
            <SectionHeader
              tag="04 / Анализ"
              title="Анализ и выводы"
              description="Установленные причины, факторы риска и рекомендованные меры"
            />

            <div className="grid md:grid-cols-3 gap-6 mb-10">
              {[
                {
                  icon: "AlertTriangle",
                  color: "text-red-400",
                  bg: "bg-red-500/10 border-red-500/20",
                  title: "Первопричины",
                  items: [
                    "Износ технологического оборудования",
                    "Нарушение регламента технического обслуживания",
                    "Несоответствие параметров эксплуатации",
                  ],
                },
                {
                  icon: "AlertCircle",
                  color: "text-amber-400",
                  bg: "bg-amber-500/10 border-amber-500/20",
                  title: "Сопутствующие факторы",
                  items: [
                    "Неблагоприятные метеоусловия",
                    "Недостаточное освещение территории",
                    "Запоздалое срабатывание сигнализации",
                  ],
                },
                {
                  icon: "CheckCircle",
                  color: "text-green-400",
                  bg: "bg-green-500/10 border-green-500/20",
                  title: "Принятые меры",
                  items: [
                    "Замена изношенного оборудования",
                    "Актуализация регламентов обслуживания",
                    "Модернизация системы сигнализации",
                  ],
                },
              ].map((card) => (
                <div key={card.title} className={`border ${card.bg} p-6`}>
                  <div className="flex items-center gap-2 mb-4">
                    <Icon name={card.icon} size={18} className={card.color} />
                    <h3 className="text-sm font-semibold text-[hsl(var(--foreground))]">{card.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {card.items.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-[hsl(var(--muted-foreground))]">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-current flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-[hsl(var(--muted-foreground))] mb-4">Общие выводы комиссии</h3>
              <p className="text-sm leading-relaxed text-[hsl(var(--foreground))] mb-3">
                По результатам технического расследования установлено, что авария произошла вследствие совокупности организационных и технических причин. Действия персонала признаны в целом соответствующими установленным регламентам.
              </p>
              <p className="text-sm leading-relaxed text-[hsl(var(--foreground))]">
                Комиссия рекомендует провести внеплановую проверку аналогичного оборудования на смежных объектах и актуализировать план ликвидации аварийных ситуаций в соответствии с выявленными уязвимостями.
              </p>
            </div>
          </div>
        </section>

        {/* DOCUMENTS */}
        <section id="documents" className="py-24 border-t border-[hsl(var(--border))]">
          <div className="max-w-7xl mx-auto px-6">
            <SectionHeader
              tag="05 / Документы"
              title="Документы и отчёты"
              description="Официальная документация по результатам расследования"
            />

            <div className="space-y-2">
              {DOCUMENTS.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border border-[hsl(var(--border))] bg-[hsl(var(--surface))] hover:bg-[hsl(var(--accent))] transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 border border-[hsl(var(--border))] flex items-center justify-center flex-shrink-0">
                      <Icon name="FileText" size={16} className="text-[hsl(var(--muted-foreground))]" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[hsl(var(--foreground))]">{doc.title}</div>
                      <div className="text-xs text-[hsl(var(--muted-foreground))] font-mono mt-0.5">
                        {doc.type} · {doc.pages} стр. · {doc.date}
                      </div>
                    </div>
                  </div>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[hsl(var(--muted-foreground))] border border-transparent hover:border-[hsl(var(--border))] hover:text-[hsl(var(--foreground))] transition-colors opacity-0 group-hover:opacity-100">
                    <Icon name="Download" size={13} />
                    Скачать
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACTS */}
        <section id="contacts" className="py-24 border-t border-[hsl(var(--border))]">
          <div className="max-w-7xl mx-auto px-6">
            <SectionHeader
              tag="06 / Контакты"
              title="Контакты"
              description="Связь с ответственными лицами по данному инциденту"
            />

            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  role: "Руководитель расследования",
                  name: "Иванов И.И.",
                  dept: "Технический отдел",
                  phone: "+7 (495) 000-00-01",
                  email: "info@giosds.ru",
                },
                {
                  role: "Технический эксперт",
                  name: "Петров П.П.",
                  dept: "Отдел безопасности",
                  phone: "+7 (495) 000-00-02",
                  email: "info@giosds.ru",
                },
                {
                  role: "Документационный отдел",
                  name: "Сидорова А.В.",
                  dept: "Канцелярия",
                  phone: "+7 (495) 000-00-03",
                  email: "docs@giosds.ru",
                },
              ].map((contact) => (
                <div key={contact.role} className="border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-6">
                  <div className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-widest font-semibold mb-3">{contact.role}</div>
                  <div className="text-base font-semibold text-[hsl(var(--foreground))] mb-1">{contact.name}</div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))] mb-4">{contact.dept}</div>
                  <div className="space-y-2">
                    <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-sm text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-colors">
                      <Icon name="Phone" size={13} className="text-[hsl(var(--muted-foreground))]" />
                      {contact.phone}
                    </a>
                    <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-sm text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-colors">
                      <Icon name="Mail" size={13} className="text-[hsl(var(--muted-foreground))]" />
                      {contact.email}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      <footer className="border-t border-[hsl(var(--border))] py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 border border-[hsl(var(--destructive))] flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-[hsl(var(--destructive))]" />
            </div>
            <span className="text-xs font-mono text-[hsl(var(--muted-foreground))] tracking-widest">ГИОСДС — ДОКУМЕНТАЦИЯ ИНЦИДЕНТА 2024</span>
          </div>
          <div className="text-xs font-mono text-[hsl(var(--muted-foreground))]">
            Все материалы носят технический характер
          </div>
        </div>
      </footer>
    </div>
  );
}

function SectionHeader({ tag, title, description }: { tag: string; title: string; description: string }) {
  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px w-8 bg-[hsl(var(--primary))]" />
        <span className="text-xs font-mono text-[hsl(var(--primary))] tracking-widest uppercase">{tag}</span>
      </div>
      <h2 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-3">{title}</h2>
      <p className="text-[hsl(var(--muted-foreground))] max-w-2xl">{description}</p>
    </div>
  );
}