import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SafeUser } from '../../../shared/types/safe-user';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL:
        'http://localhost:3003/organizacard/api/auth/google/redirect',
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<SafeUser> {
    const { id, displayName, emails, photos } = profile;
    console.log('Dados originais do google:', id, displayName, emails, photos);

    const email = emails?.[0]?.value;

    console.log('Dados verificados do email:', email);

    if (!email) {
      throw new UnauthorizedException(
        "Your google account doesn't have an valid email",
      );
    }

    const avatar = photos?.[0]?.value;

    console.log('Dados verificados do avatar:', avatar);

    const user = await this.authService.validateGoogleUser({
      id,
      displayName,
      email,
      avatar,
    });

    const { password: _, ...safeUser } = user;
    return safeUser;
  }
}
