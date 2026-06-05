const nodes: Array<{ x: number; y: number; r: number; delay: number; dur: number; drift: number }> = [
  { x: 120, y: 140, r: 8, delay: 0, dur: 9, drift: 0 },
  { x: 280, y: 90, r: 6, delay: 1.4, dur: 11, drift: 1 },
  { x: 440, y: 200, r: 10, delay: 2.6, dur: 10, drift: 2 },
  { x: 620, y: 110, r: 7, delay: 0.8, dur: 12, drift: 3 },
  { x: 800, y: 250, r: 9, delay: 2.1, dur: 9, drift: 0 },
  { x: 980, y: 130, r: 6, delay: 3.4, dur: 11, drift: 1 },
  { x: 1140, y: 320, r: 8, delay: 1.6, dur: 10, drift: 2 },
  { x: 200, y: 380, r: 7, delay: 4.0, dur: 13, drift: 3 },
  { x: 380, y: 460, r: 9, delay: 2.7, dur: 10, drift: 0 },
  { x: 560, y: 380, r: 6, delay: 0.5, dur: 12, drift: 1 },
  { x: 740, y: 480, r: 10, delay: 1.9, dur: 9, drift: 2 },
  { x: 920, y: 420, r: 7, delay: 0, dur: 11, drift: 3 },
  { x: 1080, y: 540, r: 8, delay: 3.1, dur: 10, drift: 0 },
  { x: 80, y: 280, r: 6, delay: 1.2, dur: 12, drift: 1 },
  { x: 1220, y: 180, r: 7, delay: 2.4, dur: 11, drift: 2 },
]

const bonds: Array<[number, number]> = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6],
  [0, 13], [13, 7], [7, 8], [8, 9], [9, 10], [10, 11], [11, 12], [12, 6],
  [2, 8], [3, 9], [4, 10], [5, 11], [1, 13], [14, 5], [14, 6],
]

export function PeptideNetwork() {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <svg
        viewBox="0 0 1280 600"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full peptide-network"
      >
        <defs>
          <radialGradient id="node-glow">
            <stop offset="0%" stopColor="#26bfbf" stopOpacity="0.95" />
            <stop offset="60%" stopColor="#0ea5a5" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#0ea5a5" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="signal-glow">
            <stop offset="0%" stopColor="#e6f7f7" stopOpacity="1" />
            <stop offset="60%" stopColor="#26bfbf" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#26bfbf" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Bonds — flowing dash + opacity pulse */}
        <g className="bonds">
          {bonds.map(([a, b], i) => {
            const na = nodes[a]
            const nb = nodes[b]
            return (
              <line
                key={i}
                x1={na.x}
                y1={na.y}
                x2={nb.x}
                y2={nb.y}
                stroke="#26bfbf"
                strokeWidth="1.5"
                strokeDasharray="4 10"
                style={{
                  animation: `bondFlow ${4 + (i % 4)}s linear infinite, bondPulse ${
                    7 + (i % 5)
                  }s ease-in-out ${i * 0.3}s infinite`,
                }}
              />
            )
          })}
        </g>

        {/* Signals — bright pulses traveling along select bonds */}
        <g className="signals">
          {bonds.slice(0, 8).map(([a, b], i) => {
            const na = nodes[a]
            const nb = nodes[b]
            return (
              <circle
                key={i}
                r="3"
                fill="url(#signal-glow)"
                style={{
                  animation: `signalTravel-${i} ${6 + (i % 3)}s linear ${i * 1.2}s infinite`,
                  // @ts-expect-error CSS custom props
                  '--x1': `${na.x}px`,
                  '--y1': `${na.y}px`,
                  '--x2': `${nb.x}px`,
                  '--y2': `${nb.y}px`,
                }}
              />
            )
          })}
        </g>

        {/* Nodes — translate drift + scale pulse */}
        <g className="nodes">
          {nodes.map((n, i) => (
            <g key={i} transform={`translate(${n.x} ${n.y})`}>
              <g
                style={{
                  animation: `drift-${n.drift} ${n.dur}s ease-in-out ${n.delay}s infinite`,
                }}
              >
                <circle
                  r={n.r * 2.6}
                  fill="url(#node-glow)"
                  opacity="0.55"
                  style={{
                    animation: `nodePulse ${3 + (i % 3)}s ease-in-out ${
                      i * 0.4
                    }s infinite`,
                    transformOrigin: 'center',
                    transformBox: 'fill-box',
                  }}
                />
                <circle
                  r={n.r}
                  fill="#26bfbf"
                  opacity="0.9"
                  style={{
                    animation: `nodePulse ${2.5 + (i % 4)}s ease-in-out ${
                      i * 0.3
                    }s infinite`,
                    transformOrigin: 'center',
                    transformBox: 'fill-box',
                  }}
                />
                <circle cx="0" cy="0" r={n.r * 0.45} fill="#e6f7f7" opacity="0.95" />
              </g>
            </g>
          ))}
        </g>

        {/* Inline keyframes — generated for each signal so animateMotion-style travel works via translate */}
        <style>{`
          @keyframes drift-0 {
            0%, 100% { transform: translate(0, 0); }
            25% { transform: translate(35px, -22px); }
            50% { transform: translate(18px, 30px); }
            75% { transform: translate(-28px, 12px); }
          }
          @keyframes drift-1 {
            0%, 100% { transform: translate(0, 0); }
            33% { transform: translate(-30px, 25px); }
            66% { transform: translate(28px, 18px); }
          }
          @keyframes drift-2 {
            0%, 100% { transform: translate(0, 0); }
            25% { transform: translate(-22px, -28px); }
            50% { transform: translate(32px, -10px); }
            75% { transform: translate(-15px, 30px); }
          }
          @keyframes drift-3 {
            0%, 100% { transform: translate(0, 0); }
            50% { transform: translate(40px, 24px); }
          }
          @keyframes nodePulse {
            0%, 100% { transform: scale(1); opacity: 0.85; }
            50% { transform: scale(1.45); opacity: 1; }
          }
          @keyframes bondFlow {
            0% { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: -28; }
          }
          @keyframes bondPulse {
            0%, 100% { stroke-opacity: 0.18; }
            50% { stroke-opacity: 0.7; }
          }
          ${bonds
            .slice(0, 8)
            .map(([a, b], i) => {
              const na = nodes[a]
              const nb = nodes[b]
              return `
                @keyframes signalTravel-${i} {
                  0% { transform: translate(${na.x}px, ${na.y}px); opacity: 0; }
                  10% { opacity: 1; }
                  90% { opacity: 1; }
                  100% { transform: translate(${nb.x}px, ${nb.y}px); opacity: 0; }
                }
              `
            })
            .join('\n')}
          @media (prefers-reduced-motion: reduce) {
            .peptide-network g, .peptide-network line, .peptide-network circle {
              animation: none !important;
            }
          }
        `}</style>
      </svg>
    </div>
  )
}
