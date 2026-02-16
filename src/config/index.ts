/**
 * Application configuration
 */

export interface AppConfig {
  port: number;
  env: string;
  isProduction: boolean;
  isDevelopment: boolean;
  isTest: boolean;
  cors: {
    origin: string | string[];
    credentials: boolean;
  };
  logging: {
    enabled: boolean;
    level: string;
  };
}

function getEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (value === undefined) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

const env = getEnv('NODE_ENV', 'development');

export const config: AppConfig = {
  port: getEnvNumber('PORT', 3000),
  env,
  isProduction: env === 'production',
  isDevelopment: env === 'development',
  isTest: env === 'test',
  cors: {
    origin: getEnv('CORS_ORIGIN', '*'),
    credentials: true
  },
  logging: {
    enabled: env !== 'test',
    level: getEnv('LOG_LEVEL', 'info')
  }
};

export default config;
