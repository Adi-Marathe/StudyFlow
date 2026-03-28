// jobs/taskDigestJob.js
const cron = require("node-cron");
const Task = require("../models/Task");
const User = require("../models/User");

const runDigest = async () => {
  try {
    const { sendTaskDigestEmail } = require("../utils/taskDigestEmail");

    const userIds = await Task.distinct("user");
    if (userIds.length === 0) return;

    const users = await User.find({ _id: { $in: userIds } }, "name email");

    for (const user of users) {
      if (!user.email) continue;

      const tasks = await Task.find({ user: user._id }).sort({ createdAt: -1 });
      if (tasks.length === 0) continue;

      const stats = {
        total:      tasks.length,
        todo:       tasks.filter((t) => t.status === "To Do").length,
        inProgress: tasks.filter((t) => t.status === "In Progress").length,
        done:       tasks.filter((t) => t.status === "Done").length,
      };

      await sendTaskDigestEmail({
        toEmail: user.email,
        toName:  user.name,
        stats,
        tasks,
      });

      console.log(`📧 Task digest sent → ${user.email}`);
    }

  } catch (err) {
    console.error("❌ Task digest error:", err.message);
  }
};

const startTaskDigestJob = () => {
  setTimeout(() => runDigest(), 5000);

  cron.schedule("0 */3 * * *", () => runDigest());

  console.log("📋 Task digest job started — fires on startup, repeats every 3 hours");
};

module.exports = { startTaskDigestJob };