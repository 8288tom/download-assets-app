const express = require("express");
const router = express.Router();
const listAssetsUs = require("../controllers/listAssetsUs")
const downloadAssetsUs = require("../controllers/downloadAssetsUs")
const listAssetsEu = require("../controllers/listAssetsEu")
const downloadAssetsEu = require("../controllers/downloadAssetsEu")

router.route("/us")
    .post(listAssetsUs.findAssetsOnFsUs)

router.route("/eu")
    .post(listAssetsEu.findAssetsOnFsEu)

router.route("/us/download")
    .post(downloadAssetsUs.downloadAssets)


router.route("/eu/download")
    .post(downloadAssetsEu.downloadAssets)




module.exports = router;