const crypto = require('crypto').randomBytes(256).toString('hex');;


module.exports = {
    
    db: "tivfit",
    uri: "mongodb://localhost:27017/",
    secret: crypto,
    
}