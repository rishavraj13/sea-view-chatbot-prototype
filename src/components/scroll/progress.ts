export interface ScrollGeometry {
  readonly scrollY: number;
  readonly top: number;
  readonly height: number;
  readonly viewport: number;
}
const clamp = (value: number) =>
  Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;

/** Pinning ends when the section bottom reaches the sticky stage bottom. */
export function scrollProgress({
  scrollY,
  top,
  height,
  viewport,
}: ScrollGeometry): number {
  return height > viewport && viewport > 0
    ? clamp((scrollY - top) / (height - viewport))
    : 0;
}
/** Travel from the element's top entering the viewport to its bottom leaving. */
export function passageProgress({
  scrollY,
  top,
  height,
  viewport,
}: ScrollGeometry): number {
  return height > 0 && viewport > 0
    ? clamp((scrollY + viewport - top) / (height + viewport))
    : 0;
}
