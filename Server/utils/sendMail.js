import { createTransport } from "nodemailer"


export const sendMail = async (to, subject, text) => {
    const transporter = createTransport({
        service: process.env.SMTP_HOST,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    })


    await transporter.sendMail({
        to,
        subject,
        text,
        from: "ubaish@gmail.com"
    })

}

