import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Function to send email verification
export async function sendEmailVerification(
  email: string,
  name: string,
  verificationToken: string,
) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`;

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Verify your email address",
    html: `<h2>Welcome ${name}!</h2>

      <p>
        Thanks for creating your account.
        Please verify your email address by clicking the button below.
      </p>

      <a
        href="${verificationUrl}"
        style="
          display: inline-block;
          padding: 12px 20px;
          background: #000;
          color: #fff;
          text-decoration: none;
          border-radius: 6px;
        "
      >
        Verify Email
      </a>

      <p>
        This link will expire in 30 minutes.
      </p>
    `,
  });
}

// Function to send password reset email
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetToken: string,
) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Reset your password",
    html: `
      <h2>Hello ${name}!</h2>

      <p>
        We received a request to reset your password.
      </p>

      <p>
        Click the button below to create a new password.
      </p>

      <a
        href="${resetUrl}"
        style="
          display: inline-block;
          padding: 12px 20px;
          background: #000;
          color: #fff;
          text-decoration: none;
          border-radius: 6px;
        "
      >
        Reset Password
      </a>

      <p>
        This link will expire in 30 minutes.
      </p>

      <p>
        If you did not request a password reset,
        you can safely ignore this email.
      </p>
    `,
  });
}
