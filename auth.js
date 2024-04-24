const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const ensureAuthorization = (req, res) => {
  try {
    let receivedJwt = req.headers["authorization"];

    if (receivedJwt) {
      let decodedJwt = jwt.verify(receivedJwt, process.env.PRIVATE_KEY);
      return decodedJwt;
    } else {
      throw new ReferenceError("jwt must be provided");
    }
  } catch (error) {
    console.log(error);

    return error;
  }
};

module.exports = ensureAuthorization;
