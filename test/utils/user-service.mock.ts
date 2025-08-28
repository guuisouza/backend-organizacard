import { UserService } from '../../src/modules/user/user.service';

export const userServiceMock = {
  provide: UserService,
  useValue: {
    createLocalUser: jest.fn(),
    activateLocalUser: jest.fn(),
    findUserByEmailWithPassword: jest.fn(),
    findUserByGoogleId: jest.fn(),
    createGoogleUser: jest.fn(),
    findUserById: jest.fn(),
  },
};
