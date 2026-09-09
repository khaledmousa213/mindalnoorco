interface MindrayLogoProps {
  className?: string;
  height?: number | string;
  variant?: 'red' | 'white';
}

export const MindrayLogo = ({ className = 'h-3 sm:h-3.5', height, variant = 'red' }: MindrayLogoProps) => {
  const fillColor = variant === 'white' ? '#FFFFFF' : '#BC1E26';

  return (
    <span className={`inline-flex items-center align-middle select-none shrink-0 ${className}`} title="Mindray Healthcare">
      <svg
        viewBox="0 0 760 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto block"
        style={height ? { height } : undefined}
      >
        {/* 'm' */}
        <path
          d="M0 100V28.5H24.5V40C29.8 32.5 38.5 27 50.2 27C62.8 27 72 33 76.5 42.5C81.8 32.5 91.8 27 105 27C124 27 134 39 134 57.5V100H109.5V60.5C109.5 50.8 104.5 45.8 96 45.8C87 45.8 81.8 51.5 81.8 61.8V100H57.2V60.5C57.2 50.8 52.2 45.8 43.8 45.8C34.8 45.8 29.5 51.5 29.5 61.8V100H0Z"
          fill={fillColor}
        />

        {/* 'i' */}
        <path
          d="M152 2.5C152 1.1 153.1 0 154.5 0H175.5C178 0 180 2 180 4.5V18.5H152V2.5ZM153.2 28.5H178.8V100H153.2V28.5Z"
          fill={fillColor}
        />

        {/* 'n' */}
        <path
          d="M198 100V28.5H222.5V40C227.8 32.5 237.2 27 249.5 27C268.5 27 278.5 39 278.5 57.5V100H254V60.5C254 50.8 249 45.8 240.5 45.8C231.5 45.8 226.2 51.5 226.2 61.8V100H198Z"
          fill={fillColor}
        />

        {/* 'd' */}
        <path
          d="M344 0V39.5C338.5 31.5 329 27 317.5 27C295 27 279 43.5 279 64.5C279 85.5 295 101.5 317.5 101.5C329 101.5 338.5 97 344 89V100H368.5V0H344ZM344 64.5C344 74.8 336.8 82.5 326.8 82.5C316.5 82.5 309.5 74.8 309.5 64.5C309.5 54.2 316.5 46.5 326.8 46.5C336.8 46.5 344 54.2 344 64.5Z"
          fill={fillColor}
        />

        {/* 'r' */}
        <path
          d="M388 100V28.5H412.5V44C417.8 33 427.5 27 440 27V49.5C424.5 49.5 413.5 58 413.5 73.5V100H388Z"
          fill={fillColor}
        />

        {/* 'a' */}
        <path
          d="M504 27C480 27 464 42.5 464 64.5C464 86 479.5 101.5 502 101.5C514 101.5 523.5 96.8 529.5 87.5V100H554V28.5H529.5V40C523.5 31.5 515 27 504 27ZM506.5 82.5C496.2 82.5 489.2 74.8 489.2 64.5C489.2 54.2 496.2 46.5 506.5 46.5C516.8 46.5 524 54.2 524 64.5C524 74.8 516.8 82.5 506.5 82.5Z"
          fill={fillColor}
        />

        {/* 'y' */}
        <path
          d="M574 28.5L608 97.5L626.5 57.5L641 28.5H668L627 106.5L615 130C609.5 140.5 601 145 587.5 145C582.5 145 577.5 144 573 142L577.5 125.5C580 126.5 582.8 127 585.5 127C591.5 127 595.5 123.8 598.5 116.5L601.5 110L567 43.5L547 28.5H574Z"
          fill={fillColor}
        />
      </svg>
    </span>
  );
};
