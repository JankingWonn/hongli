"use client";

import { useMemo, useState } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  CircleMinus,
  Clock3,
  ExternalLink,
  Landmark,
  Layers3,
  Leaf,
  Menu,
  Minus,
  Scale,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  TriangleAlert,
} from "lucide-react";

type RangeKey = "1Y" | "3Y" | "5Y";

const rangeOptions: { key: RangeKey; label: string; count: number }[] = [
  { key: "1Y", label: "近1年", count: 13 },
  { key: "3Y", label: "近3年", count: 37 },
  { key: "5Y", label: "近5年", count: 61 },
];

const anchors = {
  lowVol: [100, 108, 105.9, 112.7, 132.8, 133.4, 122.7],
  shanghai: [100, 104.8, 89.2, 86.2, 96.8, 94.7, 99.1],
  dividend: [4.18, 4.52, 5.58, 5.06, 4.21, 4.54, 5.13],
  bond: [2.74, 2.61, 2.66, 2.42, 1.72, 1.56, 1.44],
};

const monthLabels = (() => {
  const values: { year: number; month: number }[] = [];
  for (let year = 2021; year <= 2026; year += 1) {
    const lastMonth = year === 2026 ? 7 : 12;
    for (let month = 1; month <= lastMonth; month += 1) values.push({ year, month });
  }
  return values;
})();

function interpolate(values: number[], year: number, month: number, wave: number) {
  const index = year - 2021;
  const start = values[index];
  const end = values[Math.min(index + 1, values.length - 1)];
  const fraction = year === 2026 ? month / 7 : month / 12;
  const wobble = Math.sin((index * 12 + month) * 1.17) * wave * Math.sin(Math.PI * fraction);
  return Number((start + (end - start) * fraction + wobble).toFixed(2));
}

const historyData = monthLabels.map(({ year, month }) => {
  const lowVol = interpolate(anchors.lowVol, year, month, 2.2);
  const shanghai = interpolate(anchors.shanghai, year, month, 2.8);
  const dividend = interpolate(anchors.dividend, year, month, 0.13);
  const bond = interpolate(anchors.bond, year, month, 0.05);
  return {
    date: `${year}-${String(month).padStart(2, "0")}`,
    tick: month === 1 || (year === 2026 && month === 7) ? `${year}` : "",
    lowVol,
    shanghai,
    dividend,
    bond,
    spread: Number((dividend - bond).toFixed(2)),
  };
});

const holdings = [
  { code: "601963", name: "重庆银行", sector: "金融", weight: 2.69 },
  { code: "600750", name: "华润江中", sector: "医药卫生", weight: 2.68 },
  { code: "600863", name: "华能蒙电", sector: "公用事业", weight: 2.66 },
  { code: "601229", name: "上海银行", sector: "金融", weight: 2.58 },
  { code: "601009", name: "南京银行", sector: "金融", weight: 2.58 },
  { code: "000001", name: "平安银行", sector: "金融", weight: 2.55 },
  { code: "601838", name: "成都银行", sector: "金融", weight: 2.4 },
  { code: "601825", name: "沪农商行", sector: "金融", weight: 2.36 },
  { code: "600350", name: "山东高速", sector: "工业", weight: 2.32 },
  { code: "600502", name: "安徽建工", sector: "工业", weight: 2.3 },
];

