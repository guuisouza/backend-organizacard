import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../../src/modules/auth/auth.service';
import { GoogleStrategy } from '../../../src/modules/auth/strategies/google-strategy';
import { Test, TestingModule } from '@nestjs/testing';
import { authServiceMock } from '../../utils/auth-service.mock';
import { createdSafeUser, createdUser } from '../../utils/user.mock';
import { Profile } from 'passport-google-oauth20';
import { UnauthorizedException } from '@nestjs/common';

const accessToken = 'fake-access-token';
const refreshToken = 'fake-refresh-token';

describe('GoogleStrategy', () => {
  let googleStrategy: GoogleStrategy;
  let authService: jest.Mocked<AuthService>;
  let configService: jest.Mocked<ConfigService>;

  const mockConfigService = {
    getOrThrow: jest.fn((key: string) => {
      if (key === 'GOOGLE_CLIENT_ID') return 'fake-client-id';
      if (key === 'GOOGLE_CLIENT_SECRET') return 'fake-client-secret';
      return '';
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleStrategy,
        authServiceMock,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    googleStrategy = module.get<GoogleStrategy>(GoogleStrategy);
    authService = module.get(AuthService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should validate the definition of GoogleStrategy, AuthService and ConfigService', () => {
    expect(googleStrategy).toBeDefined();
    expect(authService).toBeDefined();
    expect(configService).toBeDefined();
  });

  it("should throw an UnauthorizedException if the user's email is invalid", async () => {
    const profile = {
      id: 'fake-id',
      displayName: 'fake-display-name',
      emails: [],
      photos: [{ value: 'fake-photo-url' }],
    } as unknown as Profile;

    await expect(
      googleStrategy.validate(accessToken, refreshToken, profile),
    ).rejects.toThrow(UnauthorizedException);
    expect(authService.validateGoogleUser).not.toHaveBeenCalled();
  });

  it('should validate the strategy and return the safe user to be attached to the request', async () => {
    const profile = {
      id: 'fake-id',
      displayName: 'fake-display-name',
      emails: [{ value: 'fake-email@gmail.com' }],
      photos: [{ value: 'fake-photo-url' }],
    } as unknown as Profile;

    authService.validateGoogleUser.mockResolvedValue(createdUser);

    const user = await googleStrategy.validate(
      accessToken,
      refreshToken,
      profile,
    );

    expect(authService.validateGoogleUser).toHaveBeenCalledWith({
      id: profile.id,
      displayName: profile.displayName,
      email: profile.emails?.[0]?.value,
      avatar: profile.photos?.[0]?.value,
    });
    expect(user).toEqual(createdSafeUser);
  });
});
