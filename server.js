
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// CREATE UPLOADS FOLDER
const uploadFolder = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadFolder)) {
    fs.mkdirSync(uploadFolder);
}

// CREATE NEWS DATABASE
const newsFile = path.join(__dirname, "news.json");

if (!fs.existsSync(newsFile)) {
    fs.writeFileSync(newsFile, "[]");
}

// IMAGE UPLOAD SETTINGS
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadFolder);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed."));
        }
    }
});

// GET ALL NEWS
app.get("/api/news", (req, res) => {
    try {
        const news = JSON.parse(
            fs.readFileSync(newsFile, "utf8")
        );

        res.json(news);

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Could not load news."
        });
    }
});

// PUBLISH NEWS
app.post("/api/news", upload.single("image"), (req, res) => {
    try {
        const { author, title, category, content } = req.body;

        if (!author || !title || !category || !content) {
            return res.status(400).json({
                message: "Please complete all required fields."
            });
        }

        const news = JSON.parse(
            fs.readFileSync(newsFile, "utf8")
        );

        const article = {
            id: Date.now(),
            author,
            title,
            category,
            content,
            image: req.file
                ? "/uploads/" + req.file.filename
                : null,
            date: new Date().toLocaleString()
        };

        news.unshift(article);

        fs.writeFileSync(
            newsFile,
            JSON.stringify(news, null, 2)
        );

        res.status(201).json({
            message: "News published successfully!",
            article
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Failed to publish news."
        });
    }
});

// DELETE NEWS
app.delete("/api/news/:id", (req, res) => {
    try {
        const news = JSON.parse(
            fs.readFileSync(newsFile, "utf8")
        );

        const article = news.find(
            item => item.id == req.params.id
        );

        if (!article) {
            return res.status(404).json({
                message: "News not found."
            });
        }

        const updatedNews = news.filter(
            item => item.id != req.params.id
        );

        fs.writeFileSync(
            newsFile,
            JSON.stringify(updatedNews, null, 2)
        );

        // DELETE UPLOADED IMAGE
        if (article.image) {
            const imageName = path.basename(article.image);
            const imagePath = path.join(
                uploadFolder,
                imageName
            );

            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        res.json({
            message: "News deleted successfully!"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Could not delete news."
        });
    }
});

// HANDLE UPLOAD ERRORS
app.use((err, req, res, next) => {
    res.status(400).json({
        message: err.message || "Upload error."
    });
});

// SERVE UPLOADED IMAGES
app.use("/uploads", express.static(uploadFolder));

// SERVE WEBSITE PAGES
app.use(express.static(__dirname));

// START SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Campus News running on port ${PORT}`);
});
