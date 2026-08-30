type Props = { className?: string };

/** 숲속 레이어드 일러스트 (배경용) */
export default function ForestScene({ className = "" }: Props) {
  return (
    <svg
      viewBox="0 0 1440 620"
      preserveAspectRatio="xMidYMax slice"
      className={className}
      aria-hidden
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dfe9dd" />
          <stop offset="55%" stopColor="#c3d6c1" />
          <stop offset="100%" stopColor="#9fbb9c" />
        </linearGradient>
        <linearGradient id="far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6f8f74" />
          <stop offset="100%" stopColor="#547a5d" />
        </linearGradient>
        <linearGradient id="mid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3f6a45" />
          <stop offset="100%" stopColor="#2c4f33" />
        </linearGradient>
        <linearGradient id="near" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e3a24" />
          <stop offset="100%" stopColor="#132318" />
        </linearGradient>
      </defs>

      <rect width="1440" height="620" fill="url(#sky)" />
      <circle cx="1140" cy="130" r="58" fill="#fdfbf0" opacity="0.85" />

      {/* 먼 능선 */}
      <path d="M0 300 L170 200 L300 268 L430 172 L610 288 L760 205 L900 280 L1080 190 L1240 275 L1440 210 L1440 620 L0 620Z" fill="url(#far)" opacity="0.75" />

      {/* 안개 */}
      <g className="drift" opacity="0.55">
        <ellipse cx="380" cy="330" rx="330" ry="26" fill="#f3f7f2" />
        <ellipse cx="1030" cy="360" rx="380" ry="22" fill="#f3f7f2" />
      </g>

      {/* 중간 나무 숲 */}
      <g fill="url(#mid)">
        {[
          [60, 330, 1], [150, 356, 0.8], [245, 318, 1.15], [340, 350, 0.9],
          [440, 326, 1.05], [540, 358, 0.85], [640, 320, 1.2], [745, 352, 0.95],
          [850, 330, 1.05], [950, 360, 0.85], [1050, 322, 1.15], [1150, 352, 0.95],
          [1255, 332, 1.05], [1360, 356, 0.9], [1430, 336, 1],
        ].map(([x, y, s], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            <path d="M0 0 L34 130 L-34 130 Z" />
            <path d="M0 -34 L27 70 L-27 70 Z" />
            <path d="M0 -64 L20 22 L-20 22 Z" />
          </g>
        ))}
      </g>

      {/* 가까운 나무 숲 */}
      <g fill="url(#near)">
        {[
          [-10, 400, 1.4], [120, 430, 1.15], [265, 405, 1.5], [420, 438, 1.2],
          [580, 410, 1.45], [730, 440, 1.15], [880, 408, 1.5], [1030, 442, 1.2],
          [1180, 406, 1.45], [1330, 436, 1.2], [1450, 410, 1.4],
        ].map(([x, y, s], i) => (
          <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
            <path d="M0 0 L40 150 L-40 150 Z" />
            <path d="M0 -40 L31 80 L-31 80 Z" />
            <path d="M0 -74 L23 24 L-23 24 Z" />
          </g>
        ))}
      </g>

      <rect y="556" width="1440" height="64" fill="#0f1d13" />
    </svg>
  );
}
