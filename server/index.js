const express = require("express");
const Multer = require("multer");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const { v4: uuid } = require("uuid");
const { Storage } = require("@google-cloud/storage");

require("dotenv").config();

const app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(passport.initialize());
// app.use(passport.session());
// app.use(cors());

// passport.use(
// 	new GoogleStrategy(
// 		{
// 			clientID: GOOGLE_CLIENT_ID,
// 			clientSecret: GOOGLE_CLIENT_SECRET,
// 			callbackURL: "/auth/google/callback",
// 		},
// 		(accessToken, refreshToken, profile, done) => {
// 			return done(null, profile);
// 		}
// 	)
// );

// passport.serializeUser((user, done) => {
// 	done(null, user);
// });

// passport.deserializeUser((user, done) => {
// 	done(null, user);
// });

// app.get(
// 	"/auth/google",
// 	passport.authenticate("google", {
// 		scope: ["https://www.googleapis.com/auth/plus.login"],
// 	})
// );

// app.get(
// 	"/auth/google/callback",
// 	passport.authenticate("google", { failureRedirect: "/" }),
// 	(req, res) => {
// 		res.render("index");
// 	}
// );

const multer = Multer({
	storage: Multer.memoryStorage(),
	limits: {
		fileSize: 5 * 1024 * 1024, // No larger than 5mb, change as you need
	},
});

let projectId = "imageinary-405821";
let keyFilename = "mykey.json";

const storage = new Storage({
	projectId,
	keyFilename,
});

const bucket = storage.bucket("imageinaryimages");

app.set("view engine", "ejs");

app.post("/convert", multer.single("image"), async (req, res) => {
	let originalFilename = path.parse(req.file.originalname).name;
	let webpFilename = uuid() + "_" + originalFilename + ".webp";
	let outputPath = path.join(__dirname, "public", webpFilename);
	let fileBuffer = req.file.buffer;

	sharp(fileBuffer)
		.resize(300)
		.toFormat("webp", { quality: 80 })
		.toFile(outputPath, async (err, info) => {
			if (err) {
				console.error(err);
				return res.status(500).send("Error converting image");
			}

			try {
				console.log("file found, startig transfer");
				const blob = bucket.file(webpFilename);
				const blobStream = blob.createWriteStream();

				blobStream.on("error", (err) => {
					console.error(err);
					res.status(500).send("Error during upload");
				});

				blobStream.on("finish", () => {
					// Success handling, maybe return the URL of the uploaded file
					console.log("Upload to Google Cloud Storage complete");

					// Delete the local file
					fs.unlink(outputPath, (err) => {
						if (err) {
							console.error("Error deleting file:", err);
						} else {
							console.log("Successfully deleted local file");
						}
					});
				});

				fs.createReadStream(outputPath).pipe(blobStream);
				console.log("transfer complete");
			} catch (error) {
				console.error(error);
				res.status(500).send("Error processing upload");
			}
		});
});

app.post("/upload", multer.single("image"), async (req, res) => {
	let originalFilename = path.parse(req.file.originalname).name;
	let webpFilename = uuid() + "_" + originalFilename + ".webp";
	let outputPath = path.join(__dirname, "public", webpFilename);
	let fileBuffer = req.file.buffer;

	sharp(fileBuffer)
		.resize(300)
		.toFile(outputPath, async (err, info) => {
			if (err) {
				console.error(err);
				return res.status(500).send("Error converting image");
			}
			try {
				console.log("file found, startig transfer");
				const blob = bucket.file(webpFilename);
				const blobStream = blob.createWriteStream();

				blobStream.on("error", (err) => {
					console.error(err);
					res.status(500).send("Error during upload");
				});

				blobStream.on("finish", () => {
					// Success handling, maybe return the URL of the uploaded file
					console.log("Upload to Google Cloud Storage complete");

					// Delete the local file
					fs.unlink(outputPath, (err) => {
						if (err) {
							console.error("Error deleting file:", err);
						} else {
							console.log("Successfully deleted local file");
						}
					});
				});

				fs.createReadStream(outputPath).pipe(blobStream);
				console.log("transfer complete");
			} catch (error) {
				console.error(error);
				res.status(500).send("Error processing upload");
			}
		});
});

app.get("/fetch", async (req, res) => {
	let [files] = await bucket.getFiles();
	let fileUrls = files.map((file) => file.publicUrl());
	res.json(fileUrls);
});

app.get("/", (req, res) => {
	res.render("index");
});

app.get("/gallery", (req, res) => {
	res.render("gallery");
});

app.listen(1313, () => {
	console.log("Server started!");
});
