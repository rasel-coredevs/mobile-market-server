const jwt = require("jsonwebtoken");
const { findOneData } = require("../database/databaseop");
const { userCollection } = require("../database/databaseop/collections");



const verifyJWT=(req, res, next) =>{
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).send("unauthorized access");
    }
  
    const token = authHeader.split(" ")[1];
  
    jwt.verify(token, process.env.TOKEN_SECRET, function (err, decoded) {
      if (err) {
        return res.status(403).send({ message: "forbidden access" });
      }
      req.decoded = decoded;
      next();
    });
  }

    //using verification after jwt verify
    const verifyAdmin = async (req, res, next) => {
        const decodedEmail = req.decoded.email;
        const query = { email: decodedEmail };
        const user = await findOneData(userCollection,query);
  
        if (user?.role !== "admin") {
          return res.status(403).send({ message: "forbidden access" });
        }
        next();
      };
      const verifySeller = async (req, res, next) => {
        const decodedEmail = req.decoded.email;
        const query = { email: decodedEmail };
        const user = await findOneData(userCollection,query);
  
        if (user?.role !== "seller") {
          return res.status(403).send({ message: "forbidden access" });
        }
        next();
      };
      const verifyUser = async (req, res, next) => {
        const decodedEmail = req.decoded.email;
        const query = { email: decodedEmail };
        const user = await findOneData(userCollection,query);
  
        if (user?.role !== "user") {
          return res.status(403).send({ message: "forbidden access" });
        }
        next();
      };

module.exports = {verifyJWT,verifyAdmin,verifySeller,verifyUser};