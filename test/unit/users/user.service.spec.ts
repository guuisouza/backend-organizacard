/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from '../../../src/modules/user/user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../../src/entities/user.entity';
import { createTypeormRepositoryMock } from '../../utils/typeorm-repository.mock';
import { EmailService } from '../../../src/modules/email/email.service';
import { emailServiceMock } from '../../utils/email-service.mock';
import { Repository } from 'typeorm';
import { AuthProvider } from '../../../src/shared/enums/auth-provider.enum';
import { ConflictException, NotFoundException } from '@nestjs/common';
import {
  createGoogleUserDto,
  createUserDto,
  createdGoogleUser,
  createdUser,
} from '../../utils/user.mock';
import * as bcrypt from 'bcryptjs';

describe('UserService', () => {
  let userService: UserService;
  let usersRepository: jest.Mocked<Repository<User>>;
  let emailService: jest.Mocked<EmailService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        emailServiceMock,
        {
          provide: getRepositoryToken(User),
          useValue: createTypeormRepositoryMock(),
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    emailService = module.get(EmailService);
    usersRepository = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should validate the definition of UserService, EmailService and UsersRepository', () => {
    expect(userService).toBeDefined();
    expect(emailService).toBeDefined();
    expect(usersRepository).toBeDefined();
  });

  describe('createLocalUser', () => {
    beforeEach(() => {
      jest
        .spyOn(crypto, 'randomUUID')
        .mockReturnValue('1f1a4b52-aafc-41ea-a865-361d87271338');
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed_password' as never);
    });

    it("should throw ConflictException if the user's email already exists", async () => {
      usersRepository.findOneBy.mockResolvedValue(createdUser);

      await expect(userService.createLocalUser(createUserDto)).rejects.toThrow(
        new ConflictException('This user email already exists'),
      );
      expect(usersRepository.findOneBy).toHaveBeenCalledWith({
        email: createUserDto.email,
      });
    });

    it('should create a new local user successfully', async () => {
      usersRepository.findOneBy.mockResolvedValue(null);
      usersRepository.create.mockReturnValue(createdUser);
      usersRepository.save.mockResolvedValue(createdUser);
      emailService.sendEmail.mockResolvedValue(undefined);

      const result = await userService.createLocalUser(createUserDto);
      const { id } = result;

      expect(result).toEqual({ id: id });
      expect(usersRepository.findOneBy).toHaveBeenCalledWith({
        email: createUserDto.email,
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(usersRepository.create).toHaveBeenCalledWith({
        ...createUserDto,
        auth_provider: AuthProvider.LOCAL,
        is_active: false,
        activation_token: '1f1a4b52-aafc-41ea-a865-361d87271338',
        password: 'hashed_password',
      });
      expect(usersRepository.save).toHaveBeenCalledWith(createdUser);
      expect(emailService.sendEmail).toHaveBeenCalledWith(
        createUserDto.email,
        createdUser.activation_token,
      );
    });
  });

  describe('activateLocalUser', () => {
    it('should throw NotFoundException if the user does not have an activation token', async () => {
      usersRepository.findOneBy.mockResolvedValue(null);

      await expect(
        userService.activateLocalUser('1f1a4b52-aafc-41ea-a865-361d87271338'),
      ).rejects.toThrow(new NotFoundException('Invalid token'));
      expect(usersRepository.findOneBy).toHaveBeenCalledWith({
        activation_token: '1f1a4b52-aafc-41ea-a865-361d87271338',
      });
    });

    it('should activate the user successfully', async () => {
      usersRepository.findOneBy.mockResolvedValue(createdUser);

      await expect(
        userService.activateLocalUser('1f1a4b52-aafc-41ea-a865-361d87271338'),
      ).resolves.toBeUndefined();
      expect(usersRepository.findOneBy).toHaveBeenCalledWith({
        activation_token: '1f1a4b52-aafc-41ea-a865-361d87271338',
      });
      expect(usersRepository.save).toHaveBeenCalledWith({
        ...createdUser,
        is_active: true,
        activation_token: null,
      });
    });
  });

  describe('findUserByEmailWithPassword', () => {
    it('should return null if the user does not exist', async () => {
      const qb = usersRepository.createQueryBuilder(
        'users',
      ) as jest.Mocked<any>;
      qb.getOne.mockResolvedValue(null);
      const result =
        await userService.findUserByEmailWithPassword('test@example.com');
      expect(qb.addSelect).toHaveBeenCalledWith('users.password');
      expect(qb.where).toHaveBeenCalledWith('users.email = :email', {
        email: 'test@example.com',
      });
      expect(qb.getOne).toHaveBeenCalled();
      expect(result).toEqual(null);
    });

    it('should return the user with password if it exists', async () => {
      const qb = usersRepository.createQueryBuilder(
        'users',
      ) as jest.Mocked<any>;
      qb.getOne.mockResolvedValue(createdUser);
      const result =
        await userService.findUserByEmailWithPassword('ludmila@gmail.com');
      expect(qb.addSelect).toHaveBeenCalledWith('users.password');
      expect(qb.where).toHaveBeenCalledWith('users.email = :email', {
        email: 'ludmila@gmail.com',
      });
      expect(qb.getOne).toHaveBeenCalled();
      expect(result).toEqual(createdUser);
    });
  });

  describe('findUserByGoogleId', () => {
    it('should return null if the user does not exist', async () => {
      usersRepository.findOneBy.mockResolvedValue(null);
      const result = await userService.findUserByGoogleId('1061234567890');
      expect(result).toEqual(null);
    });

    it('should return the user if it exists', async () => {
      usersRepository.findOneBy.mockResolvedValue(createdUser);
      const result = await userService.findUserByGoogleId('20987654321');
      expect(result).toEqual(createdUser);
    });
  });

  describe('findUserById', () => {
    it('should return null if the user does not exist', async () => {
      usersRepository.findOneBy.mockResolvedValue(null);
      const result = await userService.findUserById(
        '1f1a4b52-aafc-41ea-a865-361d87271338',
      );
      expect(result).toEqual(null);
    });

    it('should return the user if it exists', async () => {
      usersRepository.findOneBy.mockResolvedValue(createdUser);
      const result = await userService.findUserById(
        '2g2b5c94-aafc-41ea-a865-361d87271338',
      );
      expect(result).toEqual(createdUser);
    });
  });

  describe('createGoogleUser', () => {
    it('should create a new google user successfully', async () => {
      usersRepository.create.mockReturnValue(createdGoogleUser);
      usersRepository.save.mockResolvedValue(createdGoogleUser);
      const result = await userService.createGoogleUser(createGoogleUserDto);
      expect(result).toEqual(createdGoogleUser);
      expect(usersRepository.create).toHaveBeenCalledWith({
        name: createGoogleUserDto.displayName,
        email: createGoogleUserDto.email,
        auth_provider: AuthProvider.GOOGLE,
        google_id: createGoogleUserDto.id,
        avatar_url: createGoogleUserDto.avatar,
        is_active: true,
      });
      expect(usersRepository.save).toHaveBeenCalledWith(createdGoogleUser);
    });
  });
});
