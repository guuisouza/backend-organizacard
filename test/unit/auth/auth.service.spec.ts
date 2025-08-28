import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../../../src/modules/auth/auth.service';
import { UserService } from '../../../src/modules/user/user.service';
import { Test, TestingModule } from '@nestjs/testing';
import { userServiceMock } from '../../utils/user-service.mock';
import {
  jwtPayload,
  loginGoogleAuthDto,
  loginLocalAuthDto,
} from '../../utils/auth.mock';
import * as bcrypt from 'bcryptjs';
import {
  createdGoogleUser,
  createdSafeUser,
  createdUser,
} from '../../utils/user.mock';
import { jwtServiceMock } from '../../utils/jwt-service.mock';

describe('AuthService', () => {
  let authService: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService, userServiceMock, jwtServiceMock],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should validate the definition of AuthService, UserService and JwtService', () => {
    expect(authService).toBeDefined();
    expect(userService).toBeDefined();
    expect(jwtService).toBeDefined();
  });

  describe('validateLocalUser', () => {
    it('should return null if user email is not found or user does not have password', async () => {
      const loginLocalDto = loginLocalAuthDto;
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);
      jest
        .spyOn(userService, 'findUserByEmailWithPassword')
        .mockResolvedValue(null);
      const result = await authService.validateLocalUser(loginLocalDto);
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(result).toEqual(null);
    });

    it("should return null if user password doesn't match", async () => {
      const loginLocalDto = loginLocalAuthDto;
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);
      jest
        .spyOn(userService, 'findUserByEmailWithPassword')
        .mockResolvedValue(createdUser);
      const result = await authService.validateLocalUser(loginLocalDto);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginLocalDto.password,
        createdUser.password,
      );
      expect(result).toEqual(null);
    });

    it('should call userService.findUserByEmailWithPassword with correct data and return the user', async () => {
      const loginLocalDto = loginLocalAuthDto;
      jest
        .spyOn(userService, 'findUserByEmailWithPassword')
        .mockResolvedValue(createdUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await authService.validateLocalUser(loginLocalDto);

      expect(userService.findUserByEmailWithPassword).toHaveBeenCalledWith(
        loginLocalDto.email,
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginLocalDto.password,
        createdUser.password,
      );
      expect(result).toEqual(createdUser);
    });
  });

  describe('validateGoogleUser', () => {
    it("should create a new google user if the user doesn't exist and return it", async () => {
      const googleProfileDto = loginGoogleAuthDto;
      jest.spyOn(userService, 'findUserByGoogleId').mockResolvedValue(null);
      jest
        .spyOn(userService, 'createGoogleUser')
        .mockResolvedValue(createdGoogleUser);

      const result = await authService.validateGoogleUser(googleProfileDto);

      expect(userService.findUserByGoogleId).toHaveBeenCalledWith(
        googleProfileDto.id,
      );
      expect(userService.createGoogleUser).toHaveBeenCalledWith(
        googleProfileDto,
      );
      expect(result).toEqual(createdGoogleUser);
    });

    it('should return the user if it exists', async () => {
      const googleProfileDto = loginGoogleAuthDto;
      jest
        .spyOn(userService, 'findUserByGoogleId')
        .mockResolvedValue(createdGoogleUser);
      const result = await authService.validateGoogleUser(googleProfileDto);
      expect(userService.findUserByGoogleId).toHaveBeenCalledWith(
        googleProfileDto.id,
      );
      expect(userService.createGoogleUser).not.toHaveBeenCalled();
      expect(result).toEqual(createdGoogleUser);
    });
  });

  describe('issueJwtForUser', () => {
    it('should call jwtService.sign with correct data and return the token', () => {
      jest
        .spyOn(jwtService, 'sign')
        .mockReturnValue('acess_token_eyJdsaasdkiwle2');
      const result = authService.issueJwtForUser(createdSafeUser);
      expect(jwtService.sign).toHaveBeenCalledWith(jwtPayload);
      expect(result).toEqual({ access_token: 'acess_token_eyJdsaasdkiwle2' });
    });
  });
});
