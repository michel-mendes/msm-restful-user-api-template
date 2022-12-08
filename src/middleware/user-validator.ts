import { body } from "express-validator"

export {
    userCreateValidation,
    userAuthenticationValidation
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