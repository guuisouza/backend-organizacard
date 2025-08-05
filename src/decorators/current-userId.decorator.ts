import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

export const CurrentUserId = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    if (!request.user || !request.user.id) {
      throw new UnauthorizedException('User not authenticated');
    }

    return request.user.id;
  },
);
