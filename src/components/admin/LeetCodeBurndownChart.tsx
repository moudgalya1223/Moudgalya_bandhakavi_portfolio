'use client';

import { useState, useMemo } from 'react';
import { LeetCodeProblem } from '@/lib/firestore';
import {
  TrendingDown,
  Calendar,
  Zap,
  Activity,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

interface Props {
  problems: LeetCodeProblem[];
}

export default function LeetCodeBurndownChart({ problems }: Props) {
  const [timeframeDays, setTimeframeDays] = useState<number>(14);
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);

  // ─── 1. Build Historical Daily Timeline & Recurrent State Model ─────────────
  const { historyData, futureData, totalScope, remainingCount, currentVelocity, etaDate, momentumScore } =
    useMemo(() => {
      const total = problems.length;
      const solved = problems.filter((p) => p.status === 'done').length;
      const remaining = problems.filter((p) => p.status !== 'done').length;

      // Group solved problems by date
      const solvedByDate: Record<string, number> = {};
      problems.forEach((p) => {
        if (p.status === 'done') {
          const dateKey = p.solvedAt
            ? new Date(p.solvedAt).toISOString().split('T')[0]
            : p.createdAt
            ? new Date(p.createdAt).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0];
          solvedByDate[dateKey] = (solvedByDate[dateKey] || 0) + 1;
        }
      });

      // Build daily timeline from (timeframeDays ago) to Today
      const history: { date: string; label: string; solvedToday: number; remaining: number }[] = [];
      const today = new Date();
      
      let cumulativeSolvedBeforeWindow = 0;
      const windowStart = new Date(today);
      windowStart.setDate(windowStart.getDate() - timeframeDays);
      const windowStartStr = windowStart.toISOString().split('T')[0];

      Object.entries(solvedByDate).forEach(([dStr, count]) => {
        if (dStr < windowStartStr) {
          cumulativeSolvedBeforeWindow += count;
        }
      });

      let runningSolved = cumulativeSolvedBeforeWindow;

      for (let i = timeframeDays; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dStr = d.toISOString().split('T')[0];
        const solvedOnDay = solvedByDate[dStr] || 0;
        runningSolved += solvedOnDay;

        const remOnDay = Math.max(0, total - runningSolved);
        history.push({
          date: dStr,
          label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          solvedToday: solvedOnDay,
          remaining: remOnDay,
        });
      }

      // ─── RECURRENT DYNAMICAL MODEL COMPUTATION ────────────────────────────
      // State Equation: h_t = tanh(W_h * h_{t-1} + W_x * [p_t, v_t] + b)
      // Velocity Equation: vHat_{t+1} = max(0, W_y * h_t + b_y)
      const tanh = (z: number) => Math.tanh(z);

      const Wh = [
        [0.75, 0.15],
        [-0.1, 0.60],
      ];
      const Wx = [
        [-0.05, 0.40],
        [-0.02, 0.50],
      ];
      const b = [0.05, 0.02];
      const Wy = [0.45, 0.85];
      const by = 0.1;

      let h = [0.2, 0.3]; // Initial momentum state

      const processedHistory = history.map((day, idx) => {
        const prevRemaining = idx > 0 ? history[idx - 1].remaining : total;
        const v_t = Math.max(0, prevRemaining - day.remaining);
        const p_t = day.remaining;
        const normP = total > 0 ? p_t / total : 0;

        const nextH0 = tanh(Wh[0][0] * h[0] + Wh[0][1] * h[1] + (Wx[0][0] * normP + Wx[0][1] * v_t) + b[0]);
        const nextH1 = tanh(Wh[1][0] * h[0] + Wh[1][1] * h[1] + (Wx[1][0] * normP + Wx[1][1] * v_t) + b[1]);
        h = [nextH0, nextH1];

        const vHat = Math.max(0, Wy[0] * h[0] + Wy[1] * h[1] + by);
        return {
          ...day,
          v_t,
          vHat: Math.round(vHat * 100) / 100,
          h: [...h],
          isForecast: false,
        };
      });

      // ─── AUTOREGRESSIVE FUTURE ROLLOUT ─────────────────────────────────────
      const future: { date: string; label: string; remaining: number; vHat: number; isForecast: boolean }[] = [];
      const currentDay = history[history.length - 1];
      let currP = currentDay ? currentDay.remaining : total;
      let forecastH = [...h];
      let forecastEta: string | null = null;
      const forecastMaxDays = 21;

      for (let k = 1; k <= forecastMaxDays; k++) {
        const fDate = new Date(today);
        fDate.setDate(fDate.getDate() + k);
        const fStr = fDate.toISOString().split('T')[0];

        const vHat = Math.max(0.1, Wy[0] * forecastH[0] + Wy[1] * forecastH[1] + by);
        currP = Math.max(0, currP - vHat);

        if (currP === 0 && !forecastEta) {
          forecastEta = fDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
        }

        const normP = total > 0 ? currP / total : 0;
        const nextH0 = tanh(Wh[0][0] * forecastH[0] + Wh[0][1] * forecastH[1] + (Wx[0][0] * normP + Wx[0][1] * vHat) + b[0]);
        const nextH1 = tanh(Wh[1][0] * forecastH[0] + Wh[1][1] * forecastH[1] + (Wx[1][0] * normP + Wx[1][1] * vHat) + b[1]);
        forecastH = [nextH0, nextH1];

        future.push({
          date: fStr,
          label: fDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
          remaining: Math.round(currP * 10) / 10,
          vHat: Math.round(vHat * 100) / 100,
          isForecast: true,
        });

        if (currP === 0) break;
      }

      // Recent 7 days average velocity
      const recent7 = history.slice(-7);
      const sumSolved7 = recent7.reduce((s, item) => s + item.solvedToday, 0);
      const vel = Math.round((sumSolved7 / 7) * 10) / 10;

      const mScore = Math.round(Math.min(100, Math.max(10, (h[0] + h[1] + 1) * 45)));

      return {
        historyData: processedHistory,
        futureData: future,
        totalScope: total,
        solvedCount: solved,
        remainingCount: remaining,
        currentVelocity: vel,
        etaDate: forecastEta || 'In Progress',
        momentumScore: mScore,
      };
    }, [problems, timeframeDays]);

  // Combine for chart plotting
  const allChartPoints = [...historyData, ...futureData];

  // SVG dimensions
  const svgWidth = 800;
  const svgHeight = 220;
  const padLeft = 40;
  const padRight = 30;
  const padTop = 20;
  const padBottom = 40;

  const maxVal = Math.max(1, totalScope);

  const getX = (idx: number) => {
    const usableW = svgWidth - padLeft - padRight;
    const step = usableW / Math.max(1, allChartPoints.length - 1);
    return padLeft + idx * step;
  };

  const getY = (val: number) => {
    const usableH = svgHeight - padTop - padBottom;
    const ratio = val / maxVal;
    return svgHeight - padBottom - ratio * usableH;
  };

  // Build SVG path strings
  const historicalPoints = historyData.map((p, idx) => `${getX(idx)},${getY(p.remaining)}`).join(' ');
  
  // Future projection starts at last historical point
  const lastHistIdx = historyData.length - 1;
  const futurePointsList = [
    `${getX(lastHistIdx)},${getY(historyData[lastHistIdx]?.remaining || 0)}`,
    ...futureData.map((p, idx) => `${getX(lastHistIdx + 1 + idx)},${getY(p.remaining)}`),
  ].join(' ');

  return (
    <div className="glass-card" style={{ marginBottom: '24px', padding: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Top Header & Toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
              padding: '8px',
              borderRadius: '8px',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <TrendingDown size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Recurrent Burndown & Forecast</h2>
              <span style={{ fontSize: '0.65rem', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '2px 8px', borderRadius: '99px', border: '1px solid rgba(16, 185, 129, 0.3)', fontWeight: 700 }}>
                RNN State Model
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Dynamic recurrent updates: <code style={{ fontSize: '0.7rem', color: '#38bdf8' }}>h_t = f(W_h h_&#123;t-1&#125; + W_x [p_t, v_t] + b)</code> &amp; <code style={{ fontSize: '0.7rem', color: '#f59e0b' }}>v_&#123;t+1&#125; = W_y h_t + b_y</code>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Timeframe selector */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', padding: '2px', border: '1px solid var(--border-color)' }}>
            {[14, 30, 60].map((days) => (
              <button
                key={days}
                onClick={() => setTimeframeDays(days)}
                style={{
                  padding: '4px 10px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: '4px',
                  border: 'none',
                  background: timeframeDays === days ? 'var(--accent-purple)' : 'transparent',
                  color: timeframeDays === days ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                {days}d
              </button>
            ))}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            {collapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>
        </div>
      </div>

      {!collapsed && (
        <>
          {/* Key Metrics Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
            <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>CURRENT VELOCITY</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Zap size={16} />
                <span>{currentVelocity} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>probs/day</span></span>
              </div>
            </div>

            <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>COMPLETION ETA</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f59e0b', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Calendar size={15} />
                <span>{etaDate}</span>
              </div>
            </div>

            <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>MOMENTUM INDEX (h_t)</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#38bdf8', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={16} />
                <span>{momentumScore}<span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/100</span></span>
              </div>
            </div>

            <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>BURNDOWN REMAINING</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#a855f7', marginTop: '2px' }}>
                {remainingCount} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>of {totalScope}</span>
              </div>
            </div>
          </div>

          {/* SVG Chart */}
          <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
              <defs>
                <linearGradient id="historyGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                const y = getY(maxVal * ratio);
                return (
                  <g key={idx}>
                    <line x1={padLeft} y1={y} x2={svgWidth - padRight} y2={y} stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                    <text x={padLeft - 8} y={y + 3} fill="var(--text-muted)" fontSize="9" textAnchor="end">
                      {Math.round(maxVal * ratio)}
                    </text>
                  </g>
                );
              })}

              {/* Ideal Burndown Line */}
              <line x1={padLeft} y1={getY(totalScope)} x2={svgWidth - padRight} y2={getY(0)} stroke="rgba(255,255,255,0.2)" strokeDasharray="4 4" strokeWidth="1.5" />

              {/* Past Historical Burndown Fill & Line */}
              {historyData.length > 0 && (
                <>
                  <polygon
                    points={`${padLeft},${getY(0)} ${historicalPoints} ${getX(lastHistIdx)},${getY(0)}`}
                    fill="url(#historyGlow)"
                  />
                  <polyline fill="none" stroke="#10b981" strokeWidth="3" points={historicalPoints} />
                </>
              )}

              {/* Future Forecast Burndown Line */}
              {futureData.length > 0 && (
                <polyline fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeDasharray="6 4" points={futurePointsList} />
              )}

              {/* Data Node Markers */}
              {allChartPoints.map((pt, idx) => {
                const cx = getX(idx);
                const cy = getY(pt.remaining);
                const isCurrentToday = idx === lastHistIdx;
                const isFc = pt.isForecast;

                return (
                  <circle
                    key={idx}
                    cx={cx}
                    cy={cy}
                    r={isCurrentToday ? 6 : isFc ? 3.5 : 4}
                    fill={isCurrentToday ? '#10b981' : isFc ? '#f59e0b' : 'var(--bg-primary)'}
                    stroke={isCurrentToday ? '#fff' : isFc ? '#f59e0b' : '#10b981'}
                    strokeWidth={isCurrentToday ? 3 : 2}
                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                );
              })}

              {/* Today Vertical Divider Line */}
              {historyData.length > 0 && (
                <line
                  x1={getX(lastHistIdx)}
                  y1={padTop}
                  x2={getX(lastHistIdx)}
                  y2={svgHeight - padBottom}
                  stroke="rgba(16, 185, 129, 0.4)"
                  strokeDasharray="2 2"
                />
              )}

              {/* X Axis Labels */}
              {allChartPoints.map((pt, idx) => {
                if (idx % Math.ceil(allChartPoints.length / 8) === 0 || idx === lastHistIdx) {
                  const cx = getX(idx);
                  return (
                    <text
                      key={idx}
                      x={cx}
                      y={svgHeight - padBottom + 16}
                      fill={idx === lastHistIdx ? '#10b981' : 'var(--text-muted)'}
                      fontSize="9"
                      fontWeight={idx === lastHistIdx ? 700 : 500}
                      textAnchor="middle"
                    >
                      {pt.label}
                    </text>
                  );
                }
                return null;
              })}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredPoint && (
              <div
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '20px',
                  background: 'rgba(15, 23, 42, 0.9)',
                  border: '1px solid var(--border-color)',
                  backdropFilter: 'blur(8px)',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                  pointerEvents: 'none',
                }}
              >
                <div style={{ fontWeight: 700, color: hoveredPoint.isForecast ? '#f59e0b' : '#10b981' }}>
                  {hoveredPoint.isForecast ? '🔮 Forecast' : '📅 Actual'} — {hoveredPoint.label}
                </div>
                <div style={{ marginTop: '2px', color: 'var(--text-secondary)' }}>
                  Remaining: <strong style={{ color: '#fff' }}>{hoveredPoint.remaining}</strong> problems
                </div>
                {hoveredPoint.vHat && (
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Predicted Velocity (&nu;&#770;): {hoveredPoint.vHat}/day
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '16px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '3px', background: '#10b981', borderRadius: '2px' }} />
              <span>Historical Burndown</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '2px', borderTop: '2px dashed #f59e0b' }} />
              <span>Recurrent Forecast (h_t state)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '2px', borderTop: '2px dashed rgba(255,255,255,0.25)' }} />
              <span>Ideal Target Pace</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
