import { useEffect, useRef } from "react";

export default function usePoller(fn, delay) {
  const savedCallback = useRef();

  useEffect(() => {
    savedCallback.current = fn;
    fn();
  }, [fn]);

  useEffect(() => {
    if (!savedCallback) return;

    //@ts-ignore
    const tick = async () => await savedCallback?.current();

    if (delay && typeof delay === "number") {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay, fn]);
}
