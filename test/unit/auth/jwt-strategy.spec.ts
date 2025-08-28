import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../../../src/modules/auth/strategies/jwt-strategy';
import { UserService } from '../../../src/modules/user/user.service';
import { Test, TestingModule } from '@nestjs/testing';
import { userServiceMock } from '../../utils/user-service.mock';
import { createdSafeUser, createdUser } from '../../utils/user.mock';
import { jwtPayload } from '../../utils/auth.mock';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let userService: jest.Mocked<UserService>;
  let configService: jest.Mocked<ConfigService>;

  const mockConfigService = {
    getOrThrow: jest.fn((key: string) => {
      if (key === 'JWT_SECRET') return 'fake-secret';
      return '';
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        userServiceMock,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    userService = module.get(UserService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should validate the definition of JwtStrategy, UserService and ConfigService', () => {
    expect(jwtStrategy).toBeDefined();
    expect(userService).toBeDefined();
    expect(configService).toBeDefined();
  });

  it('should validate the strategy and return the safe user to be attached to the request', async () => {
    userService.findUserById.mockResolvedValue({
      ...createdUser,
      is_active: true,
    });

    const user = await jwtStrategy.validate(jwtPayload);
    expect(userService.findUserById).toHaveBeenCalledWith(jwtPayload.sub);
    expect(user).toEqual({ ...createdSafeUser, is_active: true });
  });

  it('should throw an UnauthorizedException if the user is not found', async () => {
    userService.findUserById.mockResolvedValue(null);
    await expect(jwtStrategy.validate(jwtPayload)).rejects.toThrow(
      new UnauthorizedException('Invalid token'),
    );
  });

  it('should throw an UnauthorizedException if the user is not active', async () => {
    userService.findUserById.mockResolvedValue({
      ...createdUser,
      is_active: false,
    });
    await expect(jwtStrategy.validate(jwtPayload)).rejects.toThrow(
      new UnauthorizedException('Invalid token'),
    );
  });
});
