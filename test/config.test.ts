import { config } from '../src/config';

describe('Config', () => {
  it('should have default port', () => {
    expect(config.port).toBe(3000);
  });

  it('should have environment settings', () => {
    expect(config.env).toBeDefined();
    expect(typeof config.isProduction).toBe('boolean');
    expect(typeof config.isDevelopment).toBe('boolean');
    expect(typeof config.isTest).toBe('boolean');
  });

  it('should have cors settings', () => {
    expect(config.cors).toBeDefined();
    expect(config.cors.origin).toBeDefined();
    expect(typeof config.cors.credentials).toBe('boolean');
  });

  it('should have logging settings', () => {
    expect(config.logging).toBeDefined();
    expect(typeof config.logging.enabled).toBe('boolean');
    expect(config.logging.level).toBeDefined();
  });
});
