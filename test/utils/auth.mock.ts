import { AuthProvider } from '../../src/shared/enums/auth-provider.enum';

export const loginLocalAuthDto = {
  email: 'ludmila@gmail.com',
  password: '12345678',
};

export const loginGoogleAuthDto = {
  id: '123456789',
  displayName: 'Guilherme',
  email: 'guilherme23@gmail.com',
  avatar: 'https://example.com/avatar.jpg',
};

export const jwtPayload = {
  sub: '20134832-ed1f-4421-8c54-6dde77236fc4',
  email: 'ludmila@gmail.com',
  auth_provider: AuthProvider.LOCAL,
};
