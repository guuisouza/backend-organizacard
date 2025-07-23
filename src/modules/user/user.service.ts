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

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async createLocalUser({
    name,
    email,
    password,
  }: CreateUserDto): Promise<{ id: string }> {
    // Checar se o email já existe
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
}
