import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../../src/modules/auth/auth.controller';
import { AuthService } from '../../../src/modules/auth/auth.service';
import { authServiceMock } from '../../utils/auth-service.mock';
import { LocalAuthGuard } from '../../../src/modules/auth/guards/local-auth.guard';
import {
  googleAuthGuardMock,
  jwtAuthGuardMock,
  localAuthGuardMock,
} from '../../utils/authguard.mocks';
import { GoogleAuthGuard } from '../../../src/modules/auth/guards/google-auth.guard';
import { JwtAuthGuard } from '../../../src/modules/auth/guards/jwt-auth.guard';
import { createdSafeUser } from '../../utils/user.mock';
import { SafeUser } from '../../../src/shared/types/safe-user';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: typeof authServiceMock.useValue;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [authServiceMock],
    })
      .overrideGuard(LocalAuthGuard)
      .useValue(localAuthGuardMock)
      .overrideGuard(GoogleAuthGuard)
      .useValue(googleAuthGuardMock)
      .overrideGuard(JwtAuthGuard)
      .useValue(jwtAuthGuardMock)
      .compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should validate the definition of AuthController and AuthService', () => {
    expect(authController).toBeDefined();
    expect(authService).toBeDefined();
  });

  describe('Controller - Login local user', () => {
    it('should call authService.issueJwtForUser with correct data and return the result', async () => {
      jest.spyOn(authService, 'issueJwtForUser').mockResolvedValue({
        access_token: 'access_token_eyJdsaasdkiwle2',
      });

      const user: SafeUser = createdSafeUser;
      const req = { user };

      const result = await authController.localLogin(req);
      expect(authService.issueJwtForUser).toHaveBeenCalledWith(user);
      expect(result).toEqual({ access_token: 'access_token_eyJdsaasdkiwle2' });
    });
  });

  describe('Controller - Login google user', () => {
    it('should be defined', () => {
      expect(authController.googleLogin).toBeDefined();
    });
  });

  describe('Controller - Redirect google user', () => {
    it('should redirect user and call authService.issueJwtForUser with correct data and return the result', async () => {
      jest.spyOn(authService, 'issueJwtForUser').mockResolvedValue({
        access_token: 'access_token_eyJdsaasdkiwle2',
      });

      const user: SafeUser = createdSafeUser;
      const req = { user };

      const result = await authController.googleRedirect(req);
      expect(authService.issueJwtForUser).toHaveBeenCalledWith(user);
      expect(result).toEqual({ access_token: 'access_token_eyJdsaasdkiwle2' });
    });
  });

  describe('Controller - Get user profile', () => {
    it("should return the user's profile data", () => {
      const user: SafeUser = createdSafeUser;
      const req = { user };

      const result = authController.getProfile(req);
      expect(result).toEqual(user);
    });
  });
});
