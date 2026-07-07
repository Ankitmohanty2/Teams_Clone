const {v4: uuidv4} = require('uuid');
const nodemailer = require("nodemailer");
const User = require("../models/User");
require("dotenv").config();

exports.home = async (req,res) => {
    let userData = null;
    if (req.session && req.session.user) {
        try {
            userData = await User.findById(req.session.user.id).lean();
        } catch(e) { console.error(e) }
    }
    res.render("home", { user: userData || (req.session ? req.session.user : null) });
}

exports.newMeeting = async (req,res) => {
    const meetingCode = uuidv4();
    if (req.session && req.session.user) {
        try {
            await User.findByIdAndUpdate(req.session.user.id, {
                $push: { meetingHistory: { meetingCode, role: 'Host' } }
            });
        } catch(e) { console.error(e) }
    }
    res.redirect(`/meet?meetingCode=${meetingCode}&username=${req.body.username}`);
}

exports.joinMeeting = async (req,res) => {
    if (req.session && req.session.user) {
        try {
            await User.findByIdAndUpdate(req.session.user.id, {
                $push: { meetingHistory: { meetingCode: req.body.meetingCode, role: 'Participant' } }
            });
        } catch(e) { console.error(e) }
    }
    res.redirect(`/meet?meetingCode=${req.body.meetingCode}&username=${req.body.username}`);
}

exports.joinMeetingRoom =(req,res)=>{
    res.render("meeting",{meetingCode: req.params.meetingCode});
}

exports.inviteParticipant = (req,res) => {
    const receiver = req.body.email;
    const receiversName = receiver.split("@")[0];
    const url = process.env.SERVER_URL+"meet?meetingCode"+req.body.meetingCode+"&username="+receiversName;

    const emailContent = 
    `<p>Hi ${receiversName}</p>
    <p>${req.body.sender} has invited you to a meeting.</p>
    <hr>
    <h2>Microsoft Teams Meeting</h2>
    <p><b>Join on your computer</b><p>
    <a href="${url}">Click here to join the meeting</a>`;

    let transporter = nodemailer.createTransport({
        service: "Gmail",
        host: "smtp.gmail.com",
        port: 465,
        auth: {
            user: process.env.EMAIL, 
            pass: process.env.PASSWORD ,
        },
    });

    transporter.sendMail({
        from: process.env.EMAIL,
        to: receiver,
        subject: "Invitation: Microsoft Teams Meeting",
        html: emailContent,
    });

    res.redirect("/");
}