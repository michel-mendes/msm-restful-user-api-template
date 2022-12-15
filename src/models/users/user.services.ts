import { AppError } from "../../middleware/error-handler";
import { IUser, User } from "./user";
import { IRefreshToken, RefreshToken } from "../refresh_token/refresh-token";
import { hash, compare } from "bcryptjs";
import { sendEmail } from "../../helpers/mailer";
import config from "config"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import Roles from "../../types/user-roles";

export const userService = {
    authenticateUser,
    verifyEmail,
    create,
    getAll,
    getById,
    getByEmail,
    update,
    _delete
}

async function authenticateUser(requestEmail: string, requestPassword: string, ipAddress: string): Promise<any> {
    const user: IUser | null = await User.findOne( {email: requestEmail} )

    const userNotFound = user == null
    const incorrectPassword = user ? (await compare( requestPassword, user.password! )) == false : true

    if ( userNotFound || incorrectPassword ) {
        throw new AppError("Usuário ou senha inválidos", 400)
    }
    
    // Successful user authentication
    const signedObjectData = {
        userId: user.id,
        userName: user.firstName,
        userRole: user.role
    }

    const authToken = jwt.sign( signedObjectData, config.get<string>('secret'), { expiresIn: '7d' } )
    const refreshToken = await createNewRefreshToken( user, ipAddress )
      
    return {...user?.toJSON(), authToken: authToken, refreshToken: refreshToken }
}

async function verifyEmail( token: string ) {
    const user: IUser | null = await User.findOne( {verificationToken: token} )

    if ( !user ) throw new AppError( "Token inválido!", 404 )

    user.verifiedAt = new Date()
    user.verificationToken = undefined

    await user.save()
}

async function create( userData: IUser, host: string | undefined = undefined): Promise<IUser> {
    const isFirstUser: boolean = ( await User.countDocuments({}) ) === 0
    const userAlreadyExisits: boolean = await emailAlreadyRegistered( userData.email )

    if ( userAlreadyExisits ) {
        throw new AppError( "Endereço de email já cadastrado", 400 )
    }

    userData.role = isFirstUser ? Roles.admin : Roles.user
    userData.password = await hashUserPassword( userData.password )
    userData.verificationToken = generateRandomTokenString()

    await sendUserVerificationEmail( userData, host )
    
    const newUser: IUser = await User.create( userData )

    return newUser
}

async function getAll(): Promise< IUser[] > {
    const usersList: IUser[] = await User.find()

    return usersList
}

async function getById( id : string ): Promise< IUser > {
    const user: IUser | null = await User.findById( id )

    if ( !user ) {
        throw new AppError( "Usuário não encontrado", 404 )
    }

    return <IUser>user
}

async function getByEmail( email: string ): Promise< Array<IUser> > {
    const user = await User.find(
        {
            email: email
        }
    )

    return user
}

async function update( userId: string, newUserData: IUser ): Promise<IUser> {
    const userToEdit = await User.findById( userId )

    if ( !userToEdit ) throw new AppError("Usuário não encontrado", 404)

    delete newUserData.role

    if ( await emailAlreadyRegistered( newUserData.email ) ) throw new AppError("Email alreay registered", 400)

    Object.assign<IUser, IUser>( <IUser>userToEdit, newUserData )
    await userToEdit.save({timestamps: true})

    return <IUser>userToEdit
}

async function _delete( userId: string ): Promise<void> {
    const user = await User.findById( userId )

    if ( !user ) throw new AppError("User not found", 404)

    await user?.remove()
    return
}

// Helper functions
async function emailAlreadyRegistered( email: string ): Promise<boolean> {
    if ( !email ) return false

    const user: IUser[] = await getByEmail( email )

    return user.length > 0
}

async function hashUserPassword( password: string ): Promise<string> {
    return await hash( password, 10 )
}

function generateRandomTokenString(): string {
    return crypto.randomBytes( 40 ).toString('hex')
}

async function createNewRefreshToken( user: IUser, ipAddress: string ): Promise<IRefreshToken> {
    const tokenData = {
        user: user._id,
        token: generateRandomTokenString(),
        expiresAt: new Date( Date.now() + 7 * (24*60*60*1000) ),
        createdByIp: ipAddress
    }

    const newRefreshToken: IRefreshToken = await RefreshToken.create( tokenData )

    return newRefreshToken
}

async function sendUserVerificationEmail( user: IUser, hostAddress: string | undefined = undefined ) {
    let bodyMessage: string;

    if ( hostAddress ) {
        const verifyUrl = `http://${ hostAddress }/api/user/verify-account?token=${ user.verificationToken }`
        const lastName = user.lastName ? ` ${user.lastName}` :  ``

        bodyMessage = `<h2>Verificação de cadastro em nossa API</h2>
                       <p>Olá ${ user.firstName }${ lastName }, muito obrigado pela realização de seu cadastro em nosso app.</p>
                       <p>Agora falta apenas fazer a verificação de sua conta</p><br>
                       <p>Por favor, clique no link abaixo para prosseguir com a verificação de seu endereço de email:</p>
                       <code><a href="${ verifyUrl }">${ verifyUrl }</a></code>`
                       
    } else {
        bodyMessage = `<p>Por favor, acesse nosso website e acrescente o link abaixo para prosseguir com a verificação:</p>
                       <pre>Link.................: #NossoWebsite + /api/user/verify-account</pre>
                       <pre>Código de verificação: <code>${ user.verificationToken }</code></pre>`
    }

    await sendEmail(user.email, "Verificação de conta", bodyMessage)
}