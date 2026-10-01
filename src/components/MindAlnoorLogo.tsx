interface LogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
}

export const MindAlnoorLogo = ({ className = 'w-10 h-10', size, showText = false }: LogoProps) => {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <svg
        viewBox="0 0 519 419"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 h-full w-full block"
        style={size ? { width: size, height: size } : undefined}
        aria-label="Mind Alnoor Co."
        role="img"
      >
        {/* Three overlapping panels (green under, pale teal, sky blue on top) with an ECG pulse */}
        <rect x="113" y="164" width="330" height="253" rx="50" fill="#90C73E" />
        <rect x="0" y="72" width="331" height="254" rx="50" fill="#A7D4D2" fillOpacity="0.8" />
        <rect x="180" y="31" width="338" height="253" rx="50" fill="#3FC5F0" fillOpacity="0.7" />
        <path
          d="M75 243 H164 Q172 243 176 235 L220 142 L254 316 L292 245 Q298 233 310 233 H385"
          stroke="#F7F6F5"
          strokeWidth="11"
          strokeLinejoin="miter"
        />
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
