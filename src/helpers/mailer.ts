import nodemailer, { TransportOptions } from "nodemailer"
import appConfigs from "../../config/default"

export { sendEmail }

async function sendEmail(
    to: string,
    subject: string,
    htmlContent: string,
    from: string = appConfigs.emailConfig.from!
): Promise<void> {
    
    const transporter = nodemailer.createTransport<Object>( <Object>appConfigs.emailConfig.smtpOptions )
    await transporter.sendMail(
        {
            from: from,
            to: to,
            subject: subject,
            html: htmlContent,
            encoding: 'utf-8'
        }
    )

    return
    
}