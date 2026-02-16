import { app } from '../src/app';
import { config } from '../src/config';

describe('App', () => {
  it('should export app', () => {
    expect(app).toBeDefined();
  });

  it('should have config loaded', () => {
    expect(config).toBeDefined();
    expect(config.port).toBe(3000);
  });
});
