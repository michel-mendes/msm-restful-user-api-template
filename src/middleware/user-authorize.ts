import { NextFunction, Response } from "express"
import { expressjwt, Request } from "express-jwt"
import config from "config"
import { IUser, User } from "../models/users/user"
import { IRefreshToken, RefreshToken } from "../models/refresh_token/refresh-token"

const secret: string = config.get<string>('secret')

export {
    userAuthorize
}

function userAuthorize( role: string | null = null ) {

    return [

        expressjwt( {secret: secret, algorithms: ["HS256"]} ),

        async (req: Request, res: Response, next: NextFunction) => {
            
            const userRequested: IUser | null = await User.findById( req.auth?.userId )
            const userRefreshToken: IRefreshToken[] = await RefreshToken.find( {user: userRequested?.id} )

            const userNotFound: boolean = !userRequested
            const userUnauthorized: boolean = ( role !== null ) && ( role !== userRequested?.role )

            if ( userNotFound || userUnauthorized ) {
                return res.status(401).json({message: "Unauthorized access"})
            }

            next()

        }

    ]

}