const valuationSignals = [
  {
    label: "TTM 股息率", value: "5.13%", percentile: 88, note: "高于近10年 88% 时段",
    health: "favorable", healthLabel: "吸引力高", healthScore: 88, scoreLabel: "收益吸引力", direction: "股息率越高，静态现金回报越有利", percentileLabel: "股息率历史分位 88%",
    position: 54, range: ["2.82%", "7.08%"], stats: ["3.73%", "4.16%", "4.72%"],
    bins: [12, 22, 41, 68, 91, 100, 82, 61, 44, 28, 17, 9],
    insight: "当前股息率已越过历史上四分之三的高息区间，现金回报吸引力较强。",
  },
  {
    label: "PE-TTM", value: "7.40×", percentile: 18, note: "估值处于偏低区间",
    health: "favorable", healthLabel: "低估", healthScore: 82, scoreLabel: "低估程度", direction: "PE 越低，估值安全边际越高", percentileLabel: "PE 历史分位 18%",
    position: 17, range: ["5.65×", "14.66×"], stats: ["7.82×", "8.66×", "9.92×"],
    bins: [9, 28, 64, 96, 100, 79, 55, 37, 23, 13, 8, 4],
    insight: "当前 PE 低于历史中枢约 15%，处在低估值一侧，但盈利周期仍需跟踪。",
  },
  {
    label: "PB", value: "0.86×", percentile: 32, note: "低于近10年 68% 时段",
    health: "favorable", healthLabel: "偏低估", healthScore: 70, scoreLabel: "低估程度", direction: "PB 越低，账面价值安全边际越高", percentileLabel: "PB 历史分位 32%",
    position: 26, range: ["0.61×", "1.58×"], stats: ["0.82×", "0.96×", "1.16×"],
    bins: [10, 31, 75, 100, 86, 70, 47, 30, 19, 11, 7, 3],
    insight: "当前 PB 靠近下四分位，账面价值维度的安全边际相对充足。",
  },
  {
    label: "股债收益差", value: "3.69%", percentile: 91, note: "风险补偿较充足",
    health: "favorable", healthLabel: "吸引力高", healthScore: 93, scoreLabel: "股债吸引力", direction: "收益差越高，相对国债的风险补偿越充足", percentileLabel: "收益差历史分位 91%",
    position: 90, range: ["0.03%", "4.11%"], stats: ["1.23%", "1.82%", "2.63%"],
    bins: [7, 19, 38, 73, 100, 95, 72, 53, 34, 20, 11, 5],
    insight: "收益差接近历史极高区域，相较国债，红利资产提供了更厚的静态补偿。",
  },
  {
    label: "当前回撤", value: "-14.8%", percentile: 72, note: "回撤深度分位 72%",
    health: "favorable", healthLabel: "机会偏高", healthScore: 72, scoreLabel: "逆向机会", direction: "按回撤绝对值判断：越深通常越便宜，但风险同步上升", percentileLabel: "回撤深度历史分位 72%", trendScore: 38, trendLabel: "趋势偏弱",
    position: 47, range: ["0%", "-31.6%"], stats: ["-2.5%", "-6.4%", "-12.1%"],
    bins: [100, 81, 65, 51, 39, 31, 23, 17, 12, 8, 5, 3],
    insight: "回撤已经深于多数历史时段，折价和潜在修复空间随之增加。",
    trendInsight: "深回撤也说明下跌趋势尚未完全修复；极端回撤可能包含基本面或市场状态变化。",
  },
  {
    label: "回调时长", value: "54日", percentile: 63, note: "时长分位 63%",
    health: "neutral", healthLabel: "出清较充分", healthScore: 63, scoreLabel: "时间出清度", direction: "回调越久，筹码出清通常越充分，但不会自动触发反转", percentileLabel: "回调时长历史分位 63%", trendScore: 42, trendLabel: "企稳待确认",
    position: 37, range: ["0日", "146日"], stats: ["11日", "29日", "49日"],
    bins: [100, 82, 64, 48, 35, 27, 19, 14, 10, 7, 5, 3],
    insight: "本轮调整已超过典型回调时长，情绪和筹码的时间出清较为充分。",
    trendInsight: "时间本身不是买入信号；持续时间过长也可能代表弱势趋势仍在延续。",
  },
  {
    label: "MA120 乖离", value: "-6.3%", percentile: 21, note: "短线仍在弱势区",
    health: "favorable", healthLabel: "超跌机会", healthScore: 79, scoreLabel: "向上回归机会", direction: "负乖离绝对值越大，向上回归空间越高；正乖离则相反", percentileLabel: "有符号乖离率历史分位 21%", trendScore: 38, trendLabel: "趋势偏弱",
    position: 39, range: ["-24.6%", "+22.8%"], stats: ["-4.8%", "+0.6%", "+5.9%"],
    bins: [5, 10, 22, 46, 78, 100, 96, 71, 43, 24, 12, 6],
    insight: "当前为负乖离，且处在历史偏低区域，向上均值回归的潜在空间增加。",
    trendInsight: "价格仍低于 MA120，趋势确认度较低；向零轴收敛或重新站上均线才是修复信号。",
  },
];

