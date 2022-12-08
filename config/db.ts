import mongoose from "mongoose"
import config from "config"
import Logger from "./logger"

async function connect() {

    const databaseName = process.env.DB_NAME
    const connectionString = config.get<string>( "connectionString" )

    try {

        await mongoose.connect( connectionString )
        Logger.info(`Successfully connected to database "${ databaseName }"`)
        
    } catch (e) {
        Logger.info("Error while connecting to database")
        Logger.error(`Error while connecting to database >> ${e}`)
        process.exit(1)
    }

}

export default connect