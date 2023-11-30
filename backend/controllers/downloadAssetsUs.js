const archiver = require('archiver');
const path = require('path');
const fs = require('fs');


module.exports.downloadAssets = async (req, res) => {
    const { id, assets, typeOfAsset, deeperPath } = req.body;
    // validations:
    if (isNaN(id)) {
        return res.status(400).send("Invalid ID");
    }
    if (id && String(id).length > 50) {
        return res.status(400).send('ID is too long.');
    }
    if (typeOfAsset !== "Scene Library" && typeOfAsset !== "IDM") {
        return res.status(400).send("Invalid Asset Type");
    }
    if (typeOfAsset && typeOfAsset.length > 100) {
        return res.status(400).send('Type of asset is too long.');
    }
    if (typeof deeperPath !== 'undefined') {
        if (deeperPath.length > 500) {
            return res.status(400).send('Deeper path is too long.');
        }
    }



    function sanitizePath(inputPath) {
        // Replace any sequence of special characters with a safe character.
        return inputPath.replace(/[^\w\-\/.]/g, '_');
    }

    const sanitizedDeeperPath = sanitizePath(deeperPath);
    const sanitizedAssets = assets.map(fileName => sanitizePath(fileName));

    const deeperAssetsPaths = sanitizedAssets.map(fileName => path.join(sanitizedDeeperPath, fileName));


    const isInside = (childPath, parentPath) => {
        const relative = path.relative(parentPath, childPath);
        return relative && !relative.startsWith('..') && !path.isAbsolute(relative);
    }

    let basePath = "";
    typeOfAsset === "Scene Library" ? basePath = `${process.env.US_ASSET_PATH}${id}/assets` : basePath = `${process.env.US_IDM_PATH}${id}`
    const assetsPaths = sanitizedAssets.map(fileName => path.join(basePath, fileName));
    for (const assetPath of assetsPaths) {
        if (!isInside(assetPath, basePath)) {
            return res.status(400).send("Invalid asset path");
        }
    }

    for (const deeperAssetPath of deeperAssetsPaths) {
        if (!isInside(deeperAssetPath, sanitizedDeeperPath)) {
            return res.status(400).send("Invalid deeper asset path");
        }
    }

    async function zipAndSendToBrowser() {
        try {
            const assetsPaths = assets.map(fileName => path.join(deeperPath, fileName));

            // Set headers to let the browser know it's a zip file.
            res.set('Content-Type', 'application/zip');
            res.set('Content-Disposition', `attachment; filename=${id}-Assets.zip`);

            // Create a ZIP stream and pipe it to the Express response object.
            const archive = archiver('zip', { zlib: { level: 9 } });
            archive.pipe(res);

            // Add each asset to the zip archive.
            for (const sourcePath of assetsPaths) {
                let stats;
                try {
                    stats = await fs.promises.stat(sourcePath);
                } catch (e) {
                    console.error(`Path does not exist: ${sourcePath}`);
                    continue;
                }

                if (stats.isDirectory()) {
                    const directoryName = path.basename(sourcePath);
                    archive.directory(sourcePath, directoryName);
                    console.log(`Added directory ${directoryName} to the ZIP archive`);
                } else if (stats.isFile()) {
                    archive.file(sourcePath, { name: path.basename(sourcePath) });
                    console.log(`Added ${path.basename(sourcePath)} to the ZIP archive`);
                }
            }

            // Finalize the archive.
            archive.finalize();

        } catch (e) {
            console.error(`Error processing files:`, e);
            res.status(500).send('Error while processing files.');
        }
    }

    await zipAndSendToBrowser();
}
