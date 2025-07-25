import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { LoginLocalDto } from './dto/login-local.dto';
import { JwtService } from '@nestjs/jwt';
import { SafeUser } from './custom-types/safe-user';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async loginLocal(user: SafeUser): Promise<{ access_token: string }> {
    const jwtPayload = {
      sub: user.id,
      email: user.email,
      auth_provider: user.auth_provider,
    };

    return {
      access_token: this.jwtService.sign(jwtPayload),
    };
  }

  async validateUser({ email, password }: LoginLocalDto): Promise<User | null> {
    // we have to add a select password because in user entity it is hidden on select queries by default
    const user = await this.usersRepository
      .createQueryBuilder('users')
      .addSelect('users.password')
      .where('users.email = :email', { email })
      .getOne();

    if (!user || !user.password) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    return isPasswordValid ? user : null;
  }
}
