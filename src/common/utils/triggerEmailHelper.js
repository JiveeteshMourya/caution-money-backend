import FormData from "form-data";
import Mailgun from "mailgun.js";
import ServerError from "../errors/ServerError.js";
import dotenv from "dotenv";
import logger from "./logger.js";

dotenv.config();

// mailgun implementation
const mailgun = new Mailgun(FormData);
const mgClient = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY,
});

export const triggerMailgunEmail = async ({ type, payload }) => {
  const content = buildMailContent({ type, payload });
  const mailData = {
    from: process.env.MAILGUN_FROM_EMAIL,
    ...content,
  };

  try {
    const res = await mgClient.messages.create(
      process.env.MAILGUN_DOMAIN,
      mailData
    );
    return res;
  } catch (err) {
    logger.error(`triggerMailgunEmail - ${type} email failed: ${err.message}`);
    throw new ServerError(500, `Failed to send ${type} email. Try again.`, err);
  }
};

// nodemailer implementation
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_FROM_EMAIL,
    pass: process.env.NODEMAILER_FROM_PASS,
  },
});

export const triggerNodeMailerEmail = async ({ type, payload }) => {
  const content = buildMailContent({ type, payload });
  const mailData = {
    from: process.env.NODEMAILER_FROM_EMAIL,
    ...content,
  };

  try {
    const res = await transporter.sendMail(mailData);
    return res;
  } catch (err) {
    logger.error(
      `triggerNodeMailerEmail - ${type} email failed: ${err.message}`
    );
    throw new ServerError(500, `Failed to send ${type} email. Try Again`, err);
  }
};

const buildMailContent = ({ type, payload }) => {
  switch (type) {
    case "CONTACT_US":
      return {
        to: [payload.toEmail],
        subject: "Contact-Us Form Lead",
        text: `${payload.firstName} filled contact-us form`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2>Contact-Us form filled by ${payload.firstName} ${payload.lastName}</h2>
            <p style="font-size: 16px;">Email: ${payload.email}</p>
            <p style="font-size: 16px;">Message: ${payload.message}</p>
            <hr style="margin: 30px 0;">
            <p style="font-size: 12px; color: #aaa;">This is an automated message. Please do not reply.</p>
          </div>
        `,
      };

    default:
      throw new ServerError(500, "Unknown email type");
  }
};
