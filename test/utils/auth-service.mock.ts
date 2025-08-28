import { AuthService } from '../../src/modules/auth/auth.service';

export const authServiceMock = {
  provide: AuthService,
  useValue: {
    validateLocalUser: jest.fn(),
    validateGoogleUser: jest.fn(),
    issueJwtForUser: jest.fn(),
  },
};
