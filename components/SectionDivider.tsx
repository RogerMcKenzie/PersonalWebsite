export function SlantedDivider({
  bgColor,
  className = "",
  flip = false,
}: {
  bgColor: string;
  className?: string;
  flip?: boolean;
}) {
  return (
    <div
      className={`absolute bottom-0 left-0 w-full overflow-hidden leading-none ${className}`}
    >
      <svg
        className="relative block h-[30px] w-full sm:h-[50px]"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <path
          d={flip ? "M0 120L1200 120 1200 0 0 1200z" : "M1200 120L0 120 0 0 1200 120z"}
          fill={bgColor}
        />
      </svg>
    </div>
  );
}
