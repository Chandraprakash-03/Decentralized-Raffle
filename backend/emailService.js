const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");

async function setupTransporter() {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
}

// Function to load and compile Handlebars template
function loadTemplate(templateName, context) {
    const templatePath = path.join(__dirname, "templates", `${templateName}.hbs`);

    try {
        const templateSource = fs.readFileSync(templatePath, "utf8");
        const compiledTemplate = handlebars.compile(templateSource);
        return compiledTemplate(context);
    } catch (error) {
        console.error(`Error loading template ${templateName}:`, error);
        return "";
    }
}

// Function to send an email
async function sendEmail(to, subject, templateName, context) {
    try {
        const transporter = await setupTransporter();
        const htmlContent = loadTemplate(templateName, context);

        await transporter.sendMail({
            from: `"CipherDraw No-Reply" <${process.env.EMAIL_USER}>`,
            replyTo: process.env.EMAIL_USER,
            to,
            subject,
            html: htmlContent
        });

        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error("Email error:", error);
    }
}

module.exports = { sendEmail };
