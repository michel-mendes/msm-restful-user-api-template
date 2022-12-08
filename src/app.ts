// Load ENV variables
process.env.NODE_ENV = process.argv[2] || 'development'
require("dotenv").config()

// Module imports
import express from "express"
import cookieParser from "cookie-parser"
import config from "config"
import db from "../config/db"
import Logger from "../config/logger"
import morganMiddleware from "./middleware/morgan-handler"
import apiRouter from './api.router'
import { handle404Error, handleCustomErrors } from "./middleware/error-handler"

const app = express()
const port = config.get<number>( 'port' )

// Middlewares
app.use( express.json() )
app.use( cookieParser() )
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