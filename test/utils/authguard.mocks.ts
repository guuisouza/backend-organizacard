import { CanActivate } from '@nestjs/common';

export const localAuthGuardMock: CanActivate = {
  canActivate: jest.fn(() => true),
};

export const googleAuthGuardMock: CanActivate = {
  canActivate: jest.fn(() => true),
};

export const jwtAuthGuardMock: CanActivate = {
  canActivate: jest.fn(() => true),
};
