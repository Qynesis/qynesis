// The sticky 3D Q sits behind the opening sections. When an opaque panel fully
// covers it (the testimonials overlay), it can stop rendering until uncovered.

const EVENT = "qstage:covered";

export function setQStageCovered(covered: boolean) {
  window.dispatchEvent(new CustomEvent<boolean>(EVENT, { detail: covered }));
}

/** Subscribes to cover changes; returns an unsubscribe. */
export function onQStageCovered(listener: (covered: boolean) => void): () => void {
  const handler = (e: Event) => listener((e as CustomEvent<boolean>).detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}
