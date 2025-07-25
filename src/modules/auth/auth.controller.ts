import { Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { SafeUser } from './custom-types/safe-user';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('local/login')
  @UseGuards(LocalAuthGuard)
  async localLogin(@Req() req: { user: SafeUser }) {
    const user = req.user;
    return this.authService.loginLocal(user);
  }
}
