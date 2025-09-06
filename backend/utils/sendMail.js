import nodemailer from "nodemailer";

const sendMail = async (subject, message, gmailTo, gmailFrom) => {
  const mailFrom = gmailFrom || process.env.SMTP_MAIL;
  const mailTo = gmailTo;
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false, // Use `true` for port 465, `false` for all other ports
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOption = {
      from: `${mailFrom}`,
      to: `${mailTo}`, // list of receivers
      subject: subject, // Subject line
      text: "Hi", // plain text body
      html: message,
    };

    await transporter.sendMail(mailOption);
    console.log("Send Successfully");
  } catch (error) {
    console.log("send mail ", error);
  }
};

export default sendMail;