function RangeTabs({ range, onChange }: { range: RangeKey; onChange: (value: RangeKey) => void }) {
  return (
    <div className="range-tabs" role="group" aria-label="选择时间范围">
      {rangeOptions.map((option) => (
        <button
          type="button"
          key={option.key}
          className={range === option.key ? "active" : ""}
          onClick={() => onChange(option.key)}
          aria-pressed={range === option.key}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tooltip">
      <div className="tooltip-date">{label}</div>
      {payload.map((item: any) => (
        <div className="tooltip-row" key={item.dataKey}>
          <span className="tooltip-dot" style={{ background: item.color }} />
          <span>{item.name}</span>
          <strong>{Number(item.value).toFixed(2)}{item.dataKey === "lowVol" || item.dataKey === "shanghai" ? "" : "%"}</strong>
        </div>
      ))}
    </div>
  );
}

function SignalRow({ signal }: { signal: (typeof valuationSignals)[number] }) {
  const tooltipId = `signal-${signal.label.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, "")}`;
  const HealthIcon = signal.health === "favorable" ? CheckCircle2 : signal.health === "neutral" ? CircleMinus : TriangleAlert;
  const hasTrend = "trendScore" in signal && typeof signal.trendScore === "number";
  return (
    <div
      className={`signal-row health-${signal.health}${hasTrend ? " dual-signal" : ""}`}
      tabIndex={0}
      aria-describedby={tooltipId}
      aria-label={`${signal.label}，当前 ${signal.value}，判读为${signal.healthLabel}，近10年 ${signal.percentile}% 分位。聚焦查看历史分布。`}
    >
      <div className="signal-copy">
        <span>{signal.label} <CircleHelp size={11} aria-hidden="true" /></span>
        <strong className="raw-signal-value">{signal.value}</strong>
      </div>
      <div className="raw-reading">
        <span>{signal.percentileLabel}</span>
        <span>{signal.direction}</span>
      </div>
      <div className={hasTrend ? "dimension-readings dual" : "dimension-readings"}>
        <div className="dimension-reading opportunity">
          <span><HealthIcon size={10} />{signal.scoreLabel}</span>
          <i><b style={{ width: `${signal.healthScore}%` }} /></i>
          <strong>{signal.healthScore}</strong>
          <em>{signal.healthLabel}</em>
        </div>
        {hasTrend && (
          <div className="dimension-reading trend">
            <span><TriangleAlert size={10} />趋势确认</span>
            <i><b style={{ width: `${signal.trendScore}%` }} /></i>
            <strong>{signal.trendScore}</strong>
            <em>{signal.trendLabel}</em>
          </div>
        )}
      </div>
      <div className="signal-popover" id={tooltipId} role="tooltip">
        <div className="popover-head">
          <div>
            <span>近10年历史分布</span>
            <strong>{signal.label}</strong>
          </div>
          <div className={`popover-current ${signal.health}`}>
            <span>当前</span>
            <div><strong>{signal.value}</strong><span className={`health-badge ${signal.health}`}><HealthIcon size={10} />{signal.healthLabel}</span></div>
          </div>
        </div>
        <div className="direction-rule"><span>判读规则</span><strong>{signal.direction}</strong></div>
        <div className={hasTrend ? "popover-dimensions dual" : "popover-dimensions"}>
          <div className="popover-dimension opportunity">
            <span>{signal.scoreLabel}</span><strong>{signal.healthScore}<small>/100</small></strong>
            <i><b style={{ width: `${signal.healthScore}%` }} /></i>
          </div>
          {hasTrend && (
            <div className="popover-dimension trend">
              <span>趋势确认</span><strong>{signal.trendScore}<small>/100</small></strong>
              <i><b style={{ width: `${signal.trendScore}%` }} /></i>
            </div>
          )}
        </div>
        <div className="distribution-chart" aria-label={`${signal.label}近10年历史频数分布`}>
          <div className="distribution-bars">
            {signal.bins.map((height, index) => (
              <i key={index} style={{ height: `${height}%` }} className={index / signal.bins.length * 100 <= signal.position ? "passed" : ""} />
            ))}
          </div>
          <div className={`current-marker ${signal.health}`} style={{ left: `${signal.position}%` }}>
            <span>当前</span><i />
          </div>
        </div>
        <div className="distribution-axis"><span>{signal.range[0]}</span><span>{signal.range[1]}</span></div>
        <div className="quartile-grid">
          <div><span>25% 分位</span><strong>{signal.stats[0]}</strong></div>
          <div><span>中位数</span><strong>{signal.stats[1]}</strong></div>
          <div><span>75% 分位</span><strong>{signal.stats[2]}</strong></div>
        </div>
        <div className={`popover-insight ${signal.health}`}><HealthIcon size={14} /><p><strong>机会解读：</strong>{signal.insight}</p></div>
        {hasTrend && <div className="popover-insight caution"><TriangleAlert size={14} /><p><strong>趋势解读：</strong>{signal.trendInsight}</p></div>}
        <div className="popover-foot"><span>日度观察值 · 近10年</span><strong>{signal.percentileLabel}</strong></div>
      </div>
    </div>
  );
}

export default function Home() {
  const [range, setRange] = useState<RangeKey>("5Y");
  const [menuOpen, setMenuOpen] = useState(false);

  const chartData = useMemo(() => {
    const count = rangeOptions.find((item) => item.key === range)?.count ?? 61;
    return historyData.slice(-count);
  }, [range]);

  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="稳稳红利首页">
          <span className="brand-mark"><Leaf size={19} strokeWidth={2.3} /></span>
          <span>
            <strong>稳稳红利</strong>
            <small>DIVIDEND COMPASS</small>
          </span>
        </a>
        <nav className={menuOpen ? "nav-links open" : "nav-links"} aria-label="页面导航">
          <a href="#performance">走势</a>
          <a href="#valuation">估值</a>
          <a href="#holdings">持仓</a>
          <a href="#method">方法</a>
        </nav>
        <div className="header-actions">
          <div className="data-status"><span /> 数据更新于 2026-07-08</div>
          <button className="menu-button" type="button" onClick={() => setMenuOpen(!menuOpen)} aria-label="打开导航" aria-expanded={menuOpen}>
            <Menu size={21} />
          </button>
        </div>
      </header>

      <main id="top">
        <section className="hero-section">
          <div className="hero-copy">
            <div className="eyebrow"><ShieldCheck size={15} /> 中证红利低波动指数 · H30269</div>
            <h1>在波动里，寻找<br /><em>可以拿得住</em>的价值。</h1>
            <p>用股息率、估值分位与股债收益差，观察红利资产此刻的长期配置性价比。</p>
            <div className="hero-meta">
              <span><Layers3 size={15} /> 50 只成分股</span>
              <span><CalendarDays size={15} /> 10 年分位口径</span>
              <a href="https://www.csindex.com.cn/" target="_blank" rel="noreferrer">中证指数数据源 <ExternalLink size={13} /></a>
            </div>
          </div>
          <div className="hero-quote" aria-label="价值投资名言">
            <BookOpen size={20} />
            <blockquote>“价格是你付出的，价值是你得到的。”</blockquote>
            <cite>— 沃伦·巴菲特</cite>
          </div>
        </section>

        <section className="metric-strip" aria-label="核心指标">
          <article className="primary-metric">
            <div className="metric-label"><TrendingUp size={17} /> 今年收益率 <span className="as-of">截至 07/08</span></div>
            <div className="metric-value negative">-8.01<span>%</span></div>
            <div className="metric-foot negative"><ArrowDownRight size={15} /> 近1月 -6.15%</div>
          </article>
          <article>
            <div className="metric-label"><Leaf size={17} /> 当前 TTM 股息率 <CircleHelp size={14} title="过去12个月成分股现金分红与指数市值之比" /></div>
            <div className="metric-value positive">5.13<span>%</span></div>
            <div className="metric-foot positive"><ArrowUpRight size={15} /> 近10年 88% 分位</div>
          </article>
          <article>
            <div className="metric-label"><Scale 