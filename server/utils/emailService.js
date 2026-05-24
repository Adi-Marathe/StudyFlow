// utils/emailService.js
const axios = require('axios');

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyrNxLSyuAqBuIOaij930Ax4EVgdboS91ExmEMvN1HYq7mYOyfUTzOksfRxWwmaXYuzkQ/exec';

/* ─── Verify connection ─── */
const verifyEmailService = () => {
  console.log(`✅ Email service ready (Using Google Apps Script API via HTTPS)`);
};

/* ─────────────────────────────────────────
   sendReminderEmail
───────────────────────────────────────── */
const sendReminderEmail = async ({ toEmail, toName, event }) => {
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

  try {
    await axios.post(GOOGLE_SCRIPT_URL, {
      to: toEmail,
      subject: \`⏰ Reminder: "\${event.title}" starts in \${reminderLabel}\`,
      htmlBody: html
    });
    console.log(\`📧 Reminder sent → \${toEmail} for "\${event.title}"\`);
  } catch (error) {
    console.error('❌ Failed to send reminder email:', error.message);
  }
};

/* ─────────────────────────────────────────
   sendPasswordResetEmail
───────────────────────────────────────── */
async function sendPasswordResetEmail({ toEmail, toName, otp }) {
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
                <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">🔐 Password Reset</h1>
                <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">
                  Use the code below to reset your password
                </p>
              </td>
            </tr>

            <!-- BODY -->
            <tr>
              <td style="padding:28px 32px;">
                <p style="margin:0 0 20px;color:#333;font-size:15px;">
                  Hi <strong>${toName || "there"}</strong> 👋
                </p>

                <p style="margin:0 0 8px;color:#555;font-size:14px;">
                  We received a request to reset your StudyFlow password. Enter this code to continue:
                </p>

                <!-- OTP Box -->
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="padding:24px 0;">
                      <div style="display:inline-block;background:#faf8fc;border:2px dashed #7b4fa3;
                                  border-radius:12px;padding:16px 32px;letter-spacing:12px;
                                  font-size:36px;font-weight:800;color:#4d2c5e;">
                        ${otp}
                      </div>
                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 6px;color:#888;font-size:13px;line-height:1.6;">
                  ⏳ This code expires in <strong>10 minutes</strong>.
                </p>
                <p style="margin:0;color:#888;font-size:13px;line-height:1.6;">
                  If you didn't request this, you can safely ignore this email — your password will remain unchanged.
                </p>
              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="background:#f9f7fc;padding:16px 32px;text-align:center;
                          border-top:1px solid #ede8f5;">
                <p style="margin:0;color:#aaa;font-size:12px;">
                  StudyFlow · Never share this code with anyone.
                </p>
              </td>
            </tr>

          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;

  try {
    await axios.post(GOOGLE_SCRIPT_URL, {
      to: toEmail,
      subject: \`🔐 Your StudyFlow password reset code: \${otp}\`,
      htmlBody: html
    });
    console.log(\`📧 Password reset OTP sent → \${toEmail}\`);
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error.message);
    throw error; // Re-throw so authController catches it
  }
}

module.exports = { sendReminderEmail, verifyEmailService, sendPasswordResetEmail };