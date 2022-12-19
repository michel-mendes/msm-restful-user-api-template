import { NextFunction, Response } from "express"
import { expressjwt, Request } from "express-jwt"
import { IUser, User } from "../models/users/user"
import jwt from "jsonwebtoken"
import config from "config"

const secret: string = config.get<string>('secret')

export {
    userAuthorize
}

function userAuthorize( role: string | null = null ) {

    return [

        (req: Request, res: Response, next: NextFunction) => {
            const authorizationToken: string = req.get('authorization')?.split('Bearer ')[1]!
            
            jwt.verify( authorizationToken, secret, {algorithms: ["HS256"]} )

            next()
        },

        expressjwt( {secret: secret, algorithms: ["HS256"]} ),

        async (req: Request, res: Response, next: NextFunction) => {
            
            const userRequested: IUser | null = await User.findById( req.auth?.userId )

            const userNotFound: boolean = !userRequested
            const userUnauthorized: boolean = ( role !== null ) && ( role !== userRequested?.role )

            if ( userNotFound || userUnauthorized ) {
                return res.status(401).json({message: "Unauthorized access"})
            }

            next()

        }

    ]

}