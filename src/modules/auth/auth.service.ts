import { Injectable } from '@nestjs/common';
import { User } from '../../entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { LoginLocalDto } from './dto/login-local.dto';
import { JwtService } from '@nestjs/jwt';
import { SafeUser } from '../../shared/types/safe-user';
import { GoogleProfile } from '../../shared/types/google-profile';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateLocalUser({
    email,
    password,
  }: LoginLocalDto): Promise<User | null> {
    const user = await this.userService.findUserByEmailWithPassword(email);
    if (!user || !user.password) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    return isPasswordValid ? user : null;
  }

  async validateGoogleUser({
    id,
    displayName,
    email,
    avatar,
  }: GoogleProfile): Promise<User> {
    const user = await this.userService.findUserByGoogleId(id);

    if (!user) {
      const newUser = await this.userService.createGoogleUser({
        id,
        displayName,
        email,
        avatar,
      });

      return newUser;
    }

    return user;
  }

  async issueJwtForUser(user: SafeUser): Promise<{ access_token: string }> {
    const jwtPayload = {
      sub: user.id,
      email: user.email,
      auth_provider: user.auth_provider,
    };

    return {
      access_token: this.jwtService.sign(jwtPayload),
    };
  }
}
