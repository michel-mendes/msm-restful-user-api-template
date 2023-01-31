// Load ENV variables
process.env.NODE_ENV = process.argv[2] || 'development'
require("dotenv").config()

// Module imports
import { handle404Error, handleCustomErrors } from "./middleware/error-handler"
import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import config from "config"
import db from "../config/db"
import Logger from "../config/logger"
import morganMiddleware from "./middleware/morgan-handler"
import apiRouter from './api.router'
import path from "path"

const app = express()
const port = config.get<number>( 'port' )

// Set EJS to the default HTML rendering engine
app.use( express.static( path.join( __dirname, '..', 'public' ) ) )
// console.log(path.join( __dirname, '..', 'public' ))
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs')

// Middlewares
app.use( express.json() )
app.use( cookieParser() )

// cors will allow requests from any origin, needed anywhere other than 'localhost'
app.use( cors(
    {
        origin: ( origin: any, callback: any ) => { callback(null, true) },
        credentials: true
    }
) )


app.use( morganMiddleware )

// App "API" Route controller
app.use('/api', apiRouter)

// Error handler
app.use( handleCustomErrors )
app.use( handle404Error )

// Start app
app.listen( port, async () => {

    // Connect to MongoDB Atlas
    await db()

    Logger.info(`Server successfully started and listening to port: ${port}`)

})