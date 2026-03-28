// utils/taskDigestEmail.js
const nodemailer = require("nodemailer");

const createTransporter = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

/*
  Sends a task summary digest email to one user.
  stats = { total, todo, inProgress, done }
  tasks = full array of task objects (for the detail list)
*/
const sendTaskDigestEmail = async ({ toEmail, toName, stats, tasks }) => {
  const transporter = createTransporter();

  const now = new Date().toLocaleString("en-US", {
    weekday: "long",
    year:    "numeric",
    month:   "long",
    day:     "numeric",
    hour:    "2-digit",
    minute:  "2-digit",
  });

  /* Progress bar width percentages */
  const todoWidth       = stats.total ? Math.round((stats.todo       / stats.total) * 100) : 0;
  const inProgressWidth = stats.total ? Math.round((stats.inProgress / stats.total) * 100) : 0;
  const doneWidth       = stats.total ? Math.round((stats.done       / stats.total) * 100) : 0;

  /* Motivational line based on progress */
  const motivationLine =
    stats.done === stats.total && stats.total > 0
      ? "🎉 Amazing — you've completed all your tasks!"
      : stats.done === 0
      ? "💪 Time to get started — you've got this!"
      : stats.inProgress > 0
      ? "🔥 Keep going — you're making great progress!"
      : "✅ Some tasks done — keep the momentum!";

  /* Build task rows (max 10 shown to keep email short) */
  const statusColor = (status) =>
    status === "Done"        ? "#10b981" :
    status === "In Progress" ? "#ff7426" :
                               "#4d2c5e";

  const statusBg = (status) =>
    status === "Done"        ? "#d1fae5" :
    status === "In Progress" ? "#fff0e6" :
                               "#ede8f5";

  const taskRows = tasks.slice(0, 10).map((t) => `
    <tr style="border-bottom:1px solid #f0f0f0;">
      <td style="padding:10px 12px;font-size:13px;color:#1e1e1e;max-width:260px;">
        ${t.title}
        ${t.description
          ? `<div style="font-size:11px;color:#999;margin-top:2px;
                         white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
                         max-width:260px;">
               ${t.description.slice(0, 60)}${t.description.length > 60 ? "…" : ""}
             </div>`
          : ""}
      </td>
      <td style="padding:10px 12px;text-align:center;">
        <span style="background:${statusBg(t.status)};color:${statusColor(t.status)};
                     font-size:11px;font-weight:700;border-radius:999px;padding:3px 10px;
                     white-space:nowrap;">
          ${t.status}
        </span>
      </td>
    </tr>
  `).join("");

  const moreTasksNote = tasks.length > 10
    ? `<tr>
        <td colspan="2" style="padding:10px 12px;font-size:12px;color:#aaa;text-align:center;">
          + ${tasks.length - 10} more tasks — log in to view all
        </td>
      </tr>`
    : "";

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
    <body style="margin:0;padding:0;background:#f4f4f8;font-family:'Segoe UI',sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f8;padding:32px 0;">
        <tr><td align="center">
          <table width="560" cellpadding="0" cellspacing="0"
            style="background:#fff;border-radius:16px;overflow:hidden;max-width:560px;">

            <!-- HEADER -->
            <tr>
              <td style="background:linear-gradient(135deg,#4d2c5e,#7b4fa3);
                          padding:28px 32px;text-align:center;">
                <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">
                  📋 Your Task Summary
                </h1>
                <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">
                  ${now}
                </p>
              </td>
            </tr>

            <!-- GREETING -->
            <tr>
              <td style="padding:24px 32px 0;">
                <p style="margin:0;color:#333;font-size:15px;">
                  Hey <strong>${toName || "there"}</strong> 👋
                </p>
                <p style="margin:6px 0 0;color:#666;font-size:13px;line-height:1.6;">
                  Here's your task progress update. ${motivationLine}
                </p>
              </td>
            </tr>

            <!-- STAT CARDS -->
            <tr>
              <td style="padding:20px 32px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <!-- Total -->
                    <td width="23%" style="padding:0 6px 0 0;">
                      <table width="100%" style="background:#f5f0fa;border-radius:12px;text-align:center;">
                        <tr><td style="padding:14px 8px;">
                          <div style="font-size:26px;font-weight:800;color:#4d2c5e;">
                            ${stats.total}
                          </div>
                          <div style="font-size:11px;color:#9a80ad;font-weight:600;
                                      text-transform:uppercase;letter-spacing:0.5px;margin-top:3px;">
                            Total
                          </div>
                        </td></tr>
                      </table>
                    </td>
                    <!-- To Do -->
                    <td width="23%" style="padding:0 6px;">
                      <table width="100%" style="background:#ede8f5;border-radius:12px;text-align:center;">
                        <tr><td style="padding:14px 8px;">
                          <div style="font-size:26px;font-weight:800;color:#4d2c5e;">
                            ${stats.todo}
                          </div>
                          <div style="font-size:11px;color:#9a80ad;font-weight:600;
                                      text-transform:uppercase;letter-spacing:0.5px;margin-top:3px;">
                            To Do
                          </div>
                        </td></tr>
                      </table>
                    </td>
                    <!-- In Progress -->
                    <td width="27%" style="padding:0 6px;">
                      <table width="100%" style="background:#fff0e6;border-radius:12px;text-align:center;">
                        <tr><td style="padding:14px 8px;">
                          <div style="font-size:26px;font-weight:800;color:#ff7426;">
                            ${stats.inProgress}
                          </div>
                          <div style="font-size:11px;color:#ff9a6c;font-weight:600;
                                      text-transform:uppercase;letter-spacing:0.5px;margin-top:3px;">
                            In Progress
                          </div>
                        </td></tr>
                      </table>
                    </td>
                    <!-- Done -->
                    <td width="23%" style="padding:0 0 0 6px;">
                      <table width="100%" style="background:#d1fae5;border-radius:12px;text-align:center;">
                        <tr><td style="padding:14px 8px;">
                          <div style="font-size:26px;font-weight:800;color:#059669;">
                            ${stats.done}
                          </div>
                          <div style="font-size:11px;color:#34d399;font-weight:600;
                                      text-transform:uppercase;letter-spacing:0.5px;margin-top:3px;">
                            Done
                          </div>
                        </td></tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- PROGRESS BARS -->
            <tr>
              <td style="padding:0 32px 20px;">
                <table width="100%" cellpadding="0" cellspacing="0"
                  style="background:#faf8fc;border-radius:12px;padding:0;">
                  <tr><td style="padding:16px 18px;">
                    <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#4d2c5e;">
                      Progress Breakdown
                    </p>

                    <!-- To Do bar -->
                    <div style="margin-bottom:10px;">
                      <div style="display:flex;justify-content:space-between;
                                  font-size:12px;color:#666;margin-bottom:4px;">
                        <span>To Do</span><span>${todoWidth}%</span>
                      </div>
                      <table width="100%" style="background:#e8e0f0;border-radius:999px;height:8px;">
                        <tr><td width="${todoWidth}%"
                          style="background:#4d2c5e;border-radius:999px;height:8px;
                                 line-height:0;font-size:0;">
                          &nbsp;
                        </td></tr>
                      </table>
                    </div>

                    <!-- In Progress bar -->
                    <div style="margin-bottom:10px;">
                      <div style="display:flex;justify-content:space-between;
                                  font-size:12px;color:#666;margin-bottom:4px;">
                        <span>In Progress</span><span>${inProgressWidth}%</span>
                      </div>
                      <table width="100%" style="background:#ffe4cc;border-radius:999px;height:8px;">
                        <tr><td width="${inProgressWidth}%"
                          style="background:#ff7426;border-radius:999px;height:8px;
                                 line-height:0;font-size:0;">
                          &nbsp;
                        </td></tr>
                      </table>
                    </div>

                    <!-- Done bar -->
                    <div>
                      <div style="display:flex;justify-content:space-between;
                                  font-size:12px;color:#666;margin-bottom:4px;">
                        <span>Done</span><span>${doneWidth}%</span>
                      </div>
                      <table width="100%" style="background:#a7f3d0;border-radius:999px;height:8px;">
                        <tr><td width="${doneWidth}%"
                          style="background:#10b981;border-radius:999px;height:8px;
                                 line-height:0;font-size:0;">
                          &nbsp;
                        </td></tr>
                      </table>
                    </div>

                  </td></tr>
                </table>
              </td>
            </tr>

            <!-- TASK LIST -->
            ${tasks.length > 0 ? `
            <tr>
              <td style="padding:0 32px 24px;">
                <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#4d2c5e;">
                  Your Tasks
                </p>
                <table width="100%" cellpadding="0" cellspacing="0"
                  style="border:1px solid #ede8f5;border-radius:12px;overflow:hidden;">
                  <tr style="background:#faf8fc;">
                    <th style="padding:10px 12px;text-align:left;font-size:11px;
                                font-weight:700;color:#9a80ad;text-transform:uppercase;
                                letter-spacing:0.5px;">Task</th>
                    <th style="padding:10px 12px;text-align:center;font-size:11px;
                                font-weight:700;color:#9a80ad;text-transform:uppercase;
                                letter-spacing:0.5px;width:100px;">Status</th>
                  </tr>
                  ${taskRows}
                  ${moreTasksNote}
                </table>
              </td>
            </tr>` : ""}

            <!-- FOOTER -->
            <tr>
              <td style="background:#f9f7fc;padding:16px 32px;text-align:center;
                          border-top:1px solid #ede8f5;">
                <p style="margin:0;color:#aaa;font-size:12px;">
                  StudyFlow · Task digest sent every 3 hours.
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
    subject: `📋 Your Task Update — ${stats.done}/${stats.total} done · ${now}`,
    html,
  });

  console.log(`📧 Task digest sent → ${toEmail} (${stats.done}/${stats.total} done)`);
};

module.exports = { sendTaskDigestEmail };