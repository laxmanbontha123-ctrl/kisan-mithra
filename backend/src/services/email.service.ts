import nodemailer from "nodemailer";

export interface EmailOtpInput {
  to: string;
  otp: string;
  fullName?: string;
}

export class EmailService {
  public isConfigured(): boolean {
    return Boolean(
      process.env.SMTP_HOST &&
        process.env.SMTP_PORT &&
        process.env.SMTP_USER &&
        process.env.SMTP_PASS &&
        process.env.EMAIL_FROM,
    );
  }

  private createTransporter() {
    if (!this.isConfigured()) {
      return null;
    }

    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  public async sendEmailVerificationOtp(input: EmailOtpInput): Promise<void> {
    const transporter = this.createTransporter();

    if (!transporter) {
      console.warn("SMTP email is not configured. Email OTP was not sent.");
      return;
    }

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: input.to,
      subject: "Verify your Kisan Mithra account",
      text: `Your Kisan Mithra email verification OTP is ${input.otp}. This OTP is valid for 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #d1fae5; border-radius: 18px;">
          <h2 style="color: #047857; margin-top: 0;">Kisan Mithra Email Verification</h2>
          <p>Hello ${input.fullName || "Farmer"},</p>
          <p>Use the OTP below to verify your Kisan Mithra account.</p>
          <div style="font-size: 30px; letter-spacing: 8px; font-weight: bold; color: #064e3b; background: #ecfdf5; padding: 16px; border-radius: 12px; text-align: center;">
            ${input.otp}
          </div>
          <p style="color: #475569;">This OTP is valid for 10 minutes. Do not share it with anyone.</p>
          <p style="color: #64748b; font-size: 13px;">If you did not request this, you can safely ignore this email.</p>
        </div>
      `,
    });
  }
}

export const emailService = new EmailService();
export default emailService;
