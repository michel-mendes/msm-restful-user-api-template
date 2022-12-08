import { inspect } from "util"
import { Request, Response, NextFunction } from "express"

export {
    AppError,
    handle404Error,
    handleCustomErrors
}

class AppError {
    public readonly code: number;
    public readonly message: string;

    constructor( errorMessage: string, httpStatusCode: number = 500 ) {
        this.code = httpStatusCode
        this.message = errorMessage
    }
}

function handle404Error(req: Request, res: Response, next: NextFunction) {
    return res.status(404).json({message: `Endpoint '${ req.path }' não encontrado`}) 
}

function handleCustomErrors(err: any, req: Request, res: Response, next: NextFunction) {

    // console.log("entrei no handle error")
    // console.log(inspect(err, false, null, true))
    if ( err instanceof AppError ) {
        return res.status( err.code ).json({message: err.message}) 
    }

    switch (true) {
        case err.name === 'ValidationError': { sendMongooseValidationError(err, req, res, next) }; break
        case err.name === 'UnauthorizedError': { sendUnauthorizedError(err, req, res, next) }; break
        default: { sendServerSideError(err, req, res, next) }
    }

}

function sendMongooseValidationError(err: any, req: Request, res: Response, next: NextFunction) {
    // Mongoose validation error
    return res.status(400).json({message: String(err.message).replaceAll('"', '\'')})
}

function sendUnauthorizedError(err: any, req: Request, res: Response, next: NextFunction) {
    // JWT authentication error
    return res.status(401).json({message: 'Acesso não autorizado'})
}

function sendServerSideError(err: any, req: Request, res: Response, next: NextFunction) {
    return res.status(500).json({message: String(err.message).replaceAll('"', '\'')})
}