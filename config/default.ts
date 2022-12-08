const databaseName = process.env.DB_NAME
const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASS

export default {
    secret: "USED TO SIGN AND VERIFY JWT TOKENS, CHANGE THIS BY ANY STRING ON PRODUCTION ENVIRONMENT",
    port: 3000,
    connectionString: `mongodb+srv://${ dbUser }:${ dbPassword }@cluster0.a4rqihe.mongodb.net/${ databaseName }?retryWrites=true&w=majority`,
    env: process.env.NODE_ENV
    // env: 'production'
}