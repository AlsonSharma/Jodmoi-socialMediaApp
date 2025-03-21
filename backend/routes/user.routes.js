import { Router } from "express";
import multer from "multer";
import { login, register, uploadProfilePicture, updateUserProfile, getUserAndProfile, updateProfileData, getAllUserProfile, downloadProfile, sendConnectionRequest, getMyConnections, acceptConnectionRequest, getMyConnectionRequests, commentPost, getUserProfileThroughUsername } from "../controllers/user.controller.js";
const router = Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    },
})

const upload = multer({ storage: storage })

router.route("/update_profile_picture")
    .post(upload.single("profile_picture"), uploadProfilePicture);
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/user_update").post(updateUserProfile);
router.route("/get_user_and_profile").get(getUserAndProfile);
router.route("/update_profile_data").post(updateProfileData);
router.route("/user/get_all_users").get(getAllUserProfile);
router.route("/user/get_profile_through_username").get(getUserProfileThroughUsername);
router.route("/comment").post(commentPost);
router.route("/user/download_resume").get(downloadProfile);
router.route("/user/send_connection_request").post(sendConnectionRequest);
router.route("/user/getConnectionRequests").get(getMyConnectionRequests);
router.route("/user/user_connection_request").get(getMyConnections);
router.route("/user/accept_connection_request").post(acceptConnectionRequest);

export default router;