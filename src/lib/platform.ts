export function isMac() {
  return (
    typeof navigator !== "undefined" &&
    /Mac|iP(hone|ad|od)/.test(navigator.userAgent)
  );
}
