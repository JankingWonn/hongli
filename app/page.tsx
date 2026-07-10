"use client";

import { useEffect, useMemo, useState } from "react";
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

const valueQuotes = [
  { text: "价格是你付出的，价值是你得到的。", author: "沃伦·巴菲特" },
  { text: "短期市场是投票机，长期市场是称重机。", author: "本杰明·格雷厄姆" },
  { text: "大钱不在买卖中赚取，而在等待中赚取。", author: "查理·芒格" },
  { text: "时间是你的朋友，冲动是你的敌人。", author: "约翰·博格" },
  { text: "知道你持有什么，也要知道为什么持有。", author: "彼得·林奇" },
];

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
    health: "favorable", healthLabel: "吸引力高", healthScore: 88, scoreLabel: "收益吸引力", shortScoreLabel: "吸引力", direction: "股息率越高，静态现金回报越有利", percentileLabel: "股息率历史分位 88%",
    position: 54, range: ["2.82%", "7.08%"], stats: ["3.73%", "4.16%", "4.72%"],
    bins: [12, 22, 41, 68, 91, 100, 82, 61, 44, 28, 17, 9],
    insight: "当前股息率已越过历史上四分之三的高息区间，现金回报吸引力较强。",
  },
  {
    label: "PE-TTM", value: "7.40×", percentile: 18, note: "估值处于偏低区间",
    health: "favorable", healthLabel: "低估", healthScore: 82, scoreLabel: "低估程度", shortScoreLabel: "低估", direction: "PE 越低，估值安全边际越高", percentileLabel: "PE 历史分位 18%",
    position: 17, range: ["5.65×", "14.66×"], stats: ["7.82×", "8.66×", "9.92×"],
    bins: [9, 28, 64, 96, 100, 79, 55, 37, 23, 13, 8, 4],
    insight: "当前 PE 低于历史中枢约 15%，处在低估值一侧，但盈利周期仍需跟踪。",
  },
  {
    label: "PB", value: "0.86×", percentile: 32, note: "低于近10年 68% 时段",
    health: "favorable", healthLabel: "偏低估", healthScore: 70, scoreLabel: "低估程度", shortScoreLabel: "低估", direction: "PB 越低，账面价值安全边际越高", percentileLabel: "PB 历史分位 32%",
    position: 26, range: ["0.61×", "1.58×"], stats: ["0.82×", "0.96×", "1.16×"],
    bins: [10, 31, 75, 100, 86, 70, 47, 30, 19, 11, 7, 3],
    insight: "当前 PB 靠近下四分位，账面价值维度的安全边际相对充足。",
  },
  {
    label: "股债收益差", value: "3.69%", percentile: 91, note: "风险补偿较充足",
    health: "favorable", healthLabel: "吸引力高", healthScore: 93, scoreLabel: "股债吸引力", shortScoreLabel: "股债", direction: "收益差越高，相对国债的风险补偿越充足", percentileLabel: "收益差历史分位 91%",
    position: 90, range: ["0.03%", "4.11%"], stats: ["1.23%", "1.82%", "2.63%"],
    bins: [7, 19, 38, 73, 100, 95, 72, 53, 34, 20, 11, 5],
    insight: "收益差接近历史极高区域，相较国债，红利资产提供了更厚的静态补偿。",
  },
  {
    label: "当前回撤", value: "-14.8%", percentile: 72, note: "回撤深度分位 72%",
    health: "favorable", healthLabel: "机会偏高", healthScore: 72, scoreLabel: "逆向机会", shortScoreLabel: "机会", direction: "按回撤绝对值判断：越深通常越便宜，但风险同步上升", percentileLabel: "回撤深度历史分位 72%", trendScore: 38, trendLabel: "趋势偏弱",
    position: 47, range: ["0%", "-31.6%"], stats: ["-2.5%", "-6.4%", "-12.1%"],
    bins: [100, 81, 65, 51, 39, 31, 23, 17, 12, 8, 5, 3],
    insight: "回撤已经深于多数历史时段，折价和潜在修复空间随之增加。",
    trendInsight: "深回撤也说明下跌趋势尚未完全修复；极端回撤可能包含基本面或市场状态变化。",
  },
  {
    label: "回调时长", value: "54日", percentile: 63, note: "时长分位 63%",
    health: "neutral", healthLabel: "出清较充分", healthScore: 63, scoreLabel: "时间出清度", shortScoreLabel: "出清", direction: "回调越久，筹码出清通常越充分，但不会自动触发反转", percentileLabel: "回调时长历史分位 63%", trendScore: 42, trendLabel: "企稳待确认",
    position: 37, range: ["0日", "146日"], stats: ["11日", "29日", "49日"],
    bins: [100, 82, 64, 48, 35, 27, 19, 14, 10, 7, 5, 3],
    insight: "本轮调整已超过典型回调时长，情绪和筹码的时间出清较为充分。",
    trendInsight: "时间本身不是买入信号；持续时间过长也可能代表弱势趋势仍在延续。",
  },
  {
    label: "MA120 乖离", value: "-6.3%", percentile: 21, note: "短线仍在弱势区",
    health: "favorable", healthLabel: "超跌机会", healthScore: 79, scoreLabel: "向上回归机会", shortScoreLabel: "回归", direction: "负乖离绝对值越大，向上回归空间越高；正乖离则相反", percentileLabel: "有符号乖离率历史分位 21%", trendScore: 38, trendLabel: "趋势偏弱",
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
        <span>历史分位 P{signal.percentile}</span>
        <span className="hover-cue">悬停详情 <CircleHelp size={9} /></span>
      </div>
      <div className={hasTrend ? "dimension-readings dual" : "dimension-readings"}>
        <div className="dimension-reading opportunity">
          <span><HealthIcon size={10} />{signal.shortScoreLabel}</span>
          <i><b style={{ width: `${signal.healthScore}%` }} /></i>
          <strong>{signal.healthScore}</strong>
        </div>
        {hasTrend && (
          <div className="dimension-reading trend">
            <span><TriangleAlert size={10} />趋势</span>
            <i><b style={{ width: `${signal.trendScore}%` }} /></i>
            <strong>{signal.trendScore}</strong>
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
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    try {
      const previous = Number(sessionStorage.getItem("wenwen-hongli-last-quote"));
      const candidates = valueQuotes.map((_, index) => index).filter((index) => index !== previous);
      const next = candidates[Math.floor(Math.random() * candidates.length)] ?? 0;
      sessionStorage.setItem("wenwen-hongli-last-quote", String(next));
      setQuoteIndex(next);
    } catch {
      setQuoteIndex(Math.floor(Math.random() * valueQuotes.length));
    }
  }, []);

  const activeQuote = valueQuotes[quoteIndex];

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
            <blockquote>“{activeQuote.text}”</blockquote>
            <cite>— {activeQuote.author}</cite>
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

        <section className="decision-snapshot" id="method" aria-labelledby="decision-title">
          <div className="snapshot-header">
            <div>
              <span className="section-kicker">INVESTMENT SNAPSHOT</span>
              <h2 id="decision-title">当前投资决策快照</h2>
              <p>把“是否便宜”和“是否已经企稳”放在同一画面，但分开判断</p>
            </div>
            <div className="snapshot-meta">
              <span className="status-dot">数据有效</span>
              <span>H30269 · 2026-07-08</span>
            </div>
          </div>

          <div className="snapshot-conclusion">
            <div className="verdict-panel">
              <span className="verdict-label"><Target size={15} /> 当前建议</span>
              <h3>分批建立基础仓位，<br />趋势确认后再加仓。</h3>
              <p>股息率、估值与超跌程度提供较好的逆向赔率；但均线与价格状态尚未确认反转，不宜把“便宜”直接等同于“见底”。</p>
              <div className="action-sequence" aria-label="建议操作顺序">
                <span><i>1</i>建立底仓</span><ChevronRight size={14} />
                <span><i>2</i>分批配置</span><ChevronRight size={14} />
                <span><i>3</i>确认后加仓</span>
              </div>
            </div>

            <div className="score-board" aria-label="综合判断分数">
              <article className="score-card opportunity">
                <div><span><CheckCircle2 size={14} /> 逆向性价比</span><em>偏高</em></div>
                <strong>78<small>/100</small></strong>
                <i><b /></i>
                <p>估值、股息与回撤带来的潜在修复空间</p>
              </article>
              <article className="score-card trend">
                <div><span><TriangleAlert size={14} /> 趋势确认度</span><em>偏弱</em></div>
                <strong>39<small>/100</small></strong>
                <i><b /></i>
                <p>等待乖离率收敛、站回 MA120 或出现企稳信号</p>
              </article>
            </div>
          </div>

          <div className="snapshot-signal-heading">
            <div><BarChart3 size={17} /><strong>七项核心判断</strong><span>默认即可截图 · 悬停查看历史分布</span></div>
            <div className="snapshot-legend">
              <span className="legend-status favorable"><CheckCircle2 size={10} />逆向机会</span>
              <span className="legend-status caution"><TriangleAlert size={10} />趋势风险</span>
              <span className="legend-status neutral"><CircleMinus size={10} />原始分位</span>
            </div>
          </div>

          <div className="snapshot-signal-groups">
            <section className="signal-group valuation-group" aria-label="估值与股息指标">
              <div className="signal-group-title"><span>估值与股息</span><small>4 项 · 越便宜越有利</small></div>
              <div className="snapshot-signal-grid four">
                {valuationSignals.slice(0, 4).map((signal) => <SignalRow key={signal.label} signal={signal} />)}
              </div>
            </section>
            <section className="signal-group technical-group" aria-label="回撤与趋势指标">
              <div className="signal-group-title"><span>回撤与趋势</span><small>3 项 · 机会/趋势双维</small></div>
              <div className="snapshot-signal-grid three">
                {valuationSignals.slice(4).map((signal) => <SignalRow key={signal.label} signal={signal} />)}
              </div>
            </section>
          </div>

          <div className="snapshot-footer">
            <details>
              <summary>查看评分方法 <ChevronRight size={14} /></summary>
              <p>逆向性价比分衡量“是否便宜、是否具备修复空间”；趋势确认分衡量“是否已经止跌转强”。二者分开计算，避免把超跌直接等同于见底。</p>
            </details>
            <p><ShieldCheck size={14} /> 研究信号，不构成个性化投资建议。请结合持有期限与风险承受能力。</p>
          </div>
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
                <div><span>5年国债</span><strong>1.44%</strong></div>
                <span className="equals">=</span>
                <div className="spread-result"><span>收益差</span><strong>3.69%</strong></div>
              </div>
              <div className="chart-wrap yield-chart" aria-label="股息率、国债收益率及收益差走势图">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 12, right: 10, left: -18, bottom: 0 }}>
                    <CartesianGrid stroke="#dfe5df" vertical={false} strokeDasharray="3 6" />
                    <XAxis dataKey="date" tickFormatter={(value) => value.slice(0, 4)} minTickGap={52} axisLine={false} tickLine={false} tick={{ fill: "#7a847d", fontSize: 12 }} />
                    <YAxis domain={[0, 7]} tickFormatter={(value) => `${value}%`} axisLine={false} tickLine={false} tick={{ fill: "#7a847d", fontSize: 12 }} />
                    <Tooltip content={<ChartTooltip />} cursor={{ stroke: "#9da9a1", strokeDasharray: "4 4" }} />
                    <Legend iconType="plainline" wrapperStyle={{ fontSize: 12, color: "#4f5952", paddingTop: 8 }} />
                    <Area type="monotone" dataKey="spread" name="股债收益差" fill="#e9dfc7" fillOpacity={0.72} stroke="#b58a37" strokeWidth={1.8} dot={false} />
                    <Line type="monotone" dataKey="dividend" name="TTM 股息率" stroke="#c15b32" strokeWidth={2.8} dot={false} />
                    <Line type="monotone" dataKey="bond" name="5年期国债" stroke="#274b43" strokeWidth={2.2} dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <div className="insight-note"><Sparkles size={17} /> 当前收益差位于近10年 <strong>91% 分位</strong>，静态比较对红利资产更有利。</div>
            </section>

            <section className="holdings-section" id="holdings">
              <div className="section-heading holdings-heading">
                <div>
                  <span className="section-kicker">CONSTITUENTS</span>
                  <h2>当前核心持仓</h2>
                  <p>前十大权重合计 25.12%，单一成分股权重较为分散</p>
                </div>
                <span className="date-badge"><Clock3 size={14} /> 权重截至 2026-05-29</span>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>排名</th><th>证券名称</th><th>代码</th><th>行业</th><th>指数权重</th></tr>
                  </thead>
                  <tbody>
                    {holdings.map((holding, index) => (
                      <tr key={holding.code}>
                        <td><span className="rank">{String(index + 1).padStart(2, "0")}</span></td>
                        <td><strong>{holding.name}</strong></td>
                        <td className="code">{holding.code}</td>
                        <td><span className="sector-tag">{holding.sector}</span></td>
                        <td>
                          <div className="weight-cell"><span className="weight-bar"><i style={{ width: `${(holding.weight / 2.7) * 100}%` }} /></span><strong>{holding.weight.toFixed(2)}%</strong></div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <a className="text-link" href="https://www.csindex.com.cn/#/indices/family/detail?indexCode=H30269" target="_blank" rel="noreferrer">
                查看中证指数官方资料 <ChevronRight size={15} />
              </a>
            </section>
          </div>

        </div>
      </main>

      <footer>
        <div className="footer-brand"><Leaf size={16} /> 稳稳红利</div>
        <p>数据口径：中证红利低波动指数（H30269）；指数与成分股数据参考中证指数，国债收益率参考中债收益率曲线。页面数据为研究快照。</p>
        <div className="footer-links">
          <a href="https://www.csindex.com.cn/" target="_blank" rel="noreferrer">中证指数</a>
          <a href="https://yield.chinabond.com.cn/" target="_blank" rel="noreferrer">中国债券信息网</a>
        </div>
      </footer>
    </div>
  );
}
