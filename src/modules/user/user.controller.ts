import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common';
import { CreateUserDto, createUserSchema } from './dto/create-user.dto';
import { ZodValidationPipe } from 'src/pipes/zod-validation.pipe';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register/local')
  @UsePipes(new ZodValidationPipe(createUserSchema))
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createLocalUser(createUserDto);
  }

  @HttpCode(204)
  @Get('activate')
  async activateUser(@Query('token') token: string) {
    return this.userService.activateLocalUser(token);
  }
}
