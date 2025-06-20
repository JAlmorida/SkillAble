import express from "express";
import isAuthenticated from "../middleware/isAuthenticated.js";
import { getStreamToken } from "../controllers/chat.controller.js";
import { acceptFriendRequest, getFriendRequests, getMyFriends, getOutgoingFriendReqs, getRecommendedUsers, sendFriendRequest } from "../controllers/chat.controller.js";

const router = express.Router();

router.route("/token").get(isAuthenticated, getStreamToken)

//friend request 

router.route("/friend-request/:id").post(isAuthenticated, sendFriendRequest);
router.route("/friend-request/:id/accept").put(isAuthenticated, acceptFriendRequest);

router.route("/friend-requests").get(isAuthenticated, getFriendRequests);
router.route("/outgoing-friend-requests").get(isAuthenticated, getOutgoingFriendReqs)
router.route("/friends").get(isAuthenticated, getMyFriends);
router.route("/recommend").get(isAuthenticated, getRecommendedUsers);


export default router;