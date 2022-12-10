import nodemailer from "nodemailer"
import config from "config"

const emailConfigs = config.get('emailConfig')

/*
async function sendEmail({
    to: string,
    subject: string,
    htmlContent: string,
    from = emailConfigs.from
})
*/