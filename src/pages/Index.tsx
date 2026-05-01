import { useState, useRef } from "react";
import Icon from "@/components/ui/icon";

const NAV_ITEMS = [
  { id: "home", label: "Главная" },
  { id: "scheme", label: "Схема аварии" },
  { id: "description", label: "Описание инцидента" },
  { id: "analysis", label: "Анализ и выводы" },
  { id: "documents", label: "Документы и отчёты" },
  { id: "contacts", label: "Контакты" },
];

const DOCUMENTS = [
  { id: 1, title: "Акт технического расследования", date: "01.01.2026", type: "Акт", pages: 24 },
  { id: 2, title: "Протокол осмотра места аварии", date: "01.01.2026", type: "Протокол", pages: 8 },
  { id: 3, title: "Заключение экспертной комиссии", date: "05.01.2026", type: "Заключение", pages: 36 },
  { id: 4, title: "Предписание об устранении нарушений", date: "10.01.2026", type: "Предписание", pages: 5 },
  { id: 5, title: "Отчёт о выполнении мероприятий", date: "20.01.2026", type: "Отчёт", pages: 12 },
];

// Типы для тултипов
type TooltipData = {
  title: string;
  rows: { label: string; value: string }[];
  x: number;
  y: number;
};

function Arrow({ x1, y1, x2, y2, color = "#e53e3e" }: { x1: number; y1: number; x2: number; y2: number; color?: string }) {
  const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
  const len = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  return (
    <g transform={`translate(${x1},${y1}) rotate(${angle})`}>
      <line x1={0} y1={0} x2={len} y2={0} stroke={color} strokeWidth="1.5" />
      <polygon points={`${len},0 ${len - 7},-4 ${len - 7},4`} fill={color} />
    </g>
  );
}

function FlowArrow({ x, y, angle, color = "#e53e3e" }: { x: number; y: number; angle: number; color?: string }) {
  return (
    <g transform={`translate(${x},${y}) rotate(${angle})`}>
      <polygon points="0,-4 12,0 0,4" fill={color} />
    </g>
  );
}

function QLabel({ x, y, q, tooltip, onHover, onLeave }: {
  x: number; y: number; q: string;
  tooltip?: TooltipData;
  onHover?: (t: TooltipData, ex: number, ey: number) => void;
  onLeave?: () => void;
}) {
  return (
    <g
      onMouseEnter={(e) => tooltip && onHover?.(tooltip, e.clientX, e.clientY)}
      onMouseLeave={onLeave}
      style={{ cursor: tooltip ? "pointer" : "default" }}
    >
      <rect x={x - 22} y={y - 9} width={44} height={18} rx={1} fill="#fff" stroke="#c53030" strokeWidth={1} />
      <text x={x} y={y + 4} textAnchor="middle" fontSize={9} fill="#c53030" fontFamily="IBM Plex Mono" fontWeight="600">{q}</text>
    </g>
  );
}

