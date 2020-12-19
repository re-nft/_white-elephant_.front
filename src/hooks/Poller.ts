import { useEffect, useRef } from "react";

export default function useInterval(callback, delay) {
  const savedCallback = useRef();
  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    function tick() {
      //@ts-ignore
      savedCallback.current();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => {
        clearInterval(id);
      };
    }
  }, [callback, delay]);

  // const savedCallback = useRef();
  // useEffect(() => {
  //   savedCallback.current = fn;
  //   fn();
  // }, [fn]);
  // useEffect(() => {
  //   if (!savedCallback) return;
  //   //@ts-ignore
  //   const tick = async () => await savedCallback?.current();
  //   if (delay && typeof delay === "number") {
  //     const id = setInterval(tick, delay);
  //     return () => clearInterval(id);
  //   }
  // }, [delay, fn]);
}
