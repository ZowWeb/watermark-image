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
    const imgLogo = "assets/images/logo-color.png";

    // work with backup image
    const imgActive = "assets/images/active/active.jpg";

    // Previews
    const previewThumb = `assets/images/export/preview-thumb__${req.file.filename}`;
    const preview = `assets/images/export/preview__${req.file.filename}`;
    const previewBig = `assets/images/export/preview-big__${req.file.filename}`;

    const main = async () => {
      const [image, logo] = await Promise.all([
        Jimp.read(imgRaw),
        Jimp.read(imgLogo)
      ]);

      const resizedLogo = logo.resize(image.bitmap.width / 5, Jimp.AUTO);

      const cornerWidth = image.bitmap.width - logo.bitmap.width;
      const cornerHeight = image.bitmap.height - logo.bitmap.height;

      const logoPos = [
        // Top left
        { X: 10, Y: 10 },
        // Top right
        {
          X: cornerWidth - 10,
          Y: 10
        },
        // Center
        {
          X: cornerWidth / 2,
          Y: cornerHeight / 2
        },
        // Bottom left
        {
          X: 10,
          Y: cornerHeight - 10
        },
        // Bottom right
        {
          X: cornerWidth - 10,
          Y: cornerHeight - 10
        }
      ];

      // TEXT data
      const textData = {
        text: "© Zohaib Khan", //the text to be rendered on the image
        maxWidth: image.bitmap.width, // max width wrt image
        maxHeight: 0, // max height wrt image
        placementX: 0, //  X axis
        placementY: image.bitmap.height - 40 // Y axis wrt image
      };

      // READ template & clone raw image
      Jimp.read(imgRaw)
        .then(tpl => tpl.clone().write(imgActive))

        // READ cloned (active) image
        .then(() => Jimp.read(imgActive))

        // COMPOSITE logo into image
        .then(tpl => {
          for (let i = 0; i < logoPos.length; i++) {
            Jimp.read(resizedLogo).then(logoTpl => {

              tpl.composite(logoTpl, logoPos[i].X, logoPos[i].Y, {
                mode: Jimp.BLEND_SOURCE_OVER,
                opacitySource: 0.2,
                opacityDest: 0.9
              });
            });
          }
          return tpl;
        })

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
              alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER
            },
            textData.maxWidth
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
        });
    };

    // SEND JSON as response
    main()
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
