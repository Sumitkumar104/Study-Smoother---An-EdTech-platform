// after click on reset password button their is an api click which come back on given page .
// On frontend user enter the email with which he did signup.
// This email is pass in request of POST API call Which we receive here(Backend) .
// Now we generate a token for this email and send a link(with token ) of another forntend so that it reset your password .
// 


const User = require("../models/User")
const mailSender = require("../utils/mailSender")
const bcrypt = require("bcrypt")
const crypto = require("crypto")


// it Generate the password-
exports.resetPasswordToken = async (req, res) => {
    try {

        // fetch the email from the Request
        const email = req.body.email
        const user = await User.findOne({ email: email })
        if (!user) {
            return res.json({
                success: false,
                message: `This Email: ${email} is not Registered With Us Enter a Valid Email `,
            })
        }

        // generate a randmm token .
        const token = crypto.randomBytes(20).toString("hex")
        // Update the user corresponds to mail
        const updatedDetails = await User.findOneAndUpdate(
            { email: email },
            {
                token: token,
                resetPasswordExpires: Date.now() + 3600000,

            },
            { new: true }
        )
        console.log("DETAILS", updatedDetails)

        // const url = `http://localhost:3000/update-password/${token}`
        const url = `https://studynotion-edtech-project.vercel.app/update-password/${token}`


        // send the mail in which we pass the URL to reset the password.
        await mailSender(
            email,
            "Password Reset",
            `Your Link for email verification is ${url}. Please click this url to reset your password.`
        )

        res.json({
            success: true,
            message:
                "Email Sent Successfully, Please Check Your Email to Continue Further",
        })
    } catch (error) {
        return res.json({
            error: error.message,
            success: false,
            message: `Some Error in Sending the Reset Message`,
        })
    }
}


// Update the password in database, this function will call on Reset Frontend page
exports.resetPassword = async (req, res) => {
    try {
        const { password, confirmPassword, token } = req.body

        if (confirmPassword !== password) {
            return res.json({
                success: false,
                message: "Password and Confirm Password Does not Match",
            })
        }
        const userDetails = await User.findOne({ token: token })
        if (!userDetails) {
            return res.json({
                success: false,
                message: "Token is Invalid",
            })
        }
        if (!(userDetails.resetPasswordExpires > Date.now())) {
            return res.status(403).json({
                success: false,
                message: `Token is Expired, Please Regenerate Your Token`,
            })
        }
        const encryptedPassword = await bcrypt.hash(password, 10)
        await User.findOneAndUpdate(
            { token: token },
            { password: encryptedPassword },
            { new: true }
        )
        res.json({
            success: true,
            message: `Password Reset Successful`,
        })
    } catch (error) {
        return res.json({
            error: error.message,
            success: false,
            message: `Some Error in Updating the Password`,
        })
    }
}

