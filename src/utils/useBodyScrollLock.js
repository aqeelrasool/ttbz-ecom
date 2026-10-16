import { useEffect } from "react";

let lockCount = 0;

/** Locks background scrolling while a modal is mounted (supports nested modals). */
export default function useBodyScrollLock(active = true) {
  useEffect(() => {
    if (!active) return undefined;
    lockCount += 1;
    if (lockCount === 1) document.body.style.overflow = "hidden";
    return () => {
      lockCount -= 1;
      if (lockCount === 0) document.body.style.overflow = "";
    };
  }, [active]);
}
