import * as dtos from './index';

describe('DTO Exports', () => {
  it('should export CreateUserDto', () => {
    expect(dtos.CreateUserDto).toBeDefined();
  });

  it('should export LoginUserDto', () => {
    expect(dtos.LoginUserDto).toBeDefined();
  });
});