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
        .withMessage('User first name is required'),

        body('email')
        .isString()
        .withMessage('User email address is required'),

        body('password')
        .isString()
        .withMessage('User password is required')
        .isLength({ min: 6 })
        .withMessage('Password must have at least 6 digits'),
    ]

}

const userAuthenticationValidation = () => {

    return[
        body('email')
        .isString()
        .withMessage('Email address is required'),

        body('password')
        .isString()
        .withMessage('User password is required')
        .isLength({ min: 6 })
        .withMessage('Password must have at least 6 digits'),        
    ]

}

const userAccountVerificationValidator = () => {
    
    // console.log(check.arguments)
    return [
        check('token')
        .exists({checkFalsy: true})
        .withMessage("Missing '?token=[token_code]' in query string")
    ]

}

const userForgotPasswordValidator = () => {

    return [
        body('email')
        .isEmail()
        .withMessage('Email address is required')
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