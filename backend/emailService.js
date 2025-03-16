const nodemailer = require("nodemailer");
const path = require("path");

async function loadHandlebars() {
    const { default: hbs } = await import("nodemailer-express-handlebars");
    return hbs;
}

async function setupTransporter() {
    const hbs = await loadHandlebars();

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    transporter.use("compile", hbs({
        viewEngine: {
            extName: ".hbs",
            partialsDir: path.join(__dirname, "templates"),
            defaultLayout: false,
        },
        viewPath: path.join(__dirname, "templates"),
        extName: ".hbs"
    }));

    return transporter;
}

async function sendEmail(to, subject, template, context) {
    try {
        const transporter = await setupTransporter();
        await transporter.sendMail({
            from: `"CipherDraw No-Reply" <cipherdraw@gmail.com>`,
            replyTo: "cipherdraw@gmail.com",
            to,
            subject,
            template,
            context
        });
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error("Email error:", error);
    }
}

module.exports = { sendEmail };
