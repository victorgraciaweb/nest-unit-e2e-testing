import * as shared from './index';

describe('Shared Exports', () => {
  it('should export JwtPayload interface (as a type)', () => {
    const jwt: shared.JwtPayload = { id: '123' };
    expect(jwt.id).toBe('123');
  });

  it('should export ValidRoles', () => {
    expect(shared.ValidRoles).toBeDefined();
  });
});
