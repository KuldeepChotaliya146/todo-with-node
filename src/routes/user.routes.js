import { Router } from "express";
import { registerUser, loginUser, logoutUser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails } from "../controllers/user.controller.js";
import VerifyJWT from "../middlewares/auth.middleware.js";


const router = Router()

router.route("/register").post(registerUser)
router.route("/login").post(loginUser)
router.route("/logout").delete(VerifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").patch(VerifyJWT, changeCurrentPassword)
router.route("/current-user").get(VerifyJWT, getCurrentUser)
router.route("/update-account").patch(VerifyJWT, updateAccountDetails)

export default router