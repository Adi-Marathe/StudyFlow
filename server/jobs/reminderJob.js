// jobs/reminderJob.js
const cron = require("node-cron");
const Event = require("../models/Event");
const User  = require("../models/User");
const { sendReminderEmail } = require("../utils/emailService");

/*
  Runs every minute.
  Finds events whose reminder window falls within the current minute,
  sends an email, and marks the reminder as sent so it doesn't fire again.
*/

const startReminderJob = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now    = new Date();
      const soon   = new Date(now.getTime() + 60 * 1000); // +1 min window

      /*
        Find events where:
        - reminder > 0 (user wants a reminder)
        - reminderSent is NOT true (haven't emailed yet)
        - (start - reminder minutes) falls within the next 1 minute
        
        We query a generous window and filter precisely in JS to avoid
        timezone edge cases.
      */
      const events = await Event.find({
        reminder:     { $gt: 0 },
        reminderSent: { $ne: true },
        start:        { $gt: now }, // event hasn't started yet
      }).populate("user", "name email");

      for (const event of events) {
        const reminderFiresAt = new Date(
          new Date(event.start).getTime() - event.reminder * 60 * 1000
        );

        /* Fire if reminderFiresAt is within [now, now + 1 min] */
        if (reminderFiresAt >= now && reminderFiresAt < soon) {
          const user = event.user;
          if (!user?.email) continue;

          try {
            await sendReminderEmail({
              toEmail: user.email,
              toName:  user.name,
              event,
            });

            /* Mark as sent so cron doesn't re-fire */
            await Event.findByIdAndUpdate(event._id, { reminderSent: true });
          } catch (emailErr) {
            console.error(
              `❌ Failed to send reminder for "${event.title}":`,
              emailErr.message
            );
          }
        }
      }
    } catch (err) {
      console.error("❌ Reminder cron error:", err.message);
    }
  });

  console.log("⏰ Reminder job started — checking every minute");
};

module.exports = { startReminderJob };