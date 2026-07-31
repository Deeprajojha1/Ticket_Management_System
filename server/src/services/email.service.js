import nodemailer from "nodemailer";

let transporter = null;

const isEmailConfigured = () =>
  process.env.SMTP_HOST &&
  process.env.SMTP_PORT &&
  process.env.SMTP_USER &&
  process.env.SMTP_PASS &&
  process.env.EMAIL_FROM;

const getTransporter = () => {
  if (!isEmailConfigured()) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  return transporter;
};

export const sendEmail = async ({ to, subject, html, text }) => {
  const mailer = getTransporter();

  if (!mailer || !to) {
    return null;
  }

  try {
    return await mailer.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      text,
    });
  } catch (error) {
    console.error(`Email send failed: ${error.message}`);
    return null;
  }
};

export const sendTicketCreatedEmail = (user, ticket) =>
  sendEmail({
    to: user.email,
    subject: `Ticket Created: ${ticket.ticketNumber}`,
    text: `Your support ticket ${ticket.ticketNumber} has been created.`,
    html: `<p>Your support ticket <strong>${ticket.ticketNumber}</strong> has been created.</p><p>${ticket.title}</p>`,
  });

export const sendTicketResolvedEmail = (user, ticket) =>
  sendEmail({
    to: user.email,
    subject: `Ticket Resolved: ${ticket.ticketNumber}`,
    text: `Your support ticket ${ticket.ticketNumber} has been resolved.`,
    html: `<p>Your support ticket <strong>${ticket.ticketNumber}</strong> has been resolved.</p><p>${ticket.title}</p>`,
  });
