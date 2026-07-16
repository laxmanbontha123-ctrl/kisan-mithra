export interface SmsOtpSendInput {
  phone: string;
  otp: string;
}

function withIndiaCountryCode(phone: string): string {
  const digits = phone.replace(/\D/g, "");

  if (digits.length === 10) {
    return `91${digits}`;
  }

  return digits;
}

export class SmsService {
  public async sendOtp(input: SmsOtpSendInput): Promise<void> {
    const authKey = process.env.MSG91_AUTH_KEY;
    const templateId = process.env.MSG91_OTP_TEMPLATE_ID;

    if (!authKey || !templateId) {
      console.warn("MSG91 is not configured. OTP SMS was not sent.");
      return;
    }

    const mobile = withIndiaCountryCode(input.phone);
    const url = new URL("https://control.msg91.com/api/v5/otp");
    url.searchParams.set("template_id", templateId);
    url.searchParams.set("mobile", mobile);
    url.searchParams.set("authkey", authKey);

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        OTP: input.otp,
      }),
    });

    const payload = (await response.json().catch(() => null)) as { message?: string } | null;

    if (!response.ok) {
      throw new Error(payload?.message || "Failed to send OTP SMS.");
    }
  }
}

export const smsService = new SmsService();
export default smsService;
