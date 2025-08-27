import { EmailService } from '../../src/modules/email/email.service';

export const emailServiceMock = {
  provide: EmailService,
  useValue: {
    sendEmail: jest.fn(),
  },
};
