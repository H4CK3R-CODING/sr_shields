import Announcement from "../models/Announcement.js";

/**
 * @desc   Create new announcement
 * @route  POST /api/announcements
 */
export const addAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.create(req.body);
    res.status(201).json({ success: true, message : "Added Successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Get all announcements (optional filter by category, search, pagination)
 * @route  GET /api/announcements?category=notice&search=exam&page=1&limit=10
 */
export const getAnnouncements = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    // console.log(category, search, page , limit  )
    const filter = {};
    if (category) filter.category = category;
    if (search) filter.title = { $regex: search, $options: "i" };

    const announcements = await Announcement.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Announcement.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: announcements,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Get single announcement
 * @route  GET /api/announcements/:id
 */
export const getAnnouncementById = async (req, res) => {
  try {
    const announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ success: false, message: "Announcement not found" });
    }

    res.status(200).json({ success: true, data: announcement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Update announcement
 * @route  PUT /api/announcements/:id
 */
export const updateAnnouncement = async (req, res) => {
  try {
    const updated = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: "Announcement not found" });
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Delete announcement
 * @route  DELETE /api/announcements/:id
 */
export const deleteAnnouncement = async (req, res) => {
  try {
    const deleted = await Announcement.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Announcement not found" });
    }

    res.status(200).json({ success: true, message: "Announcement deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
