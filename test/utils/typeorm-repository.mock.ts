export const createTypeormRepositoryMock = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const queryBuilderMock: jest.Mocked<any> = {
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
    delete: jest.fn().mockReturnThis(),
    execute: jest.fn(),
  };

  return {
    create: jest.fn(),
    save: jest.fn(),
    findOneBy: jest.fn(),
    count: jest.fn(),
    findBy: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    find: jest.fn(),
    createQueryBuilder: jest.fn().mockReturnValue(queryBuilderMock),
    queryBuilderMock,
  };
};
