import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${token}`

  await resend.emails.send({
    from: process.env.EMAIL_FROM || 'Uzstagram <noreply@uzstagram.com>',
    to: email,
    subject: 'Uzstagram - Email tasdiqlash',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 32px;">
            Uzstagram
          </h1>
        </div>
        <div style="background: #f9f9f9; border-radius: 10px; padding: 30px;">
          <h2 style="color: #333; margin-bottom: 15px;">Email manzilingizni tasdiqlang</h2>
          <p style="color: #666; margin-bottom: 25px;">
            Uzstagram ga xush kelibsiz! Hisobingizni faollashtirish uchun quyidagi tugmani bosing:
          </p>
          <div style="text-align: center;">
            <a href="${verifyUrl}"
              style="background: linear-gradient(45deg, #f09433, #dc2743, #bc1888);
                color: white; padding: 14px 32px; border-radius: 8px;
                text-decoration: none; font-weight: bold; font-size: 16px;">
              Emailni tasdiqlash
            </a>
          </div>
          <p style="color: #999; margin-top: 25px; font-size: 13px;">
            Bu havola 24 soat ichida yaroqsiz bo'ladi. Agar siz ro'yxatdan o'tmagan bo'lsangiz, bu xabarni e'tiborsiz qoldiring.
          </p>
        </div>
      </div>
    `,
  })
}

export async function sendWelcomeEmail(email: string, username: string) {
  await resend.emails.send({
    from: process.env.EMAIL_FROM || 'Uzstagram <noreply@uzstagram.com>',
    to: email,
    subject: "Uzstagram'ga xush kelibsiz! 🎉",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="text-align: center; background: linear-gradient(45deg, #f09433, #bc1888);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Uzstagram</h1>
        <h2>Salom, @${username}! 👋</h2>
        <p>Uzstagram'ga xush kelibsiz! Endi do'stlaringiz bilan rasmlar va videolar ulashishingiz mumkin.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}"
          style="background: linear-gradient(45deg, #f09433, #bc1888); color: white;
            padding: 12px 24px; border-radius: 8px; text-decoration: none;">
          Boshlash
        </a>
      </div>
    `,
  })
}
