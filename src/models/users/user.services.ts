import { AppError } from "../../middleware/error-handler";
import { IUser, User } from "./user";
import { hash, compare } from "bcryptjs";
import config from "config"
import jwt from "jsonwebtoken"
import crypto from "crypto"
import Roles from "../../types/user-roles";

export const userService = {
    authenticateUser,
    create,
    getAll,
    getById,
    getByEmail,
    update,
    _delete
}

async function authenticateUser(requestEmail: string, requestPassword: string): Promise<any> {
    const user: IUser | null = await User.findOne( {email: requestEmail} ).select('+password')

    const userNotFound = user == null
    const incorrectPassword = user ? (await compare( requestPassword, user.password! )) == false : true

    if ( userNotFound || incorrectPassword ) {
        throw new AppError("Usuário ou senha inválidos", 400)
    }
    
    // Successful user authentication
    const authToken = jwt.sign({ sub: user.id }, config.get<string>('secret'), { expiresIn: '7d' })
      
    return {
        authorizedUser: user,
        authToken: authToken
    }
}

async function create( userData: IUser ): Promise<IUser> {
    const isFirstUser: boolean = ( await User.countDocuments({}) ) === 0
    const userAlreadyExisits: boolean = await emailAlreadyRegistered( userData.email )

    if ( userAlreadyExisits ) {
        throw new AppError( "Endereço de email já cadastrado", 400 )
    }

    userData.role = isFirstUser ? Roles.admin : Roles.user
    userData.password = await hashUserPassword( userData.password )
    userData.verificationToken = generateRandomTokenString()

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