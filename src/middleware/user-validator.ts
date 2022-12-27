import { body, check } from "express-validator"

export {
    userCreateValidation,
    userAuthenticationValidation,
    userAccountVerificationValidator,
    userForgotPasswordValidator,
    userResetPasswordValidator
}

const userCreateValidation = () => {
   
    return [
        body('firstName')
        .isString()
        .withMessage('O primeiro nome é obrigatório'),

        body('lastName')
        .isString()
        .withMessage('O último nome é obrigatório'),

        body('email')
        .isString()
        .withMessage('O email é obrigatório'),

        body('password')
        .isString()
        .withMessage('A senha é obrigatória')
        .isLength({ min: 6 })
        .withMessage('A senha deve conter no mínimo 6 caracteres'),
    ]

}

const userAuthenticationValidation = () => {

    return[
        body('email')
        .isString()
        .withMessage('Informe o email para fazer login'),

        body('password')
        .isString()
        .withMessage('A senha é obrigatória')
        .isLength({ min: 6 })
        .withMessage('A senha deve conter no mínimo 6 caracteres'),        
    ]

}

const userAccountVerificationValidator = () => {
    
    // console.log(check.arguments)
    return [
        check('token')
        .exists({checkFalsy: true})
        .withMessage("Informe o token de validação via query string '?token='")
    ]

}

const userForgotPasswordValidator = () => {

    return [
        body('email')
        .isEmail()
        .withMessage('Email is required to start the reset password process')
    ]

}

const userResetPasswordValidator = () => {
    
    return [
        body('token')
        .exists({checkFalsy: true})
        .withMessage("Reset password token required but not sent"),

        body('password')
        .isString()
        .withMessage('New password is required but not sent')
        .isLength({ min: 6 })
        .withMessage('The password must contain at least 6 characters'),
    ]

}