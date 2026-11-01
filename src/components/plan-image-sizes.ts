/** Matches the card grid, its overlap and the 42px surface padding/border inset. */
export function planImageSizes(step: number): string {
  const desktop =
    step === 4
      ? 'calc(41.667vw - 76px)'
      : step === 5
        ? 'calc(41.667vw - 28px)'
        : 'calc(33.333vw - 26px)';
  const maximum = step === 4 ? 458 : step === 5 ? 506 : 401;
  return `(max-width: 767px) calc(100vw - 90px), (max-width: 1023px) calc(50vw - 78px), (min-width: 1280px) ${maximum}px, ${desktop}`;
}
