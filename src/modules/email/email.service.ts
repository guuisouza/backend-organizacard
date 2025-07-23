import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: configService.get<number>('ETHEREAL_PORT'),
      auth: {
        user: configService.get<string>('ETHEREAL_USER'),
        pass: configService.get<string>('ETHEREAL_PASSWORD'),
      },
    });
  }

  async sendEmail(to: string, token: string): Promise<void> {
    const baseUrl = this.configService.get<string>('APP_BASE_URL');
    const activationUrl = `${baseUrl}/users/activate?token=${token}`;

    await this.transporter.sendMail({
      from: 'noreply@organizacard.com.br',
      to,
      subject: 'Organizacard - Confirmar cadastro',
      html: `<p>Clique no link para ativar sua conta:</p><a href="${activationUrl}">${activationUrl}</a>`,
    });
  }
}
