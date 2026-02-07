type LogArgs = unknown[];

const isDebugEnabled =
  process.env.NODE_ENV !== 'production' ||
  process.env.NEXT_PUBLIC_DEBUG_LOGS === 'true';

export const logger = {
  debug: (...args: LogArgs) => {
    if (isDebugEnabled) {
      console.debug('[DateKeeper]', ...args);
    }
  },
  info: (...args: LogArgs) => {
    if (isDebugEnabled) {
      console.info('[DateKeeper]', ...args);
    }
  },
  warn: (...args: LogArgs) => {
    console.warn('[DateKeeper]', ...args);
  },
  error: (...args: LogArgs) => {
    console.error('[DateKeeper]', ...args);
  },
};
