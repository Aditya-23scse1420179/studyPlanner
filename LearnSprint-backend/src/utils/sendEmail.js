const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!to || !subject || !html) {
      throw new Error("sendEmail requires 'to', 'subject', and 'html' fields.");
    }

    const response = await resend.emails.send({
      from: "LearnSprint <no-reply@mail.apiv1.tech>",
      to,
      subject,
      html,
    });

    return response;
  } catch (err) {
    console.error("[sendEmail error]", err);
    throw err;
  }
};

module.exports = sendEmail;