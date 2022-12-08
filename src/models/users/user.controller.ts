import { Router, NextFunction, Request, Response, CookieOptions } from "express"
import { IUser } from "./user"
import { userService } from "./user.services"
import Logger from "../../../config/logger"

// Validations
import { validateData } from "../../middleware/validation-handler"
import { userCreateValidation, userAuthenticationValidation } from "../../middleware/user-validator"

// Routes related to Users
const userRouter = Router()

userRouter.post('/register', userCreateValidation(), validateData, insertNewUser)
userRouter.post('/authenticate', userAuthenticationValidation(), validateData, authenticate)
userRouter.get('/', listAllUsers)
userRouter.get('/:id', getById)
userRouter.put('/:id', updateUser)
userRouter.delete('/:id', deleteUser)

export default userRouter


// Controller functions
//-----------------------------------------------------------------------------------

async function authenticate(req: Request, res: Response, next: NextFunction) {
    try {
        const { password, email } = req.body

        const authResult = await userService.authenticateUser( email, password )
        const { authorizedUser, authToken } = authResult
        
        if ( authorizedUser.password) {
            authorizedUser.password = undefined
        }

        setCookieAuthenticatedToken( res, authToken, 7 )

        res.status(200).json( authorizedUser )
    }
    catch (error: any) {
        Logger.error(`Erro durante autenticação do usuário: ${ error.message }`)
        return next( error )
    }
}

async function insertNewUser(req: Request, res: Response, next: NextFunction) {
    try {
        const userData = req.body

        const newUser: IUser = await userService.create( userData )

        return res.status(201).json( newUser )
    }
    catch (error: any) {
        Logger.error(`Erro ao registrar novo usuário: ${ error.message }`)
        return next( error )
    }
}

async function listAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
        const usersList: IUser[] = await userService.getAll()

        return res.status(200).json( usersList )
    }
    catch (e: any) {
        Logger.error( `Erro durante consulta de usuários: ${ e.message }` )
        return next( e )
    }

}

async function getById(req: Request, res: Response, next: NextFunction) {
    try {
        let user: IUser = await userService.getById( req.params.id )

         return res.status(200).json( user )
    }
    catch (e: any) {
        Logger.error( `Erro ao pesquisar usuário: ${ e.message }` )
        return next( e )    
    }
}

async function updateUser(req: Request, res: Response, next: NextFunction) {
    try {
        const changedUser = await userService.update( req.params.id, req.body )

        return res.status(200).json( changedUser )
    }
    catch (e: any) {
        Logger.error( `Erro ao atualizar usuário: ${ e.message }` )
        return next( e )
    }
}

async function deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
        await userService._delete( req.params.id )
        
        return res.status(200).json( {message: "User successfully deleted"} )
    }
    catch (e: any) {
        Logger.error( `Erro ao excluir usuário: ${ e.message }` )
        return next(e)
    }
}


// Helper functions
//-----------------------------------------------------------------------------------

function setCookieAuthenticatedToken(res: Response, token: string, cookieDurationInDays: number): void {
    const cookieOptions: CookieOptions = {
        httpOnly: true,
        expires: new Date( Date.now() + (cookieDurationInDays * ( 24 * 60 * 60 * 1000 )) )
    }

    res.cookie('refreshToken', token, cookieOptions)
}