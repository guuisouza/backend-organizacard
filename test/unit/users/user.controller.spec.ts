import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../../../src/modules/user/user.controller';
import { userServiceMock } from '../../utils/user-service.mock';
import { UserService } from '../../../src/modules/user/user.service';
import { createdUser, createUserDto } from '../../utils/user.mock';
import { ConflictException } from '@nestjs/common';

describe('UserController', () => {
  let userController: UserController;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [userServiceMock],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should validate the definition of UserController and UserService', () => {
    expect(userController).toBeDefined();
    expect(userService).toBeDefined();
  });

  describe('Controller - Register local user', () => {
    it('should call userService.createLocalUser with correct data and return the result', async () => {
      const dto = createUserDto;
      const expectedResult = { id: createdUser.id };

      userService.createLocalUser.mockResolvedValue(expectedResult);
      const result = await userController.createUser(dto);
      expect(userService.createLocalUser).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expectedResult);
    });

    it('should propagate ConflictException from the service', async () => {
      userService.createLocalUser.mockRejectedValue(
        new ConflictException('This user email already exists'),
      );

      await expect(userController.createUser(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('Controller - Activate local user', () => {
    it('should call userService.activateLocalUser with correct data', async () => {
      const token = '1f1a4b52-aafc-41ea-a865-361d87271338';
      await userController.activateUser(token);
      expect(userService.activateLocalUser).toHaveBeenCalledWith(token);
    });
  });
});
