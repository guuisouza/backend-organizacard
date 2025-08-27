import { AuthProvider } from '../../src/shared/enums/auth-provider.enum';

export const createUserDto = {
  name: 'ludmila',
  email: 'ludmila@gmail.com',
  password: '12345678',
};

export const createdUser = {
  id: '20134832-ed1f-4421-8c54-6dde77236fc4',
  name: 'ludmila',
  email: 'ludmila@gmail.com',
  password: 'hashed_password',
  auth_provider: AuthProvider.LOCAL,
  is_active: false,
  activation_token: '1f1a4b52-aafc-41ea-a865-361d87271338',
  avatar_url: null,
  google_id: null,
  created_at: new Date(),
  cards: [],
};

export const createGoogleUserDto = {
  id: '123456789',
  displayName: 'Guilherme',
  email: 'guilherme23@gmail.com',
  avatar: 'https://example.com/avatar.jpg',
};

export const createdGoogleUser = {
  id: '20134832-ed1f-4421-8c54-6dde77236fc4',
  name: 'Guilherme',
  email: 'guilherme23@gmail.com',
  password: null,
  auth_provider: AuthProvider.GOOGLE,
  is_active: true,
  activation_token: null,
  avatar_url: 'https://example.com/avatar.jpg',
  google_id: '123456789',
  created_at: new Date(),
  cards: [],
};
