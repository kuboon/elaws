import {useRef, useCallback, useEffect} from 'preact/hooks'
export default function useDebouncedCallback(
  callback: Function,
  delay: number,
  deps?: any[],
  options = {} as {maxWait: number}
) {
  const { maxWait } = options;
  const maxWaitHandler: {current?: number} = useRef(undefined);
  const maxWaitArgs: {current: any[]} = useRef([]);
  const functionTimeoutHandler: {current?: number} = useRef(undefined);
  const isComponentUnmounted = useRef(false);

  const debouncedFunction = useCallback(callback, deps || []);

  const cancelDebouncedCallback = useCallback(() => {
    clearTimeout(functionTimeoutHandler.current || undefined);
    clearTimeout(maxWaitHandler.current|| undefined);
    maxWaitHandler.current = undefined;
    maxWaitArgs.current = [];
    functionTimeoutHandler.current = undefined;
  }, [functionTimeoutHandler.current, maxWaitHandler.current]);

  useEffect(
    () => () => {
      // we use flag, as we allow to call callPending outside the hook
      isComponentUnmounted.current = true;
    },
    []
  );

  const debouncedCallback = (...args: any[]) => {
    maxWaitArgs.current = args;
    clearTimeout(functionTimeoutHandler.current);
    functionTimeoutHandler.current = setTimeout(() => {
      if (!isComponentUnmounted.current) {
        debouncedFunction(...args);
      }

      cancelDebouncedCallback();
    }, delay);

    if (maxWait && !maxWaitHandler.current) {
      maxWaitHandler.current = setTimeout(() => {
        if (!isComponentUnmounted.current) {
          debouncedFunction(...maxWaitArgs.current);
        }
        cancelDebouncedCallback();
      }, maxWait);
    }
  };

  const callPending = () => {
    // Call pending callback only if we have anything in our queue
    if (!functionTimeoutHandler.current) {
      return;
    }

    debouncedFunction(...maxWaitArgs.current);
    cancelDebouncedCallback();
  };

  // For the moment, we use 3 args array so that we save backward compatibility
  return [debouncedCallback, cancelDebouncedCallback, callPending];
}
