const { execFile } = require('child_process');

module.exports.findAssetsOnFsUs = (req, res) => {
    let { id, typeOfAsset, requestedFolder, pathOnFs } = req.body;
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



    path = sanitizePath(decodeURIComponent(pathOnFs));

    if (!requestedFolder) {
        path = typeOfAsset === "Scene Library" ?
            `${process.env.US_ASSET_PATH}${id}/assets/` :
            `${process.env.US_IDM_PATH}${id}/`;
    } else {
        path = decodeURIComponent(pathOnFs);
    }

    try {
        execFile('ls', ['-lh', path], (error, stdout, stderr) => {
            if (error) {
                if (stderr.includes('No such file or directory')) {
                    return res.status(500).json({
                        error: error,
                        message: "Asset does not exist"
                    });
                }
            }
            if (stderr) {
                console.error(`Command error: ${stderr}`);
            }

            const outputLines = stdout.split('\n').slice(1);
            const outputObject = {
                typeOfAsset: typeOfAsset,
                env: "US",
                id: id,
                totalFiles: outputLines.length,
                output: outputLines.map(line => {
                    const fields = line.trim().split(/\s+/);
                    const sizeIndex = 4;
                    const ownerIndex = 2;
                    const groupIndex = 3;
                    const nameIndex = 8;

                    if (fields.length >= nameIndex) {
                        const name = fields.slice(nameIndex).join(' ');
                        let extension = "directory";
                        const lastDotIndex = name.lastIndexOf('.');
                        if (lastDotIndex !== -1) {
                            extension = name.substr(lastDotIndex + 1);
                        }

                        return {
                            size: fields[sizeIndex],
                            owner: fields[ownerIndex],
                            group: fields[groupIndex],
                            name: fields.slice(nameIndex).join(' '),
                            extension: extension
                        };
                    }
                }).filter(Boolean) // Remove undefined objects
            };

            res.json(outputObject);
        });
    } catch (error) {
        console.log(error);
    }
};
