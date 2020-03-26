const express = require("express");
const router = express.Router();

// Image dependencies

const multer = require("multer");
const Jimp = require("jimp");

// Upload strategy

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "assets/images/raw/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
  onError: (err, next) => {
    console.log("Multer error", err);
    next(err);
  }
});

const fileFilter = (req, file, cb) => {
  // REJECT file
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 1
  },
  fileFilter
}).single("rawimg");

// @route POST api/upload
// @desc Update image
// @access Public

router.post("/", (req, res) => {
  upload(req, res, err => {
    // Send error as response
    if (err) {
      return res.json({ status: false, message: err.message });
    }
    // Success : Keep going
    const imgRaw = req.file.path;

    // Watermark strategy

    // Logo to be put on the image
    const imgLogo = "assets/images/watermark.png";

    // work with backup image
    const imgActive = "assets/images/active/active.jpg";

    // Previews
    const previewThumb = "assets/images/export/preview-thumb.jpg";
    const preview = "assets/images/export/preview.jpg";
    const previewBig = "assets/images/export/preview-big.jpg";
    const textData = {
      text: "© Zohaib Khan", //the text to be rendered on the image
      maxWidth: 300, //image width - 10px margin left - 10px margin right
      maxHeight: 200 + 20, //logo height + margin
      placementX: 10, // 5px in on the x axis
      placementY: 1024 - (72 + 20) - 10 //bottom of the image: height - maxHeight - margin
    };

    // READ template & clone raw image
    Jimp.read(imgRaw)
      .then(tpl => tpl.clone().write(imgActive))

      // READ cloned (active) image
      .then(() => Jimp.read(imgActive))

      // COMPOSITE logo into image
      .then(tpl =>
        Jimp.read(imgLogo).then(logoTpl => {
          logoTpl.opacity(0.2);
          return tpl.composite(logoTpl, 512 - 75, 350 - 40, [
            Jimp.BLEND_DESTINATION_OVER,
            0.2,
            0.2
          ]);
        })
      )

      // LOAD font
      .then(tpl =>
        Jimp.loadFont(Jimp.FONT_SANS_32_WHITE).then(font => [tpl, font])
      )

      // WATERMARK text
      .then(data => {
        tpl = data[0];
        font = data[1];

        return tpl.print(
          font,
          textData.placementX,
          textData.placementY,
          {
            text: textData.text,
            alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
            alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
          },
          textData.maxWidth,
          textData.maxHeight
        );
      })

      //EXPORT images
      .then(tpl => {
        // Preview Big
        tpl
          .resize(Jimp.AUTO, 850)
          .quality(90)
          .write(previewBig);
        // Preview
        tpl
          .resize(Jimp.AUTO, 500)
          .quality(80)
          .write(preview);
        // Preview Thumbnail
        tpl
          .resize(Jimp.AUTO, 350)
          .quality(70)
          .write(previewThumb);
      })

      // SEND JSON as response
      .then(tpl =>
        res.json({
          status: true,
          raw: imgRaw,
          logo: imgLogo,
          preview: preview,
          previewThumb: previewThumb,
          previewBig: previewBig,
          message: "File uploaded successfully"
        })
      )

      // CATCH errors
      .catch(err => {
        console.error(err);
      });
  });
});

module.exports = router;
