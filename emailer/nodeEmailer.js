const nodemailer = require('nodemailer');
const smtpPassword = require('aws-smtp-credentials');
// const sesTransport = require('nodemailer-ses-transport');

// const sesTransporter = nodemailer.createTransport(sesTransport({
// 	accessKeyId: process.env.SMTP_USERNAME,
// 	secretAccessKey: process.env.SMTP_PASSWORD,
// 	region: process.env.REGION
// }));

const smtpTransporter = nodemailer.createTransport({
  port: 465,
  host: 'email-smtp.us-east-1.amazonaws.com',
  secure: true,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: smtpPassword(process.env.SMTP_PASSWORD),
  },
  debug: true
});

function sendOTPMail(email, otp, cb){
	var mailOptions = {
		subject: 'Password Reset Clients.Patronish',
		from: 'admin@story.patronish.com',
		to: email,
		text: "maybe this ?",
		html: 
			`
			<p>
				You are receiving this email because a password reset for account on <a href="http://clients.patronish.com">Clients.Patronish</a> that is associated with this email was requested.
				</br>
				If you did not request this password reset, please ignore this email. To make account secure it is recommended to change password often and use a strong password.
			</p>
			<p>
				OTP is a one time password and is used to reset your account password. This is valid for <strong>1 Hour Only</strong>.
				</br>
				Please use OTP given below to reset the password:
			</p>
			<h3>${otp}</h3>
			`
	};
	sendMail(mailOptions, cb);
}

// Send e-mail using AWS SES
function sendMail(mailOptions, cb) {
	// sesTransporter.sendMail(mailOptions, cb);
	smtpTransporter.sendMail(mailOptions, cb);
}

module.exports.sendOTPMail = sendOTPMail;
module.exports.sendMail = sendMail;