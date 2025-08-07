import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import { acceptFriendRequest, createCourseGroupchat, deleteAcceptedFriendRequest, getFriendRequests, getMyFriends, getOutgoingFriendReqs, getRecommendedUsers, getStreamToken, getUserCourseGroupChats, joinCourseGroupChat, leaveCourseGroupChat, sendFriendRequest, checkGroupChatMembership, rejoinCourseGroupChat } from "../controllers/chat.controller.js";

const router = express.Router();

router.route("/token").get(isAuthenticated, getStreamToken)

router.route("/friend-request/:id").post(isAuthenticated, sendFriendRequest);
router.route("/friend-request/:id/accept").put(isAuthenticated, acceptFriendRequest);

router.route("/friend-requests").get(isAuthenticated, getFriendRequests);
router.route("/outgoing-friend-requests").get(isAuthenticated, getOutgoingFriendReqs)
router.route("/friend-requests/accepted/:id").delete(isAuthenticated, deleteAcceptedFriendRequest);

router.route("/friends").get(isAuthenticated, getMyFriends);
router.route("/recommend").get(isAuthenticated, getRecommendedUsers);

router.route("/course-group/:courseId/create").post(isAuthenticated, createCourseGroupchat);
router.route("/course-group/:courseId/join").post(isAuthenticated, joinCourseGroupChat);
router.route("/course-group/:channelId/leave").post(isAuthenticated, leaveCourseGroupChat);
router.route("/course-group/:courseId/membership").get(isAuthenticated, checkGroupChatMembership);
router.route("/course-group/:courseId/rejoin").post(isAuthenticated, rejoinCourseGroupChat);

router.route("/course-group/my").get(isAuthenticated, getUserCourseGroupChats);

export default router;