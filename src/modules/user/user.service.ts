import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthProvider, User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { EmailService } from '../email/email.service';
import { GoogleProfile } from '../../shared/types/google-profile';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private readonly emailService: EmailService,
  ) {}

  async createLocalUser({
    name,
    email,
    password,
  }: CreateUserDto): Promise<{ id: string }> {
    const userExists = await this.usersRepository.findOneBy({
      email,
    });

    if (userExists) {
      throw new ConflictException('This user email already exists');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const activationToken = crypto.randomUUID();

    const user = this.usersRepository.create({
      name,
      email,
      password: hashedPassword,
      auth_provider: AuthProvider.LOCAL,
      is_active: false,
      activation_token: activationToken,
    });

    const createdUser = await this.usersRepository.save(user);

    // Maybe add a queue service here for sending emails in the future
    void this.emailService.sendEmail(email, activationToken).catch((err) => {
      console.log('Failed to send email', err);
    });

    return {
      id: createdUser.id,
    };
  }

  async activateLocalUser(token: string) {
    const user = await this.usersRepository.findOneBy({
      activation_token: token,
    });

    if (!user) {
      throw new NotFoundException('Invalid token');
    }

    user.is_active = true;
    user.activation_token = null;

    await this.usersRepository.save(user);
  }

  async findUserByEmailWithPassword(email: string): Promise<User | null> {
    // we have to add a select password because in user entity it is hidden on select queries by default
    return this.usersRepository
      .createQueryBuilder('users')
      .addSelect('users.password')
      .where('users.email = :email', { email })
      .getOne();
  }

  async findUserByGoogleId(googleId: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ google_id: googleId });
  }

  async createGoogleUser({
    id,
    displayName,
    email,
    avatar,
  }: GoogleProfile): Promise<User> {
    const newUser = this.usersRepository.create({
      name: displayName,
      email,
      auth_provider: AuthProvider.GOOGLE,
      google_id: id,
      avatar_url: avatar,
      is_active: true,
    });

    await this.usersRepository.save(newUser);

    return newUser;
  }
}
