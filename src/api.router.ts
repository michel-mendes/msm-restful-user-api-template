import { Router, Request, Response } from "express"
import userController from "./models/users/user.controller"

const router = Router()

// User routes
router.use('/user', userController)

export default router