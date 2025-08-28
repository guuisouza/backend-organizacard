import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../../src/modules/auth/auth.service';
import { LocalStrategy } from '../../../src/modules/auth/strategies/local-strategy';
import { authServiceMock } from '../../utils/auth-service.mock';
import { createdSafeUser, createdUser } from '../../utils/user.mock';
import { UnauthorizedException } from '@nestjs/common';

describe('LocalStrategy', () => {
  let localStrategy: LocalStrategy;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LocalStrategy, authServiceMock],
    }).compile();

    localStrategy = module.get<LocalStrategy>(LocalStrategy);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should validate the definition of LocalStrategy and AuthService', () => {
    expect(localStrategy).toBeDefined();
    expect(authService).toBeDefined();
  });

  describe('LocalStrategy - failure cases', () => {
    it('should throw UnauthorizedException if fields are invalid', async () => {
      await expect(localStrategy.validate('', '123456')).rejects.toThrow(
        new UnauthorizedException('Invalid fields or values'),
      );
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      const email = 'notfound@example.com';
      const password = 'password123';

      authService.validateLocalUser.mockResolvedValue(null);

      await expect(localStrategy.validate(email, password)).rejects.toThrow(
        new UnauthorizedException('Invalid username or password'),
      );

      expect(authService.validateLocalUser).toHaveBeenCalledWith({
        email,
        password,
      });
    });

    it('should throw UnauthorizedException if user is not active', async () => {
      const inactiveUser = { ...createdUser, is_active: false };

      authService.validateLocalUser.mockResolvedValue(inactiveUser);

      await expect(
        localStrategy.validate(inactiveUser.email, inactiveUser.password),
      ).rejects.toThrow(
        new UnauthorizedException(
          'Your account is not active yet, please check your email to activate your account',
        ),
      );

      expect(authService.validateLocalUser).toHaveBeenCalledWith({
        email: inactiveUser.email,
        password: inactiveUser.password,
      });
    });
  });

  it('should validate the strategy and return the safe user and attach to the request', async () => {
    const user = { email: 'ludmila@gmail.com', password: 'hashed_password' };
    authService.validateLocalUser.mockResolvedValue({
      ...createdUser,
      is_active: true,
    });

    const result = await localStrategy.validate(user.email, user.password);
    expect(authService.validateLocalUser).toHaveBeenCalledWith(user);
    expect(result).toEqual({
      ...createdSafeUser,
      is_active: true,
    });
  });
});
