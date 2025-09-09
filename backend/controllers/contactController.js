// controllers/contactController.js
import sendMail from "../utils/sendMail.js"; // Utility function to send mail
import contactAuth from "../zod/contactAuth.js";

export const contactForm = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validate request body using Zod
    const { success, error } = contactAuth.safeParse(req.body);
    if (!success || error) {
      return res.status(400).json({
        msg: "Invalid input data",
        error: error,
      });
    }

    // Email subject and HTML message
    const subject = "Query Regarding";
    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 30px auto; padding: 30px; border-radius: 6px; border: 1px solid #ddd; background-color: #ffffff;">
        <h2 style="color: #2c3e50; margin-top: 0;">User Query Submission</h2>
        <p style="font-size: 16px; color: #333;">Dear <strong>✪Mʀ.SR's🛡️Sʜɪᴇʟᴅ CℽBer Cᴀғᴇ☆ Team</strong>,</p>
        <p style="font-size: 16px; color: #333;">You have received a new query from a user. Below are the details:</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 16px; color: #333; margin: 20px 0;">
          <tr>
            <td style="padding: 10px; font-weight: bold;">Name:</td>
            <td style="padding: 10px;">${name}</td>
          </tr>
          <tr style="background-color: #f9f9f9;">
            <td style="padding: 10px; font-weight: bold;">Email:</td>
            <td style="padding: 10px;">${email}</td>
          </tr>
        </table>
        <div style="background-color: #f4f8ff; border-left: 4px solid #007BFF; padding: 20px; border-radius: 4px;">
          <p style="margin: 0; font-size: 16px; color: #333;"><strong>Message:</strong></p>
          <p style="margin: 10px 0 0 0; font-size: 16px; color: #333; line-height: 1.6;">${message}</p>
        </div>
        <p style="font-size: 14px; color: #777; text-align: center; margin-top: 40px;">✪Mʀ.SR's🛡️Sʜɪᴇʟᴅ CℽBer Cᴀғᴇ☆ Contact Form System</p>
      </div>
    `;

    // Send email using utility function
    await sendMail(subject, htmlMessage, process.env.SMTP_MAIL, email);

    // Respond success
    res.status(200).json({
      msg: "Query sent successfully — Check your inbox and spam folder",
    });
  } catch (error) {
    console.error("Error in contactForm:", error.message);
    res.status(500).json({
      msg: "Internal Server Error",
    });
  }
};
