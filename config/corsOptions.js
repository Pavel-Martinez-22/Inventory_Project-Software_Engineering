//whitelist for CORS will be for who is allowed to access your api
//You can access your api with your own website
//You can access api if you golive in VS maybe your are building with react
//Or if you are using custom server and want to access with localhost

const allowedOrigins = require('./allowedOrigins');

const corsOptions = {
    origin: (origin, callback) => {
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200
}

module.exports = corsOptions;