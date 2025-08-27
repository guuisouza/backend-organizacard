export const bcryptMock = {
  hash: jest.fn().mockResolvedValue('hashed_password'),
};
