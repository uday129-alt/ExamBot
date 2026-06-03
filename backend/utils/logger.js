const colors = {
  reset: '\x1b[0m',
  info: '\x1b[36m',    // Cyan
  success: '\x1b[32m', // Green
  warn: '\x1b[33m',    // Yellow
  error: '\x1b[31m',   // Red
  debug: '\x1b[90m'    // Gray
};

export const logger = {
  info: (message, ...args) => {
    console.log(`${colors.info}[INFO] [${new Date().toISOString()}] ${message}${colors.reset}`, ...args);
  },
  success: (message, ...args) => {
    console.log(`${colors.success}[SUCCESS] [${new Date().toISOString()}] ${message}${colors.reset}`, ...args);
  },
  warn: (message, ...args) => {
    console.warn(`${colors.warn}[WARN] [${new Date().toISOString()}] ${message}${colors.reset}`, ...args);
  },
  error: (message, error) => {
    console.error(`${colors.error}[ERROR] [${new Date().toISOString()}] ${message}${colors.reset}`);
    if (error) {
      console.error(error);
    }
  },
  debug: (message, ...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`${colors.debug}[DEBUG] [${new Date().toISOString()}] ${message}${colors.reset}`, ...args);
    }
  }
};
