module.exports = {
    GenerateToken: function (payload) {
        // https://www.sohamkamani.com/blog/javascript/2019-03-29-node-jwt-authentication/

        const jwt = require("jsonwebtoken")
        const token = jwt.sign(payload, process.env.PRIV_KEY, {
            algorithm: "HS256"
        })

        return token;
    }
}