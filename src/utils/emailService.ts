import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configuración del transporte de correo
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Envía un correo electrónico para restablecer la contraseña
 * @param to Correo electrónico del destinatario
 * @param resetUrl URL para restablecer la contraseña
 */
export async function sendResetPasswordEmail(to: string, resetUrl: string): Promise<void> {
  try {
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_EMAIL}>`,
      to,
      subject: 'Restablecimiento de contraseña',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Restablecimiento de contraseña</h2>
          <p>Hola,</p>
          <p>Hemos recibido una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
          <p style="margin: 25px 0;">
            <a href="${resetUrl}" 
              style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
              Restablecer contraseña
            </a>
          </p>
          <p>Si no solicitaste este restablecimiento, puedes ignorar este correo de manera segura.</p>
          <p>Este enlace expirará en 1 hora.</p>
          <p>Saludos,<br> Anima Studio</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Correo de restablecimiento enviado a: ${to}`);  } catch (error) {
    console.error('Error al enviar el correo de restablecimiento:', error);
    throw new Error('No se pudo enviar el correo de restablecimiento');
  }
}

/**
 * Envía un correo de verificación de email
 * @param to Correo electrónico del destinatario
 * @param verificationUrl URL para verificar el correo electrónico
 */
export async function sendVerificationEmail(to: string, verificationUrl: string): Promise<void> {
  try {
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_EMAIL}>`,
      to,
      subject: 'Verifica tu correo electrónico',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verificación de correo electrónico</h2>
          <p>¡Gracias por registrarte en Anima Studio!</p>
          <p>Por favor, haz clic en el siguiente enlace para verificar tu dirección de correo electrónico:</p>
          <p style="margin: 25px 0;">
            <a href="${verificationUrl}" 
              style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">
              Verificar correo electrónico
            </a>
          </p>
          <p>Si no creaste una cuenta en Anima Studio, puedes ignorar este correo de manera segura.</p>
          <p>Este enlace expirará en 24 horas.</p>
          <p>Saludos,<br> El equipo de Anima Studio</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Correo de verificación enviado a: ${to}`);
  } catch (error) {
    console.error('Error al enviar el correo de verificación:', error);
    throw new Error('No se pudo enviar el correo de verificación');
  }
}

export default {
  sendResetPasswordEmail,
  sendVerificationEmail,
};
