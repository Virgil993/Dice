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

export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  service: "Gmail",
  auth: {
    user: "dicedmn@gmail.com",
    pass: "wqcuzfkabpumdndb",
  },
  tls: {
    rejectUnauthorized: true,
  },
});
