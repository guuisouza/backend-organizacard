/* eslint-disable @typescript-eslint/no-explicit-any */
import { Test, TestingModule } from '@nestjs/testing';
import { EmailService } from '../../../src/modules/email/email.service';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

describe('EmailService', () => {
  let emailService: EmailService;
  let configService: jest.Mocked<ConfigService>;
  let sendMailMock: jest.Mock;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'ETHEREAL_PORT') return 587;
      if (key === 'ETHEREAL_USER') return 'fake-user';
      if (key === 'ETHEREAL_PASSWORD') return 'fake-password';
      if (key === 'APP_BASE_URL') return 'http://fake-url';
      return '';
    }),
    getOrThrow: jest.fn(),
  };

  beforeEach(async () => {
    // Este mock do createTransport do construtor precisa ser feito antes da instancia de EmailService ser criada
    sendMailMock = jest.fn().mockResolvedValue({});
    jest.spyOn(nodemailer, 'createTransport').mockReturnValue({
      sendMail: sendMailMock,
    } as any);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    emailService = module.get<EmailService>(EmailService);
    configService = module.get(ConfigService);
  });

  it('should validate the definition of EmailService and ConfigService', () => {
    expect(emailService).toBeDefined();
    expect(configService).toBeDefined();
  });

  it('should send an email', async () => {
    const to = 'xNpDl@example.com';
    const token = 'fake-token';

    await emailService.sendEmail(to, token);

    expect(sendMailMock).toHaveBeenCalledWith({
      from: 'noreply@organizacard.com.br',
      to,
      subject: 'Organizacard - Confirmar cadastro',
      html: `<p>Clique no link para ativar sua conta:</p><a href="http://fake-url/users/activate?token=fake-token">http://fake-url/users/activate?token=fake-token</a>`,
    });
  });
});
