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
  ChevronRight,
  CircleHelp,
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
    label: "TTM 股息率", value: "5.13%", percentile: 88, note: "高于近10年 88% 时段", tone: "good",
    position: 54, range: ["2.82%", "7.08%"], stats: ["3.73%", "4.16%", "4.72%"],
    bins: [12, 22, 41, 68, 91, 100, 82, 61, 44, 28, 17, 9],
    insight: "当前股息率已越过历史上四分之三的高息区间，现金回报吸引力较强。",
  },
  {
    label: "PE-TTM", value: "7.40×", percentile: 18, note: "估值处于偏低区间", tone: "good",
    position: 17, range: ["5.65×", "14.66×"], stats: ["7.82×", "8.66×", "9.92×"],
    bins: [9, 28, 64, 96, 100, 79, 55, 37, 23, 13, 8, 4],
    insight: "当前 PE 低于历史中枢约 15%，处在低估值一侧，但盈利周期仍需跟踪。",
  },
  {
    label: "PB", value: "0.86×", percentile: 32, note: "低于近10年 68% 时段", tone: "good",
    position: 26, range: ["0.61×", "1.58×"], stats: ["0.82×", "0.96×", "1.16×"],
    bins: [10, 31, 75, 100, 86, 70, 47, 30, 19, 11, 7, 3],
    insight: "当前 PB 靠近下四分位，账面价值维度的安全边际相对充足。",
  },
  {
    label: "股债收益差", value: "3.69%", percentile: 91, note: "风险补偿较充足", tone: "good",
    position: 90, range: ["0.03%", "4.11%"], stats: ["1.23%", "1.82%", "2.63%"],
    bins: [7, 19, 38, 73, 100, 95, 72, 53, 34, 20, 11, 5],
    insight: "收益差接近历史极高区域，相较国债，红利资产提供了更厚的静态补偿。",
  },
  {
    label: "当前回撤", value: "-14.8%", percentile: 72, note: "回撤深度分位 72%", tone: "watch",
    position: 47, range: ["0%", "-31.6%"], stats: ["-2.5%", "-6.4%", "-12.1%"],
    bins: [100, 81, 65, 51, 39, 31, 23, 17, 12, 8, 5, 3],
    insight: "回撤已经深于多数历史时段，但距离极端压力区仍有空间，适合控制分批节奏。",
  },
  {
    label: "回调时长", value: "54日", percentile: 63, note: "时长分位 63%", tone: "watch",
    position: 37, range: ["0日", "146日"], stats: ["11日", "29日", "49日"],
    bins: [100, 82, 64, 48, 35, 27, 19, 14, 10, 7, 5, 3],
    insight: "本轮调整已超过典型回调时长，时间维度开始有利，但尚未进入极端磨底区。",
  },
  {
    label: "MA120 乖离", value: "-6.3%", percentile: 21, note: "短线仍在弱势区", tone: "watch",
    position: 39, range: ["-24.6%", "+22.8%"], stats: ["-4.8%", "+0.6%", "+5.9%"],
    bins: [5, 10, 22, 46, 78, 100, 96, 71, 43, 24, 12, 6],
    insight: "价格明显低于中期均线，超跌特征出现；趋势确认仍需等待乖离率向零轴收敛。",
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
  return (
    <div
      className="signal-row"
      tabIndex={0}
      aria-describedby={tooltipId}
      aria-label={`${signal.label}，当前 ${signal.value}，近10年 ${signal.percentile}% 分位。聚焦查看历史分布。`}
    >
      <div className="signal-copy">
        <span>{signal.label} <CircleHelp size={11} aria-hidden="true" /></span>
        <strong>{signal.value}</strong>
      </div>
      <div className="signal-track" aria-label={`${signal.label}，10年分位 ${signal.percentile}%`}>
        <span className={signal.tone} style={{ width: `${signal.percentile}%` }} />
        <i className="signal-current-dot" style={{ left: `${signal.percentile}%` }} />
      </div>
      <div className="signal-note">
        <span>{signal.note}</span>
        <span>{signal.percentile}% 分位</span>
      </div>
      <div className="signal-popover" id={tooltipId} role="tooltip">
        <div className="popover-head">
          <div>
            <span>近10年历史分布</span>
            <strong>{signal.label}</strong>
          </div>
          <div className="popover-current"><span>当前</span><strong>{signal.value}</strong></div>
        </div>
        <div className="distribution-chart" aria-label={`${signal.label}近10年历史频数分布`}>
          <div className="distribution-bars">
            {signal.bins.map((height, index) => (
              <i key={index} style={{ height: `${height}%` }} className={index / signal.bins.length * 100 <= signal.position ? "passed" : ""} />
            ))}
          </div>
          <div className="current-marker" style={{ left: `${signal.position}%` }}>
            <span>当前</span><i />
          </div>
        </div>
        <div className="distribution-axis"><span>{signal.range[0]}</span><span>{signal.range[1]}</span></div>
        <div className="quartile-grid">
          <div><span>25% 分位</span><strong>{signal.stats[0]}</strong></div>
          <div><span>中位数</span><strong>{signal.stats[1]}</strong></div>
          <div><span>75% 分位</span><strong>{signal.stats[2]}</strong></div>
        </div>
        <p className="popover-insight">{signal.insight}</p>
        <div className="popover-foot"><span>日度观察值 · 近10年</span><strong>{signal.percentile}% 分位</strong></div>
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
            <div className="metric-label"><Scale size={17} /> 股债收益差</div>
            <div className="metric-value">3.69<span>%</span></div>
            <div className="metric-foot">股息率 − 5年期国债</div>
          </article>
          <article>
            <div className="metric-label"><Landmark size={17} /> 5年期国债收益率</div>
            <div className="metric-value">1.44<span>%</span></div>
            <div className="metric-foot">中债收益率曲线</div>
          </article>
        </section>

        <div className="content-grid">
          <div className="main-column">
            <section className="data-panel" id="performance">
              <div className="section-heading">
                <div>
                  <span className="section-kicker">PERFORMANCE</span>
                  <h2>红利低波 vs 上证指数</h2>
                  <p>以区间起点归一为 100，观察相对强弱与持有体验</p>
                </div>
                <RangeTabs range={range} onChange={setRange} />
              </div>
              <div className="chart-summary">
                <span><i className="legend-line lowvol" /> 红利低波 <strong>+22.7%</strong></span>
                <span><i className="legend-line shanghai" /> 上证指数 <strong>-0.9%</strong></span>
                <span className="outperformance">区间超额 +23.6%</span>
              </div>
              <div className="chart-wrap" aria-label="红利低波与上证指数叠加走势图">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 12, right: 10, left: -14, bottom: 0 }}>
                    <CartesianGrid stroke="#dfe5df" vertical={false} strokeDasharray="3 6" />
                    <XAxis dataKey="date" tickFormatter={(value) => value.slice(0, 4)} minTickGap={52} axisLine={false} tickLine={false} tick={{ fill: "#7a847d", fontSize: 12 }} />
                    <YAxis domain={["dataMin - 6", "dataMax + 5"]} axisLine={false} tickLine={false} tick={{ fill: "#7a847d", fontSize: 12 }} />
                    <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#9da9a1", strokeDasharray: "4 4" }} />
                    <Line type="monotone" dataKey="lowVol" name="红利低波" stroke="#c15b32" strokeWidth={3} dot={false} activeDot={{ r: 4, fill: "#c15b32", stroke: "#fff", strokeWidth: 2 }} />
                    <Line type="monotone" dataKey="shanghai" name="上证指数" stroke="#274b43" strokeWidth={2.2} dot={false} activeDot={{ r: 4, fill: "#274b43", stroke: "#fff", strokeWidth: 2 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-caption"><CircleHelp size={14} /> 走势为月度观察值，用于展示相对表现；历史收益不预示未来表现。</div>
            </section>

            <aside className="quote-band">
              <div className="quote-glyph">“</div>
              <p>短期市场是一台投票机，长期则是一台称重机。</p>
              <span>— 本杰明·格雷厄姆</span>
              <div className="quote-line" />
            </aside>

            <section className="data-panel" id="valuation">
              <div className="section-heading">
                <div>
                  <span className="section-kicker">DIVIDEND YIELD</span>
                  <h2>股息率与无风险收益率</h2>
                  <p>收益差越宽，权益资产相对国债的静态风险补偿越充足</p>
                </div>
                <RangeTabs range={range} onChange={setRange} />
              </div>
              <div className="yield-callout">
                <div><span>当前股息率</span><strong>5.13%</strong></div>
                <Minus size={17} />
                <div><span>5年国债</span><strong>1