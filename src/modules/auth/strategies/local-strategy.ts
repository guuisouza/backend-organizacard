import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { loginLocalSchema } from '../dto/login-local.dto';
import { SafeUser } from '../custom-types/safe-user';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<SafeUser> {
    const parsed = loginLocalSchema.safeParse({ email, password });

    if (!parsed.success) {
      throw new UnauthorizedException('Invalid fields or values');
    }

    const validUser = await this.authService.validateUser(parsed.data);

    if (!validUser) {
      throw new UnauthorizedException('Invalid username or password');
    }

    if (validUser.is_active !== true) {
      throw new UnauthorizedException(
        'Your account is not active yet, please check your email to activate your account',
      );
    }

    const { password: _, ...user } = validUser;
    return user;
  }
}
