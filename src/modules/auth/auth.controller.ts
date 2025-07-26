import { Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { SafeUser } from '../../shared/types/safe-user';
import { GoogleAuthGuard } from './guards/google-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('local/login')
  @UseGuards(LocalAuthGuard)
  async localLogin(@Req() req: { user: SafeUser }) {
    const user = req.user;
    return this.authService.issueJwtForUser(user);
  }

  @Get('google/login')
  @UseGuards(GoogleAuthGuard)
  googleLogin() {}

  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  async googleRedirect(@Req() req: { user: SafeUser }) {
    const user = req.user;
    return this.authService.issueJwtForUser(user);
  }
}
