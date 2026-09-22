const GLYPHS: Record<string, string[]> = {
  D: ["###.", "#..#", "#..#", "#..#", "###."],
  E: ["####", "#...", "###.", "#...", "####"],
  V: ["#...#", "#...#", ".#.#.", ".#.#.", "..#.."],
  L: ["#...", "#...", "#...", "#...", "####"],
  U: ["#..#", "#..#", "#..#", "#..#", ".##."],
  I: ["###", ".#.", ".#.", ".#.", "###"],
  Z: ["####", "...#", ".##.", "#...", "####"],
};

const WORD = "DEVLUIIZZ";
const ROWS = 5;
const PIXEL = 0.84;
const INSET = (1 - PIXEL) / 2;

function buildPixels() {
  const pixels: { x: number; y: number }[] = [];
  let offset = 0;
  for (const letter of WORD) {
    const glyph = GLYPHS[letter];
    glyph.forEach((row, y) => {
      [...row].forEach((cell, x) => {
        if (cell === "#") pixels.push({ x: offset + x, y });
      });
    });
    offset += glyph[0].length + 1;
  }
  return { pixels, width: offset - 1 };
}

const { pixels: PIXELS, width: WIDTH } = buildPixels();

const GRADIENT_ID = "terminal-logo-gradient";

function PixelWord({ animated }: { animated: boolean }) {
  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${ROWS}`}
      className="block h-auto w-full"
      fill={animated ? `url(#${GRADIENT_ID})` : "currentColor"}
      aria-hidden="true"
      focusable="false"
    >
      {animated && (
        <defs>
          <linearGradient
            id={GRADIENT_ID}
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="0"
            x2={WIDTH}
            y2={ROWS}
          >
            <stop offset="0%" stopColor="var(--color-terminal-text)" />
            <stop offset="40%" stopColor="var(--color-terminal-accent)" />
            <stop offset="100%" stopColor="var(--color-terminal-accent-strong)" />
          </linearGradient>
        </defs>
      )}
      {PIXELS.map(({ x, y }) => (
        <rect
          key={`${x}-${y}`}
          x={x + INSET}
          y={y + INSET}
          width={PIXEL}
          height={PIXEL}
          rx={0.14}
          className={animated ? "terminal-pixel" : undefined}
          style={animated ? { animationDelay: `${520 + x * 18 + y * 10}ms` } : undefined}
        />
      ))}
    </svg>
  );
}

export function TerminalLogo() {
  return (
    <div className="relative w-full max-w-[17rem] sm:max-w-[26rem] lg:max-w-[30rem]">
      <span className="sr-only">DEVLUIIZZ</span>
      <div className="terminal-logo">
        <PixelWord animated />
      </div>
      <div className="terminal-glitch pointer-events-none absolute inset-0 text-terminal-accent-strong">
        <PixelWord animated={false} />
      </div>
      <div className="terminal-glitch terminal-glitch-b pointer-events-none absolute inset-0 text-terminal-text">
        <PixelWord animated={false} />
      </div>
    </div>
  );
}
