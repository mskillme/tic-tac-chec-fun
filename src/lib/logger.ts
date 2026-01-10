/**
 * Secure logging utility that only logs in development mode.
 * Prevents information leakage in production builds.
 */
const isDevelopment = import.meta.env.DEV;

export const logger = {
  /**
   * Logs error messages only in development mode.
   * In production, errors are silently suppressed to prevent info leakage.
   */
  error: (message: string, error?: unknown): void => {
    if (isDevelopment) {
      console.error(message, error);
    }
    // In production, could send to monitoring service instead
  },

  /**
   * Logs general messages only in development mode.
   */
  log: (message: string, data?: unknown): void => {
    if (isDevelopment) {
      console.log(message, data);
    }
  },

  /**
   * Logs warning messages only in development mode.
   */
  warn: (message: string, data?: unknown): void => {
    if (isDevelopment) {
      console.warn(message, data);
    }
  },
};
