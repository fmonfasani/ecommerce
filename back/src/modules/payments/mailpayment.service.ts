import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { google } from 'googleapis';
import { ConfigService } from '@nestjs/config';
import { access } from 'fs';

@Injectable()
export class MailPaymentService {
  private oauth2Client;
  private transporter;
  private baseUrl: string;

  constructor(private configService: ConfigService) {
    //this.baseUrl = this.configService.get<string>('BASE_URL');
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      //(this.baseUrl = 'https://developers.google.com/oauthplayground'),
      (this.baseUrl = 'https://pupshops-backend.onrender.com'), 
      //(this.baseUrl = 'https://0b26-190-17-115-142.ngrok-free.app'), 
    );

    this.oauth2Client.setCredentials({
      refresh_token: process.env.OAUTH_REFRESH_TOKEN,
    });

    this.setupTransporter();
  }
  async setupTransporter() {
    try {
      /*const { token } = await this.oauth2Client.getAccessToken();
      if (!token) {
        throw new Error('No se pudo obtener el token de acceso');
      }
      console.log('Access Token obtenido:', token);*/

      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: 'pupshopscompany@gmail.com',
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          refreshToken: process.env.OAUTH_REFRESH_TOKEN,
          accessToken:
            'ya29.a0AcM612yN7ZTK7xa1IO2dUWJbBLgXT3D3OQYWvr4Y13VnnJ-A1s7wvU_qn_oqbNOrv4jDazBC_tcd3VpRaZCDwX6vvt7Kbt-0GFieuavhVJPOF41crlWEyp-fiG_FJD2WXYNYc_uT463D-4V7Fzub3P_uCeMkURHmTo3erviFaCgYKATcSARISFQHGX2MiUVsF0hL30GHCdng__n46bQ0175',
        },
      });
    } catch (error) {
      console.error(
        'Error en la configuración del transporter:',
        error.message,
      );
      this.transporter = undefined;
    }
  }

  async sendMail(to: string, subject: string, text: string) {
    await this.setupTransporter();

    console.log('Transporter configurado con éxito');

    if (!this.transporter) {
      console.error(
        'Error: transporter is not defined. No se puede enviar el correo.',
      );
      return;
    }

    const mailOptions = {
      from: 'pupshopscompany@gmail.com',
      to,
      subject,
      text,
    };

    try {
      console.log(`Intentando enviar correo a ${to} con asunto ${subject}`);
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Correo enviado:', info.response);
    } catch (error) {
      console.error('Error enviando el correo:', error);
    }
  }
  async sendPaymentNotificationToSeller(orderId: string, amount: number) {
    const to = 'pupshopscompany@gmail.com'; // Correo del vendedor (PupShops)
    const subject = 'Notificación de pago exitoso';
    const text = `
      Hola PupShops,

      Se ha realizado un pago exitoso para la orden ${orderId}.

      Monto total: $${amount.toFixed(2)}

      Por favor, revisa tu sistema para procesar la orden.
      
      Saludos,
      El sistema de notificaciones de PupShops.
    `;
    console.log(
      `Enviando correo al vendedor para la orden ${orderId} con monto ${amount}`,
    );

    try {
      await this.sendMail(to, subject, text);
    } catch (error) {
      console.error(
        'Error enviando el correo de notificación de pago al vendedor:',
        error.message,
      );
    }
  }
}
