import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';
import { SafeUser } from '../../../shared/types/safe-user';
import { JwtPayload } from '../../../shared/types/jwt-payload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<SafeUser> {
    const user = await this.userService.findUserById(payload.sub);

    console.log('Chamou o método findUserById com esse user:', user);

    if (!user || !user.is_active) {
      throw new UnauthorizedException('Invalid token');
    }

    const { password: _, ...safeUser } = user;
    return safeUser;
  }
}
