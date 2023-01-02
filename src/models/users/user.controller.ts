import { Router, NextFunction, Request, Response } from "express"
import { Request as JwtRequest } from "express-jwt"
import { IUser } from "./user"
import { userService } from "./user.services"
import { AppError } from "../../middleware/error-handler"
import Roles from "../../types/user-roles"
import Logger from "../../../config/logger"

// Validations
import { validateData } from "../../middleware/validation-handler"

import {
    userCreateValidation,
    userAuthenticationValidation,
    userForgotPasswordValidator,
    userResetPasswordValidator
} from "../../middleware/user-validator"

import { userAuthorize } from "../../middleware/user-authorize"

// Routes related to Users
const userRouter = Router()

userRouter.post('/register', userCreateValidation(), validateData, insertNewUser)
userRouter.get('/verify-user', verifyUserAccount)
userRouter.post('/authenticate', userAuthenticationValidation(), validateData, authenticate)
userRouter.post('/forgot-password', userForgotPasswordValidator(), validateData, forgotPassword)
userRouter.get('/reset-password', renderChangePasswordPage)
userRouter.post('/reset-password', userResetPasswordValidator(), validateData, resetPassword)
userRouter.get('/', userAuthorize( Roles.admin ), listAllUsers)
userRouter.get('/:id', userAuthorize(), getById)
userRouter.put('/:id', userAuthorize(), updateUser)
userRouter.delete('/:id', userAuthorize(), deleteUser)

export default userRouter


// Controller functions
//-----------------------------------------------------------------------------------

async function authenticate(req: Request, res: Response, next: NextFunction) {
    try {
        const { password, email } = req.body
        const ipAddress = req.ip

        const authResult = await userService.authenticateUser( email, password, ipAddress )

        res.status(200).json( authResult )
    }
    catch (error: any) {
        Logger.error(`Error while user authentication: ${ error.message }`)
        return next( error )
    }
}

async function verifyUserAccount(req: Request, res: Response, next: NextFunction) {
    try {
        await userService.verifyEmail( <string>req.query.token )

        return res.status(200).render('verify-user', {message: "User verification successful, now you can log in!"})
        // return res.status(200).json({message: "User verification successful, now you can log in!"})
    }
    catch (error: any) {
        const code = error.code ? error.code : 500

        Logger.error(`Error while user email verification: ${ error.message }`)

        return res.status( code ).render('verify-user', {message: error.message })
        // return next( error )
    }
}

async function forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
        await userService.forgotPassword( req.body.email, req.get('host') )

        return res.status(200).json( {message: `If there is a registered email address, you will receive an email containing the necessary instructions.`} )
    }
    catch (error: any) {
        Logger.error(`Error while sending the reset password email: ${ error.message }`)        
        return next( error )
    }
}

function renderChangePasswordPage(req: Request, res: Response, next: NextFunction) {
    // res.status(301).redirect( '[URL_TO_FRONTEND_CHANGE_PASSWORD_HERE]' + `?token=${ req.query.token }` )
    res.render('change-user-password-page')
}

async function resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
        await userService.resetPassword( req.body.token, req.body.password )

        return res.status(200).json({message: `Password reset successful, you can now login`})
    }
    catch (error: any) {
        Logger.error(`Error while setting the new password: ${ error.message }`)        
        return next( error )
    }
}

async function insertNewUser(req: Request, res: Response, next: NextFunction) {
    try {
        // console.log(`Origem da requisição: ${ req.get('origin') }`)

        const userData = req.body
        const hostAddress = req.get("host")

        const newUser: IUser = await userService.create( userData, hostAddress )

        return res.status(201).json( newUser )
    }
    catch (error: any) {
        Logger.error(`Error while user registration: ${ error.message }`)
        return next( error )
    }
}

async function listAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
        const usersList: IUser[] = await userService.getAll()

        return res.status(200).json( usersList )
    }
    catch (e: any) {
        Logger.error( `Error while getting users list: ${ e.message }` )
        return next( e )
    }

}

async function getById(req: JwtRequest, res: Response, next: NextFunction) {
    try {

        // Allow Admin to get any user and normal users to get only themselves
        blockRegularUserToGetOutherUsers( req.auth?.userId, req.auth?.userRole, req.params.id )
        
        let user: IUser = await userService.getById( req.params.id )

        return res.status(200).json( user )
    }
    catch (e: any) {
        Logger.error( `Error while getting user by id: ${ e.message }` )
        return next( e )    
    }
}

async function updateUser(req: JwtRequest, res: Response, next: NextFunction) {
    try {
        // Allow Admin to update any user and normal users to update only themselves
        blockRegularUserToGetOutherUsers( req.auth?.userId, req.auth?.userRole, req.params.id )
        
        const changedUser = await userService.update( req.params.id, req.body )

        return res.status(200).json( changedUser )
    }
    catch (e: any) {
        Logger.error( `Error while updating user data: ${ e.message }` )
        return next( e )
    }
}

async function deleteUser(req: JwtRequest, res: Response, next: NextFunction) {
    try {
        // Allow Admin to delete any user and normal users to delete only themselves
        blockRegularUserToGetOutherUsers( req.auth?.userId, req.auth?.userRole, req.params.id )
        
        await userService._delete( req.params.id )
        
        return res.status(200).json( {message: "User successfully deleted"} )
    }
    catch (e: any) {
        Logger.error( `Error while deleting user: ${ e.message }` )
        return next(e)
    }
}

// Helper functions
function blockRegularUserToGetOutherUsers(requestingUserId: string, requestingUserRole: string, targetUserId: string) {
    if (
        requestingUserId !== targetUserId &&
        requestingUserRole !== Roles.admin    
    ) {
        throw new AppError( 'Unauthorized access', 401 )
    }
}