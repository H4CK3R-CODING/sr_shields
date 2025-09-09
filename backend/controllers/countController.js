import User from "../models/User.js";
import Announcement from "../models/Announcement.js";
const countController = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalAnnouncements = await Announcement.countDocuments();

    res.json({
      users: totalUsers,
      announcements: totalAnnouncements,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
}

export default countController
