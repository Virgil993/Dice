import nodemailer from "nodemailer";

export function emailHtmlResetPassword(link: string, email: string) {
  const htmlText = `<h1>Hello, ${email} </h1>
    <br>
    <div>Click the button to change your password.</div>
    <br>
    <a href=${link}><button>Change password</button></a>
    <br>
    <div>If you didn't send us the password change request, please ignore this email.</div>
    <br>
    <br>
    <footer>This email has been generated automatically. Please do not reply to it</footer>
    `;
  return htmlText;
}

export function emailHtmlVerifyAccount(link: string, email: string) {
  const htmlText = `<h1>Hello, ${email} </h1>
      <br>
      <div>Click the button to verify your Dice account.</div>
      <br>
      <a href=${link}><button>Verify account</button></a>
      <br>
      <div>If you don't remember creating your account, please contact us at dicedmn@gmail.com.</div>
      <br>
      <br>
      <footer>This email has been generated automatically. Please do not reply to it</footer>
      `;
  return htmlText;
}

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT as string),
  secure: true,
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: true,
  },
});
