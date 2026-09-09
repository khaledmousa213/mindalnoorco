interface LogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
}

export const MindAlnoorLogo = ({ className = 'w-10 h-10', size, showText = false }: LogoProps) => {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 h-full w-full block"
        style={size ? { width: size, height: size } : undefined}
      >
        <defs>
          <linearGradient id="alnoor-grad-sky" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
          <linearGradient id="alnoor-grad-teal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2DD4BF" />
            <stop offset="100%" stopColor="#0D9488" />
          </linearGradient>
          <linearGradient id="alnoor-grad-lime" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A3E635" />
            <stop offset="100%" stopColor="#65A30D" />
          </linearGradient>
        </defs>

        {/* Primary Geometric Shield with Modern Medical Overlays */}
        {/* Sky Blue Left Wing */}
        <rect
          x="8"
          y="18"
          width="48"
          height="48"
          rx="14"
          fill="url(#alnoor-grad-sky)"
          fillOpacity="0.85"
        />

        {/* Teal Center-Top Layer */}
        <rect
          x="44"
          y="12"
          width="48"
          height="48"
          rx="14"
          fill="url(#alnoor-grad-teal)"
          fillOpacity="0.88"
        />

        {/* Lime Green Diagnostic Precision Layer */}
        <rect
          x="30"
          y="42"
          width="54"
          height="48"
          rx="14"
          fill="url(#alnoor-grad-lime)"
          fillOpacity="0.95"
        />

        {/* Crisp ECG Diagnostic Pulse */}
        <path
          d="M 18 52 L 36 52 L 44 28 L 54 74 L 64 42 L 72 52 L 86 52"
          stroke="#FFFFFF"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Central Luminous Node */}
        <circle cx="54" cy="74" r="2.5" fill="#FFFFFF" />
      </svg>

      {showText && (
        <div className="flex flex-col leading-tight">
          <span className="font-black text-slate-900 tracking-tight text-base sm:text-lg flex items-center gap-1">
            <span className="text-sky-600">Mind</span>
            <span className="text-teal-600">Alnoor</span>
            <span className="text-lime-600 font-extrabold">Co.</span>
          </span>
          <span className="text-[10px] text-slate-500 font-medium tracking-wide">
            شركة العقل والنور للأجهزة الطبية
          </span>
        </div>
      )}
    </div>
  );
};
