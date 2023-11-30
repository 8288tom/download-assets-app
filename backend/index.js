const express = require("express");
require('dotenv').config({
    path: process.env.NODE_ENV === 'prod' ? '.env.prod' : '.env.dev'
});
console.log("Starting server in ENV:", process.env.NODE_ENV)

const PORT = process.env.PORT || 5069;
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const efsMountPoint = process.env.EFS_MOUNT_POINT || '/mnt/efs';

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests, please try again later.",

});


const app = express();
//change to "prod" when going prod
app.set('trust proxy', 1); // to trsut proxy for IP determination
app.use(apiLimiter);
app.use(express.json())
app.use(cors({ origin: 'http://sbox.idmadm.com/' }))


// routes:
const downloadAssetsRoutes = require("./routes/appRoutes")
app.use("/", downloadAssetsRoutes)



app.use(express.urlencoded({ extended: true }))


app.get("/api", (req, res) => {
    res.json({ message: "Weclome to the homepage!" })
})



app.get("*", (req, res) =>
    res.send("404 not found")
)

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on ${PORT}`);
});
