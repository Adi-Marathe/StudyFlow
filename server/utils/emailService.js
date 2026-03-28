// utils/emailService.js
const nodemailer = require("nodemailer");

/*
  Transporter is created LAZILY (inside the function) so that
  process.env values are guaranteed to be loaded by dotenv before
  nodemailer reads them. Creating it at module-load time can race
  against dotenv.config() in index.js.
*/
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/* ─── Verify connection (call this AFTER dotenv.config()) ─── */
const verifyEmailService = () => {
  const transporter = createTransporter();
  transporter.verify((err) => {
    if (err) {
      console.error("❌ Email transporter error:", err.message);
      console.error(
        "   → Check EMAIL_USER and EMAIL_PASS in your .env file\n" +
        "   → Make sure you're using a Gmail App Password, not your account password\n" +
        "   → Generate one at: https://myaccount.google.com/apppasswords"
      );
    } else {
      console.log(`✅ Email service ready (${process.env.EMAIL_USER})`);
    }
  });
};

/* ─────────────────────────────────────────
   sendReminderEmail
───────────────────────────────────────── */
const sendReminderEmail = async ({ toEmail, toName, event }) => {
  const transporter = createTransporter();

  const startTime = new Date(event.start).toLocaleString("en-US", {
    weekday: "long",
    year:    "numeric",
    month:   "long",
    day:     "numeric",
    hour:    "2-digit",
    minute:  "2-digit",
  });

  const endTime = new Date(event.end).toLocaleTimeString("en-US", {
    hour:   "2-digit",
    minute: "2-digit",
  });

  const reminderLabel =
    event.reminder === 1440 ? "1 day"      :
    event.reminder === 60   ? "1 hour"     :
    event.reminder === 30   ? "30 minutes" :
    event.reminder === 15   ? "15 minutes" :
    event.reminder === 5    ? "5 minutes"  :
    `${event.reminder} minutes`;

  const locationBlock = event.location
    ? `<tr>
        <td style="padding:6px 0;color:#666;font-size:14px;">
          📍 <strong>Location:</strong> ${event.location}
        </td>
      </tr>`
    : "";

  const descriptionBlock = event.description
    ? `<tr>
        <td style="padding:6px 0;color:#666;font-size:14px;">
          📝 <strong>Note:</strong> ${event.description}
        </td>
      </tr>`
    : "";

  const mapsLink = event.location
    ? `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}"
         style="display:inline-block;margin-top:12px;padding:8px 16px;
                background:#4d2c5e;color:#fff;border-radius:8px;
                text-decoration:none;font-size:13px;">
         Open in Google Maps
       </a>`
    : "";

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
    <body style="margin:0;padding:0;background:#f4f4f8;font-family:'Segoe UI',sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f8;padding:32px 0;">
        <tr><td align="center">
          <table width="540" cellpadding="0" cellspacing="0"
            style="background:#fff;border-radius:16px;overflow:hidden;max-width:540px;">

            <!-- HEADER -->
            <tr>
              <td style="background:linear-gradient(135deg,#4d2c5e,#7b4fa3);
                          padding:28px 32px;text-align:center;">
                <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">⏰ Event Reminder</h1>
                <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">
                  Your event starts in <strong>${reminderLabel}</strong>
                </p>
              </td>
            </tr>

            <!-- BODY -->
            <tr>
              <td style="padding:28px 32px;">
                <p style="margin:0 0 20px;color:#333;font-size:15px;">
                  Hi <strong>${toName || "there"}</strong> 👋
                </p>

                <!-- Event card -->
                <table width="100%" cellpadding="0" cellspacing="0"
                  style="background:#faf8fc;border-radius:12px;
                         border-left:4px solid ${event.color || "#ff7426"};">
                  <tr>
                    <td style="padding:18px 20px;">
                      <h2 style="margin:0 0 14px;color:#1e1e1e;font-size:18px;">
                        ${event.title}
                      </h2>
                      <table cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding:6px 0;color:#666;font-size:14px;">
                            🗓️ <strong>Start:</strong> ${startTime}
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:6px 0;color:#666;font-size:14px;">
                            🏁 <strong>End:</strong> ${endTime}
                          </td>
                        </tr>
                        ${locationBlock}
                        ${descriptionBlock}
                      </table>
                      ${mapsLink}
                    </td>
                  </tr>
                </table>

                <p style="margin:20px 0 0;color:#888;font-size:13px;line-height:1.6;">
                  You set this reminder on <strong>StudyFlow</strong>. 
                  Stay focused and have a great event! 🚀
                </p>
              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="background:#f9f7fc;padding:16px 32px;text-align:center;
                          border-top:1px solid #ede8f5;">
                <p style="margin:0;color:#aaa;font-size:12px;">
                  StudyFlow · You're receiving this because you set a reminder.
                </p>
              </td>
            </tr>

          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from:    `"StudyFlow" <${process.env.EMAIL_USER}>`,
    to:      toEmail,
    subject: `⏰ Reminder: "${event.title}" starts in ${reminderLabel}`,
    html,
  });

  console.log(`📧 Reminder sent → ${toEmail} for "${event.title}"`);
};

module.exports = { sendReminderEmail, verifyEmailService };