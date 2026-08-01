const client = require("../config/redis");
const { sendMail } = require("./email.service");
const crypto = require("crypto");
const BadReq = require("../errors/BadRequestError");
const bcrypt = require("bcrypt");
const UnAuth=require("../errors/UnAuth")

const sendOtp = async (req, to) => {
    const now = Date.now();

    const ip = req.ip;
    const ipKey = `otp_ip:${ip}`;

    await client.zRemRangeByScore(ipKey, 0, now - 300000);

    const ipCount = await client.zCard(ipKey);

    if (ipCount >= 20) {
        throw new BadReq("Too many requests from this IP.");
    }

    await client.zAdd(ipKey, [
        {
            score: now,
            value: `${now}-${crypto.randomUUID()}`
        }
    ]);

    await client.expire(ipKey, 300);



    const emailKey = `otp_requests:${to}`;

    await client.zRemRangeByScore(emailKey, 0, now - 300000);

    const emailCount = await client.zCard(emailKey);

    if (emailCount >= 3) {
        throw new BadReq("Too many OTP requests.");
    }

    await client.zAdd(emailKey, [
        {
            score: now,
            value: `${now}-${crypto.randomUUID()}`
        }
    ]);

    await client.expire(emailKey, 300);

    

    const otp = crypto.randomInt(100000, 999999).toString();

    const hashed = await bcrypt.hash(otp, 12);


    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: "Your OTP Code",
        text: `Your One-Time Password is: ${otp}`
    };

    try {
        await sendMail(to, mailOptions.subject, mailOptions.text);
        req.session.userEmail = to;
        req.session.userOTP = hashed;
        req.session.otpAttempts = 0;
        await req.session.save();
    } catch (err) {
        throw new BadReq("Failed to send OTP.");
    }
};

const resendOtp = async (req, to) => {
    if (!req || !req.session || req.session.userEmail !== to) {
        throw new BadReq("No active OTP request found for this email. Please request an OTP first.");
    }

    const now = Date.now();
    const resendKey = `otp_resend:${to}`;
    await client.zRemRangeByScore(resendKey, 0, now - 300000);

    const resendCount = await client.zCard(resendKey);
    if (resendCount >= 3) {
        throw new BadReq("Too many OTP resend requests. Please wait a few minutes.");
    }

    await client.zAdd(resendKey, [
        {
            score: now,
            value: `${now}-${crypto.randomUUID()}`
        }
    ]);
    await client.expire(resendKey, 300);

    const otp = crypto.randomInt(100000, 999999).toString();
    const hashed = await bcrypt.hash(otp, 12);

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject: "Your New OTP Code",
        text: `Your new One-Time Password is: ${otp}`
    };

    try {
        await sendMail(to, mailOptions.subject, mailOptions.text);
        req.session.userEmail = to;
        req.session.userOTP = hashed;
        req.session.otpAttempts = 0;
        await req.session.save();
    } catch (err) {
        throw new BadReq("Failed to resend OTP.");
    }
};

const checkOtp = async (req, email, otp) => {
    if (!req || !req.session) {
        throw new BadReq("Session not available.");
    }

    const now = Date.now();
    const verifyIpKey = `otp_verify_ip:${req.ip}`;

    await client.zRemRangeByScore(verifyIpKey, 0, now - 300000);
    const verifyCount = await client.zCard(verifyIpKey);

    if (verifyCount >= 10) {
        throw new BadReq("Too many verification attempts from this IP. Please try again later.");
    }

    await client.zAdd(verifyIpKey, [
        {
            score: now,
            value: `${now}-${crypto.randomUUID()}`
        }
    ]);
    await client.expire(verifyIpKey, 300);

    const storedemail = req.session.userEmail;
    const storedHash = req.session.userOTP;

    if (email !== storedemail) {
        throw new UnAuth("User is unauthorized!");
    }

    if (!storedHash) {
        throw new BadReq("OTP expired.");
    }

    if (!otp) {
        throw new BadReq("OTP is required.");
    }

    const isValid = await bcrypt.compare(
        otp,
        storedHash
    );

    if (!isValid) {
        req.session.otpAttempts = (req.session.otpAttempts || 0) + 1;
        if (req.session.otpAttempts >= 5) {
            delete req.session.userEmail;
            delete req.session.userOTP;
            delete req.session.otpAttempts;
            await req.session.save();
            throw new BadReq("Too many failed attempts. OTP has been invalidated. Please request a new OTP.");
        }
        await req.session.save();
        throw new BadReq(`Invalid OTP. ${5 - req.session.otpAttempts} attempt(s) remaining.`);
    }

    delete req.session.userEmail;
    delete req.session.userOTP;
    delete req.session.otpAttempts;
    
    await req.session.save();
    return true;
};

module.exports = {
    sendOtp,
    resendOtp,
    checkOtp
};