function MineScheme() {
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(s => Math.min(Math.max(s * delta, 0.4), 5));
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
  const handleReset = () => { setScale(1); setPan({ x: 0, y: 0 }); };

  const showTooltip = (t: TooltipData, ex: number, ey: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (rect) setTooltip({ ...t, x: ex - rect.left, y: ey - rect.top });
  };
  const hideTooltip = () => setTooltip(null);

  const atmosTooltip: TooltipData = {
    title: "Состав рудничной атмосферы",
    rows: [
      { label: "CO", value: "0,10%" }, { label: "CO₂", value: "0,10%" },
      { label: "t°", value: "23°C" }, { label: "SO₂", value: "0,0020%" },
      { label: "O₂", value: "19,10%" }, { label: "CH₄", value: "0,0000%" },
      { label: "NO-NO₂", value: "0,00030%" }, { label: "SO₂", value: "0,00030%" },
      { label: "Задымлённость", value: "5–10м" },
    ],
    x: 0, y: 0,
  };

  return (
    <div className="relative bg-[#f0f0ee] border border-[hsl(var(--border))] rounded-sm overflow-hidden select-none">
      {/* Controls */}
      <div className="absolute top-3 right-3 z-10 flex gap-1.5">
        <button onClick={() => setScale(s => Math.min(s * 1.25, 5))} className="w-8 h-8 bg-white border border-gray-300 text-gray-700 flex items-center justify-center hover:bg-gray-50 text-sm font-mono shadow-sm">+</button>
        <button onClick={() => setScale(s => Math.max(s * 0.8, 0.4))} className="w-8 h-8 bg-white border border-gray-300 text-gray-700 flex items-center justify-center hover:bg-gray-50 text-sm font-mono shadow-sm">−</button>
        <button onClick={handleReset} className="w-8 h-8 bg-white border border-gray-300 text-gray-700 flex items-center justify-center hover:bg-gray-50 shadow-sm">
          <Icon name="RotateCcw" size={13} />
        </button>
      </div>
      <div className="absolute top-3 left-3 z-10">
        <div className="bg-white/90 border border-gray-200 px-2.5 py-1.5 text-[10px] font-mono text-gray-500 shadow-sm">
          {(scale * 100).toFixed(0)}% · колесо мыши — зум
        </div>
      </div>

      <svg
        ref={svgRef}
        className={`w-full h-[560px] ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
        viewBox="0 0 820 500"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <defs>
          <marker id="arr-red" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
            <polygon points="0 0, 7 2.5, 0 5" fill="#e53e3e" />
          </marker>
          <marker id="arr-gray" markerWidth="7" markerHeight="5" refX="6" refY="2.5" orient="auto">
            <polygon points="0 0, 7 2.5, 0 5" fill="#718096" />
          </marker>
        </defs>

        <rect width="820" height="500" fill="#eaeae6" />

        <g transform={`translate(${pan.x + 10}, ${pan.y + 10}) scale(${scale})`} style={{ transformOrigin: "400px 250px" }}>

          {/* ===== ГОРНЫЕ ВЫРАБОТКИ ===== */}

          {/* Вентиляционный вертикальный штрек вверху (вертикальный) */}
          <rect x={368} y={30} width={30} height={130} fill="#d0cfc8" stroke="#999" strokeWidth={1} />
          {/* Метка */}
          <text x={430} y={60} fontSize={9} fill="#444" fontFamily="IBM Plex Sans" transform="rotate(-40, 430, 60)">Вентиляционный</text>
          <text x={445} y={75} fontSize={9} fill="#444" fontFamily="IBM Plex Sans" transform="rotate(-40, 445, 75)">вертикальный №2</text>
          <text x={455} y={90} fontSize={9} fill="#444" fontFamily="IBM Plex Sans" transform="rotate(-40, 455, 90)">гор. +270м</text>

          {/* Горизонтальный главный штрек (гор +210м) слева-направо */}
          <rect x={60} y={228} width={520} height={34} fill="#d0cfc8" stroke="#999" strokeWidth={1} />

          {/* Капитальный квершлаг гор +210м — диагональ вправо-вниз */}
          <g transform="translate(470, 262) rotate(20)">
            <rect x={0} y={-17} width={230} height={34} fill="#c8c7c0" stroke="#999" strokeWidth={1} />
          </g>
          <text x={530} y={320} fontSize={9} fill="#444" fontFamily="IBM Plex Sans">Капитальный квершлаг гор.+210м.</text>

          {/* Вентиляционный вертикальный №2 диагональ вверх-вправо */}
          <g transform="translate(380, 160) rotate(-35)">
            <rect x={0} y={-14} width={180} height={28} fill="#c8c7c0" stroke="#999" strokeWidth={1} />
          </g>

          {/* Водосборник гор+210м — горизонтальный боковой */}
          <rect x={240} y={228} width={120} height={60} fill="#c8c7c0" stroke="#999" strokeWidth={1} />
          <text x={250} y={268} fontSize={9} fill="#555" fontFamily="IBM Plex Sans">Водосборник</text>
          <text x={250} y={278} fontSize={9} fill="#555" fontFamily="IBM Plex Sans">гор.+210м</text>

          {/* Левый отвод — горизонтально влево */}
          <rect x={20} y={228} width={60} height={34} fill="#d0cfc8" stroke="#999" strokeWidth={1} />
          <text x={14} y={250} fontSize={8} fill="#555" fontFamily="IBM Plex Sans" transform="rotate(-90,14,250)">гор.+210м</text>

          {/* Штрек вверх от основного (к вентшахте) */}
          <rect x={368} y={160} width={34} height={70} fill="#d0cfc8" stroke="#999" strokeWidth={1} />

          {/* Небольшой левый ответвитель */}
          <rect x={140} y={262} width={40} height={50} fill="#c8c7c0" stroke="#999" strokeWidth={1} />

          {/* ===== ВЕНТИЛЯЦИОННАЯ ШАХТА (зелёный прямоугольник) ===== */}
          <rect x={375} y={38} width={20} height={36} fill="#276749" stroke="#276749" strokeWidth={1} />
          <text x={398} y={52} fontSize={8} fill="#276749" fontFamily="IBM Plex Sans" fontWeight="600">ВШ</text>

          {/* ===== СТАЦИОНАРНЫЙ ПУНКТ ВГК (жёлто-чёрный) ===== */}
          <g
            onMouseEnter={(e) => showTooltip({
              title: "Стационарный пункт ВГК",
              rows: [{ label: "Q (расход воздуха)", value: "4,79 м³/с" }, { label: "Горизонт", value: "+210м" }],
              x: 0, y: 0
            }, e.clientX, e.clientY)}
            onMouseLeave={hideTooltip}
            style={{ cursor: "pointer" }}
          >
            <rect x={378} y={195} width={10} height={34} fill="#f6e05e" stroke="#333" strokeWidth={1} />
            <rect x={382} y={195} width={6} height={34} fill="#1a202c" stroke="#333" strokeWidth={1} />
            {/* Треугольник-указатель */}
            <polygon points="395,200 402,212 395,224" fill="#e53e3e" stroke="#c53030" strokeWidth={0.5} />
          </g>

          {/* ===== Q-метки расходов воздуха ===== */}
          {/* Q: 54.04 у вентшахты */}
          <QLabel x={450} y={178}
            q="Q: 54.04"
            tooltip={{ title: "Расход воздуха", rows: [{ label: "Q", value: "54.04 м³/с" }, { label: "Участок", value: "Вент. вертикальный №2" }], x: 0, y: 0 }}
            onHover={showTooltip} onLeave={hideTooltip}
          />
          {/* Q: 4.79 у пункта ВГК */}
          <QLabel x={395} y={215}
            q="Q: 4.79"
            tooltip={{ title: "Расход воздуха", rows: [{ label: "Q", value: "4.79 м³/с" }, { label: "Участок", value: "Насосная гор.+210м" }], x: 0, y: 0 }}
            onHover={showTooltip} onLeave={hideTooltip}
          />
          {/* Q: 58.83 слева */}
          <QLabel x={100} y={241}
            q="Q: 58.83"
            tooltip={{ title: "Расход воздуха", rows: [{ label: "Q", value: "58.83 м³/с" }, { label: "Направление", value: "Западный штрек" }], x: 0, y: 0 }}
            onHover={showTooltip} onLeave={hideTooltip}
          />
          {/* Q: 35.84 */}
          <QLabel x={200} y={241}
            q="Q: 35.84"
            tooltip={{ title: "Расход воздуха", rows: [{ label: "Q", value: "35.84 м³/с" }], x: 0, y: 0 }}
            onHover={showTooltip} onLeave={hideTooltip}
          />
          {/* Q: 0.00 */}
          <QLabel x={180} y={295}
            q="Q: 0.00"
            tooltip={{ title: "Расход воздуха", rows: [{ label: "Q", value: "0.00 м³/с" }, { label: "Примечание", value: "Нет движения воздуха" }], x: 0, y: 0 }}
            onHover={showTooltip} onLeave={hideTooltip}
          />
          {/* Q: 2.08 */}
          <QLabel x={350} y={262}
            q="Q: 2.08"
            tooltip={{ title: "Расход воздуха", rows: [{ label: "Q", value: "2.08 м³/с" }], x: 0, y: 0 }}
            onHover={showTooltip} onLeave={hideTooltip}
          />
          {/* Q: 4.79 нижний */}
          <QLabel x={410} y={262}
            q="Q: 4.79"
            tooltip={{ title: "Расход воздуха", rows: [{ label: "Q", value: "4.79 м³/с" }], x: 0, y: 0 }}
            onHover={showTooltip} onLeave={hideTooltip}
          />
          {/* Q: 54.04 нижний */}
          <QLabel x={505} y={295}
            q="Q: 54.04"
            tooltip={{ title: "Расход воздуха", rows: [{ label: "Q", value: "54.04 м³/с" }, { label: "Участок", value: "Капитальный квершлаг" }], x: 0, y: 0 }}
            onHover={showTooltip} onLeave={hideTooltip}
          />

          {/* ===== СТРЕЛКИ ПОТОКОВ ВОЗДУХА ===== */}
          {/* По главному штреку слева направо */}
          <FlowArrow x={88} y={245} angle={0} />
          <FlowArrow x={130} y={245} angle={0} />
          <FlowArrow x={165} y={245} angle={0} />
          <FlowArrow x={225} y={245} angle={0} />
          <FlowArrow x={275} y={245} angle={0} />
          <FlowArrow x={320} y={245} angle={0} />
          {/* К очагу пожара */}
          <FlowArrow x={440} y={245} angle={0} />
          <FlowArrow x={475} y={245} angle={0} />
          {/* По капитальному квершлагу */}
          <FlowArrow x={530} y={268} angle={20} />
          <FlowArrow x={560} y={278} angle={20} />
          <FlowArrow x={590} y={288} angle={20} />
          {/* Вниз к водосборнику */}
          <FlowArrow x={305} y={260} angle={90} />
          <FlowArrow x={305} y={278} angle={90} />
          {/* Вверх к вентшахте */}
          <FlowArrow x={385} y={188} angle={-90} />
          <FlowArrow x={385} y={165} angle={-90} />
          <FlowArrow x={385} y={80} angle={-90} />
          {/* По вент. диагонали */}
          <FlowArrow x={422} y={185} angle={-50} />
          <FlowArrow x={445} y={170} angle={-50} />

          {/* ===== КРАСНЫЕ ПЕРЕМЫЧКИ (закрытые) ===== */}
          {/* Перемычка у вентшахты на диагонали */}
          <g transform="translate(460, 172) rotate(-40)">
            <rect x={-3} y={-14} width={6} height={28} fill="#e53e3e" />
            <line x1={-3} y1={-14} x2={3} y2={14} stroke="#c53030" strokeWidth={1} />
          </g>

          {/* Перемычка слева на главном штреке */}
          <g transform="translate(65, 245)">
            <rect x={-3} y={-17} width={6} height={34} fill="#e53e3e" />
            <line x1={-3} y1={-17} x2={3} y2={17} stroke="#c53030" strokeWidth={1} />
          </g>

          {/* ===== ОЧАГ ПОЖАРА ===== */}
          <g
            onMouseEnter={(e) => showTooltip({
              title: "Очаг пожара — Насосная гор.+210м",
              rows: [
                { label: "Вид аварии", value: "Пожар" },
                { label: "Дата", value: "01.01.2026 7:15 мск" },
                { label: "Место", value: "Насосная гор. +210м" },
                { label: "Q воздуха", value: "4,79 м³/с" },
                { label: "Сечение", value: "10,0 м²" },
                { label: "Телефон КП", value: "2-100" },
              ],
              x: 0, y: 0
            }, e.clientX, e.clientY)}
            onMouseLeave={hideTooltip}
            style={{ cursor: "pointer" }}
          >
            {/* Круг очага */}
            <circle cx={390} cy={250} r={22} fill="white" stroke="#e53e3e" strokeWidth={2.5} />
            {/* Пламя emoji-like через текст */}
            <text x={390} y={257} textAnchor="middle" fontSize={22}>🔥</text>
          </g>

          {/* Надпись "насосная гор. +210м" */}
          <text x={390} y={290} textAnchor="middle" fontSize={9} fill="#555" fontFamily="IBM Plex Sans" fontStyle="italic">насосная гор. +210м</text>

          {/* ===== НАДШАХТНОЕ ЗДАНИЕ (розовая линия) ===== */}
          <line x1={165} y1={262} x2={165} y2={330} stroke="#d53f8c" strokeWidth={2} strokeDasharray="4,2" />
          <text x={155} y={340} fontSize={8} fill="#d53f8c" fontFamily="IBM Plex Sans">НШЗ</text>

          {/* ===== УСЛОВНЫЕ ОБОЗНАЧЕНИЯ ===== */}
          <rect x={650} y={40} width={155} height={160} rx={2} fill="white" stroke="#ccc" strokeWidth={1} />
          <text x={660} y={58} fontSize={10} fill="#333" fontFamily="IBM Plex Sans" fontWeight="700">Условные обозначения:</text>

          {/* НШЗ */}
          <line x1={660} y1={80} x2={660} y2={96} stroke="#d53f8c" strokeWidth={2} strokeDasharray="3,2" />
          <text x={668} y={91} fontSize={9} fill="#444" fontFamily="IBM Plex Sans">Надшахтное здание</text>

          {/* Пожар */}
          <circle cx={664} cy={113} r={10} fill="white" stroke="#e53e3e" strokeWidth={1.5} />
          <text x={664} y={118} textAnchor="middle" fontSize={11}>🔥</text>
          <text x={680} y={118} fontSize={9} fill="#444" fontFamily="IBM Plex Sans">Пожар</text>

          {/* Пункт ВГК */}
          <rect x={659} y={130} width={7} height={18} fill="#f6e05e" stroke="#333" strokeWidth={0.8} />
          <rect x={663} y={130} width={4} height={18} fill="#1a202c" stroke="#333" strokeWidth={0.8} />
          <text x={675} y={143} fontSize={9} fill="#444" fontFamily="IBM Plex Sans">Стац. пункт ВГК</text>

          {/* Отделение в движении */}
          <FlowArrow x={666} y={165} angle={0} color="#e53e3e" />
          <text x={680} y={169} fontSize={9} fill="#444" fontFamily="IBM Plex Sans">Отделение</text>
          <text x={680} y={179} fontSize={9} fill="#444" fontFamily="IBM Plex Sans">в движении</text>

          {/* ===== ИНФОРМАЦИОННАЯ ПАНЕЛЬ АТМОСФЕРЫ ===== */}
          <g
            onMouseEnter={(e) => showTooltip(atmosTooltip, e.clientX, e.clientY)}
            onMouseLeave={hideTooltip}
            style={{ cursor: "pointer" }}
          >
            <rect x={460} y={40} width={170} height={110} rx={2} fill="white" stroke="#ccc" strokeWidth={1} />
            <text x={470} y={56} fontSize={9} fill="#1a365d" fontFamily="IBM Plex Sans" fontWeight="700">Состав рудн. атмосферы:</text>
            <text x={470} y={70} fontSize={8} fill="#333" fontFamily="IBM Plex Sans">CO- 0,10%      CO₂- 0,10%</text>
            <text x={470} y={82} fontSize={8} fill="#333" fontFamily="IBM Plex Sans">t- 23°         SO₂- 0,0020%</text>
            <text x={470} y={94} fontSize={8} fill="#333" fontFamily="IBM Plex Sans">O₂- 19,10%</text>
            <text x={470} y={106} fontSize={8} fill="#333" fontFamily="IBM Plex Sans">CH₄- 0,0000%   NO-NO₂-</text>
            <text x={470} y={118} fontSize={8} fill="#333" fontFamily="IBM Plex Sans">               0,00030%</text>
            <text x={470} y={130} fontSize={8} fill="#555" fontFamily="IBM Plex Sans" fontStyle="italic">Задымл.: ср. 5–10м</text>
            <text x={618} y={148} fontSize={8} fill="#2b6cb0" fontFamily="IBM Plex Sans">▼ подробнее</text>
          </g>

        </g>
      </svg>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute z-30 pointer-events-none"
          style={{ left: Math.min(tooltip.x + 14, 600), top: Math.max(tooltip.y - 10, 10) }}
        >
          <div className="bg-white border border-gray-300 shadow-xl p-3 min-w-[200px]">
            <div className="text-xs font-bold text-gray-800 border-b border-gray-200 pb-1.5 mb-2">{tooltip.title}</div>
            {tooltip.rows.map((r) => (
              <div key={r.label} className="flex justify-between gap-4 text-[11px] mb-1">
                <span className="text-gray-500">{r.label}</span>
                <span className="font-mono font-semibold text-gray-800">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Легенда снизу */}
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-2.5 flex flex-wrap gap-5 items-center">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500 flex items-center justify-center text-white" style={{ fontSize: 8 }}>🔥</div>
          <span className="text-[11px] text-gray-600 font-mono">Очаг пожара</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-1.5 bg-red-600" />
          <span className="text-[11px] text-gray-600 font-mono">Перемычка</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-3 bg-yellow-300 border border-gray-800 flex items-center justify-center">
            <div className="w-2 h-3 bg-gray-800" />
          </div>
          <span className="text-[11px] text-gray-600 font-mono">Пункт ВГК</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-3 bg-green-800" />
          <span className="text-[11px] text-gray-600 font-mono">Вент. шахта</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-red-600 font-mono">▶</span>
          <span className="text-[11px] text-gray-600 font-mono">Поток воздуха</span>
        </div>
        <div className="ml-auto text-[10px] text-gray-400 font-mono">Наведите на элементы для деталей</div>
      </div>
    </div>
  );
}

function SectionHeader({ tag, title, description }: { tag: string; title: string; description: string }) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px w-8 bg-[hsl(var(--primary))]" />
        <span className="text-xs font-mono text-[hsl(var(--primary))] tracking-widest uppercase">{tag}</span>
      </div>
      <h2 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-2">{title}</h2>
      <p className="text-[hsl(var(--muted-foreground))] max-w-2xl text-sm">{description}</p>
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

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] font-[IBM_Plex_Sans,sans-serif] text-[hsl(var(--foreground))]">

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border border-[hsl(var(--destructive))] flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-[hsl(var(--destructive))]" />
            </div>
            <span className="text-sm font-semibold tracking-widest uppercase">ГИОСДС</span>
            <span className="hidden md:block text-[hsl(var(--muted-foreground))] text-xs font-mono">/ Гайское месторождение</span>
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
              <button key={item.id} onClick={() => scrollTo(item.id)} className="w-full text-left px-6 py-3 text-sm border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] transition-colors">
                {item.label}
              </button>
            ))}
          </div>
        )}
      </header>

      <main className="pt-14">

        {/* HOME */}
        <section id="home" className="min-h-screen flex items-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_39px,hsl(var(--border))_40px),repeating-linear-gradient(90deg,transparent,transparent_39px,hsl(var(--border))_40px)]" style={{ opacity: 0.1 }} />
          <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--destructive))]/5 via-transparent to-[hsl(var(--primary))]/5" />

          <div className="max-w-7xl mx-auto px-6 py-24 relative z-10">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-12 bg-[hsl(var(--destructive))]" />
                <span className="text-xs font-mono text-[hsl(var(--destructive))] tracking-widest uppercase">Инцидент № 28 · 01.01.2026</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-4 tracking-tight">
                Схема аварийного
                <span className="block text-[hsl(var(--muted-foreground))] font-light text-3xl md:text-4xl mt-1">участка — позиция 28</span>
              </h1>
              <p className="text-[hsl(var(--muted-foreground))] text-base leading-relaxed mb-4 max-w-xl">
                <span className="text-[hsl(var(--foreground))] font-medium">Рудник (Гайское месторождение)</span><br />
                ПАО «Гайский горно-обогатительный комбинат»
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                {[
                  { label: "Вид аварии", value: "Пожар", icon: "Flame" },
                  { label: "Время", value: "7:15 мск", icon: "Clock" },
                  { label: "Место", value: "Гор. +210м", icon: "MapPin" },
                  { label: "Телефон КП", value: "2-100", icon: "Phone" },
                ].map((s) => (
                  <div key={s.label} className="border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-3">
                    <Icon name={s.icon} size={14} className="text-[hsl(var(--muted-foreground))] mb-1.5" />
                    <div className="text-base font-semibold font-mono">{s.value}</div>
                    <div className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => scrollTo("scheme")} className="flex items-center gap-2 px-5 py-2.5 bg-[hsl(var(--primary))] text-white text-sm font-medium hover:opacity-90 transition-opacity">
                  <Icon name="Map" size={14} />
                  Смотреть схему
                </button>
                <button onClick={() => scrollTo("documents")} className="flex items-center gap-2 px-5 py-2.5 border border-[hsl(var(--border))] text-sm font-medium hover:bg-[hsl(var(--accent))] transition-colors">
                  <Icon name="FileText" size={14} />
                  Документы
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SCHEME */}
        <section id="scheme" className="py-20 border-t border-[hsl(var(--border))]">
          <div className="max-w-7xl mx-auto px-6">
            <SectionHeader tag="02 / Схема" title="Схема аварийного участка" description="Горные выработки рудника гор. +210м. Наведите на элементы — расходы воздуха, очаг пожара, состав атмосферы. Масштаб — колесо мыши." />
            {/* Шапка схемы как в оригинале */}
            <div className="border border-gray-300 bg-white px-5 py-3 mb-2 text-center">
              <span className="font-semibold text-gray-800 text-sm font-mono">Схема аварийного участка — позиция </span>
              <span className="font-bold text-blue-700 text-sm font-mono">28</span>
              <span className="font-mono text-gray-600 text-sm ml-6">01.01.2026</span>
              <span className="font-bold text-gray-800 text-sm font-mono ml-6">7:15:00</span>
              <span className="font-mono text-gray-600 text-sm ml-2">(мск)</span>
            </div>
            <MineScheme />
            <div className="mt-2 border border-gray-200 bg-gray-50 px-5 py-2 flex items-center justify-between">
              <span className="text-xs text-gray-500 font-mono">Руководитель горноспасательных работ:</span>
              <span className="text-xs text-gray-700 font-mono italic">/И.И. Иванов/</span>
            </div>
          </div>
        </section>

        {/* DESCRIPTION */}
        <section id="description" className="py-20 border-t border-[hsl(var(--border))]">
          <div className="max-w-7xl mx-auto px-6">
            <SectionHeader tag="03 / Инцидент" title="Описание инцидента" description="Хронология событий и параметры аварийной ситуации на руднике" />
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xs font-semibold tracking-widest uppercase text-[hsl(var(--muted-foreground))] mb-4">Хронология</h3>
                {[
                  { time: "7:15", event: "Фиксация пожара в насосной гор. +210м", type: "danger" },
                  { time: "7:18", event: "Сигнал на командный пункт (тел. 2-100)", type: "warning" },
                  { time: "7:22", event: "Выезд горноспасательного отделения", type: "warning" },
                  { time: "7:35", event: "Прибытие на позицию 28", type: "info" },
                  { time: "7:45", event: "Выставление перемычек, контроль атмосферы", type: "info" },
                  { time: "8:30", event: "Локализация очага пожара", type: "safe" },
                ].map((item) => (
                  <div key={item.time} className="flex gap-4 items-start mb-3">
                    <span className="text-xs font-mono text-[hsl(var(--muted-foreground))] w-10 flex-shrink-0 pt-0.5">{item.time}</span>
                    <div className="flex items-start gap-2">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${item.type === "danger" ? "bg-red-500" : item.type === "warning" ? "bg-amber-500" : item.type === "info" ? "bg-blue-500" : "bg-green-500"}`} />
                      <span className="text-sm leading-relaxed">{item.event}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <h3 className="text-xs font-semibold tracking-widest uppercase text-[hsl(var(--muted-foreground))] mb-4">Параметры аварии</h3>
                {[
                  { label: "Наименование объекта", value: "Рудник Гайское м-ние" },
                  { label: "Вид аварии", value: "Пожар" },
                  { label: "Дата и время", value: "01.01.2026, 7:15 мск" },
                  { label: "Место аварии", value: "Насосная гор. +210м" },
                  { label: "Количество воздуха", value: "4,79 м³/с" },
                  { label: "Сечение выработки", value: "10,0 м²" },
                  { label: "Степень задымлённости", value: "средняя 5–10м" },
                  { label: "Содержание O₂", value: "19,10%" },
                  { label: "Содержание CO", value: "0,10%" },
                  { label: "Телефон КП", value: "2-100" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-[hsl(var(--border))]">
                    <span className="text-sm text-[hsl(var(--muted-foreground))]">{item.label}</span>
                    <span className="text-sm font-medium font-mono">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ANALYSIS */}
        <section id="analysis" className="py-20 border-t border-[hsl(var(--border))]">
          <div className="max-w-7xl mx-auto px-6">
            <SectionHeader tag="04 / Анализ" title="Анализ и выводы" description="Причины, факторы риска и принятые меры по инциденту на Гайском руднике" />
            <div className="grid md:grid-cols-3 gap-5 mb-8">
              {[
                { icon: "AlertTriangle", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20", title: "Первопричины", items: ["Самовозгорание маслосодержащего оборудования", "Нарушение температурного режима насосов", "Несоблюдение регламента ТО"] },
                { icon: "AlertCircle", color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", title: "Сопутствующие факторы", items: ["Недостаточная вентиляция насосной", "Задержка срабатывания датчика CO", "Ограниченная видимость (задымлённость)"] },
                { icon: "CheckCircle", color: "text-green-400", bg: "bg-green-500/10 border-green-500/20", title: "Принятые меры", items: ["Локализация перемычками", "Замена оборудования насосной", "Обновление регламентов ТО"] },
              ].map((card) => (
                <div key={card.title} className={`border ${card.bg} p-5`}>
                  <div className="flex items-center gap-2 mb-3">
                    <Icon name={card.icon} size={16} className={card.color} />
                    <h3 className="text-sm font-semibold">{card.title}</h3>
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
          </div>
        </section>

        {/* DOCUMENTS */}
        <section id="documents" className="py-20 border-t border-[hsl(var(--border))]">
          <div className="max-w-7xl mx-auto px-6">
            <SectionHeader tag="05 / Документы" title="Документы и отчёты" description="Официальная документация по расследованию инцидента на Гайском руднике" />
            <div className="space-y-1.5">
              {DOCUMENTS.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 border border-[hsl(var(--border))] bg-[hsl(var(--surface))] hover:bg-[hsl(var(--accent))] transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 border border-[hsl(var(--border))] flex items-center justify-center flex-shrink-0">
                      <Icon name="FileText" size={15} className="text-[hsl(var(--muted-foreground))]" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{doc.title}</div>
                      <div className="text-xs text-[hsl(var(--muted-foreground))] font-mono mt-0.5">{doc.type} · {doc.pages} стр. · {doc.date}</div>
                    </div>
                  </div>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[hsl(var(--muted-foreground))] border border-transparent hover:border-[hsl(var(--border))] hover:text-[hsl(var(--foreground))] transition-colors opacity-0 group-hover:opacity-100">
                    <Icon name="Download" size={12} />
                    Скачать
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CONTACTS */}
        <section id="contacts" className="py-20 border-t border-[hsl(var(--border))]">
          <div className="max-w-7xl mx-auto px-6">
            <SectionHeader tag="06 / Контакты" title="Контакты" description="Ответственные лица по данному инциденту" />
            <div className="grid md:grid-cols-3 gap-5">
              {[
                { role: "Руководитель горноспасательных работ", name: "Иванов И.И.", dept: "ВГСЧ", phone: "2-100", email: "info@giosds.ru" },
                { role: "Технический эксперт", name: "Петров П.П.", dept: "Отдел безопасности", phone: "+7 (3537) 000-002", email: "info@giosds.ru" },
                { role: "Командный пункт", name: "КП Гайский рудник", dept: "Диспетчерская служба", phone: "2-100", email: "disp@gok.ru" },
              ].map((c) => (
                <div key={c.role} className="border border-[hsl(var(--border))] bg-[hsl(var(--surface))] p-5">
                  <div className="text-xs text-[hsl(var(--muted-foreground))] uppercase tracking-widest font-semibold mb-2">{c.role}</div>
                  <div className="text-base font-semibold mb-0.5">{c.name}</div>
                  <div className="text-xs text-[hsl(var(--muted-foreground))] mb-3">{c.dept}</div>
                  <a href={`tel:${c.phone}`} className="flex items-center gap-2 text-sm hover:text-[hsl(var(--primary))] transition-colors mb-1.5">
                    <Icon name="Phone" size={12} className="text-[hsl(var(--muted-foreground))]" />
                    {c.phone}
                  </a>
                  <a href={`mailto:${c.email}`} className="flex items-center gap-2 text-sm hover:text-[hsl(var(--primary))] transition-colors">
                    <Icon name="Mail" size={12} className="text-[hsl(var(--muted-foreground))]" />
                    {c.email}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[hsl(var(--border))] py-6">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border border-[hsl(var(--destructive))] flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-[hsl(var(--destructive))]" />
            </div>
            <span className="text-xs font-mono text-[hsl(var(--muted-foreground))] tracking-widest">ГИОСДС — ГАЙСКИЙ РУДНИК — ИНЦИДЕНТ 28 — 2026</span>
          </div>
          <div className="text-xs font-mono text-[hsl(var(--muted-foreground))]">Технический характер документации</div>
        </div>
      </footer>
    </div>
  );
}
