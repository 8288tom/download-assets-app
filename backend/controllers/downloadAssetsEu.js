const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');
const archiver = require('archiver');

const privateKeyPath = "Prod-Ireland-KP-2020.pem";
const remoteServer = process.env.EU_HOST;
const remoteUsername = "ubuntu";

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
    if (typeof deeperPath !== 'undefined') {
        if (deeperPath.length > 500) {
            return res.status(400).send('Deeper path is too long.');
        }
    }

    if (typeOfAsset && typeOfAsset.length > 100) {
        return res.status(400).send('Type of asset is too long.');
    }

    function sanitizePath(inputPath) {
        // Replace any sequence of special characters with a safe character.
        return inputPath.replace(/[^\w\-\/.]/g, '_');
    }
    const sanitizedDeeperPath = sanitizePath(deeperPath);

    let basePath = "";
    typeOfAsset === "Scene Library" ? basePath = `${process.env.EU_ASSET_PATH}${id}/assets` : basePath = `${process.env.EU_IDM_PATH}${id}`;

    const assetsPaths = assets.map(fileName => path.join(basePath, sanitizePath(fileName)));
    const deeperAssetsPaths = assets.map(fileName => path.join(sanitizedDeeperPath, sanitizePath(fileName)));

    const tempDirectory = path.join(os.tmpdir(), 'downloadAssetsTmp');

    if (!fs.existsSync(tempDirectory)) {
        fs.mkdirSync(tempDirectory, { recursive: true });
    }

    const zip = archiver('zip', {
        zlib: { level: 9 }
    });

    res.set('Content-Type', 'application/zip');
    res.set('Content-Disposition', 'attachment; filename=Assets.zip');
    zip.pipe(res);

    const rsyncAsset = (assetPath, deeperAssetPath) => new Promise((resolve, reject) => {
        const assetFileName = path.basename(assetPath);
        const localAssetPath = path.join(tempDirectory, assetFileName);

        const rsyncArgs = [
            '-avz',
            '-e',
            `ssh -i ${privateKeyPath} -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null`,
            `${remoteUsername}@${remoteServer}:${deeperAssetPath}`,
            localAssetPath
        ];

        const rsync = spawn('rsync', rsyncArgs);
        rsync.stdout.on('data', (data) => {
            if (process.env.NODE_ENV !== 'production') {
                console.log('Rsync output:', data.toString());
            }
        });

        rsync.stderr.on('data', (data) => {
            console.error(`Rsync error for asset ${assetPath}:`, data.toString());
        });

        rsync.on('close', (code) => {
            if (code !== 0) {
                console.error(`Rsync failed for asset ${assetPath} with code ${code}`);
                reject(`Rsync failed for asset ${assetPath}`);
            } else {
                if (fs.statSync(localAssetPath).isDirectory()) {
                    zip.directory(localAssetPath, assetFileName);
                } else {
                    zip.append(fs.createReadStream(localAssetPath), { name: assetFileName });
                }
                resolve();
            }
        });
        rsync.on('error', (err) => {
            console.error('Error occurred:', err);
        });
    });

    Promise.all(assetsPaths.map((asset, idx) => rsyncAsset(asset, deeperAssetsPaths[idx])))
        .then(() => {
            zip.finalize();
        })
        .catch(error => {
            console.error("Failed to rsync one or more assets:", error);
            res.status(500).send("Failed to download assets.");
        });
};
