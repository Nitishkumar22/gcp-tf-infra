const Notification = require('../models/notificationModel');

const getNotifications = async (req, res) => {
	try {
		const userId = req.user._id;

		const notifications = await Notification.find({ to: userId }).populate({
			path: "from",
			select: "username profileImg",
		});

		await Notification.updateMany({ to: userId }, { read: true });

		res.status(200).json(notifications);
	} catch (error) {
		console.log("Error in getNotifications function", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

const deleteNotifications = async (req, res) => {
	try {
		const userId = req.user._id;

		await Notification.deleteMany({ to: userId });

		res.status(200).json({ message: "Notifications deleted successfully" });
	} catch (error) {
		console.log("Error in deleteNotifications function", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

const deleteNotification = async (req, res) => {
	try {
		const userId = req.user._id;
		const notificationId = req.params.id;

		const notification = await Notification.findOneAndDelete({ _id: notificationId, to: userId });

		if (!notification) {
			return res.status(404).json({ error: "Notification not found" });
		}

		res.status(200).json({ message: "Notification deleted successfully" });
	} catch (error) {
		console.log("Error in deleteNotification function", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};

module.exports = { getNotifications, deleteNotifications, deleteNotification };