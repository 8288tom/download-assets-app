const { Client } = require('ssh2'); // Import the ssh2 package
const privateKeyPath = "Prod-Ireland-KP-2020.pem"//"PROD-2018-US" - dev
const remoteServer = process.env.EU_HOST //'52.72.29.68' -dev
const remoteUsername = "ubuntu"//'tom' -dev

module.exports.findAssetsOnFsEu = (req, res) => {
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

    let path = "";


    function sanitizePath(inputPath) {
        // Replace any sequence of special characters with a safe character.
        return inputPath.replace(/[^\w\-\/.]/g, '_');
    }

    try {
        if (!requestedFolder) {
            path = typeOfAsset === "Scene Library" ?
                `${process.env.EU_ASSET_PATH}${id}/assets/`
                :
                `${process.env.EU_IDM_PATH}${id}/`
        } else {
            path = decodeURIComponent(pathOnFs);
        }
        path = sanitizePath(path);
        if (process.env.NODE_ENV !== 'production') {
            console.log("path ls ran on:", path)
        }
        const command = `ls -lh "${path}"`;

        // Establish an SSH connection to the EU server
        const conn = new Client();
        conn.on('ready', () => {
            console.log('SSH connection to EU server established');

            // Execute the command on the remote server
            conn.exec(command, (err, stream) => {
                if (err) {
                    console.error('Error executing command on EU server:', err);
                    return res.status(500).json({
                        error: err,
                        message: "Error executing command on EU server"
                    });
                }

                let output = '';

                // Handle command output
                stream.on('data', (data) => {
                    output += data.toString();
                });

                stream.on('end', () => {
                    // Parse and process the command output
                    const outputLines = output.split('\n').slice(1);
                    const outputObject = {
                        typeOfAsset: typeOfAsset,
                        env: "EU",
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
                                // Determine extension or set to "directory" if no dot in name

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
                        }).filter(Boolean)
                        // Remove undefined objects
                    };

                    // Send the output back to the client
                    res.json(outputObject);
                });

            });
        });

        // Load private key and establish the connection to the EU server
        conn.connect({
            host: remoteServer,
            port: 22,
            username: remoteUsername,
            privateKey: require('fs').readFileSync(privateKeyPath)
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: error,
            message: "Error processing request"
        });
    }
};




