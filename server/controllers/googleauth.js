const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth").OAuth2Strategy;
const express = require("express");
const googleAuth = require("../model/googlemodel");
const router = express.Router();
require("dotenv").config();

let userProfile;
passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_KEY,
			clientSecret: process.env.GOOGLE_SECRET,
			callbackURL: process.env.GOOGLE_CALLBACK,
		},
		function (accessToken, refreshToken, profile, done) {
			userProfile = profile;
			return done(null, userProfile);
		}
	)
);

router.get(
	"/",
	passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
	"/callback",
	passport.authenticate("google", { failureRedirect: "/auth/google/error" }),
	(req, res) => {
		res.redirect("/auth/google/success");
	}
);

router.get("/success", async (req, res) => {
	const { failure, success } = await googleAuth.registerWithGoogle(
		userProfile
	);
	if (failure) console.log("Google user already exist in DB..");
	else console.log("Registering new Google user..");
	res.render("success", { user: userProfile });
});

router.get("/error", (req, res) => res.send("Error logging in via Google.."));

router.get("/signout", (req, res) => {
	try {
		req.session.destroy(function (err) {
			console.log("session destroyed.");
		});
		res.render("auth");
	} catch (err) {
		res.status(400).send({ message: "Failed to sign out user" });
	}
});

module.exports = router;
