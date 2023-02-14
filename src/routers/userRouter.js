const {Router} = require('express');
const { upsertOne, findOneData, updateManyData, findAll, deleteOneData } = require('../database/databaseop');
const router = Router();
const {userCollection, productCollection} = require('../database/databaseop/collections');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');
const { verifyJWT, verifyAdmin } = require('../auth/authenticate');

//send user token

router.get("/jwt", async (req, res) => {
    const email = req.query.email;
    const query = { email: email };
    try{
        const user = await findOneData(userCollection,query);
        if (user) {
        const token = jwt.sign({ email }, process.env.TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ token });
    } else {
      res.status(403).send({ message: "forbidden access" });
    }
    }catch(err){
        throw new Error(err);
    }
  });
//get all seller api
router.get("/allseller", async (req, res) => {
    const query = { role: { $in: ["seller"] } };
    try{
        const allseller = await findAll(userCollection,query);
        res.send(allseller);
    }catch(err){
        console.log(err)
    }
  });

//get admin api
router.get("/users/admin/:email", async (req, res) => {
    const email = req.params.email;
    const query = { email: email };
    try{
        const user = await findOneData(userCollection,query);
        res.send({ isAdmin: user?.role === "admin" });
    }catch(err){
        console.log(err);
    }
  });
//get seller api
router.get("/users/seller/:email", async (req, res) => {
    const email = req.params.email;
    const query = { email };
    try{
        const user = await findOneData(userCollection,query);
        res.send({ isSeller: user?.role === "seller" });
    }catch(err){
        console.log(err);
    }
  });
// get user api
router.get("/users/user/:email", async (req, res) => {
    const email = req.params.email;
    const query = { email };
    try{
        const user = await findOneData(userCollection,query);
        res.send({ isUser: user?.role === "user" });
    }catch(err){
        console.log(err);
    }
  });

  //get all buyer api
  router.get("/allbuyer", verifyJWT, verifyAdmin, async (req, res) => {
    const query = { role: { $in: ["user"] } };
    try{
        const allbuyer = await findAll(userCollection,query);
        res.send(allbuyer);
    }catch(err){
        console.log(err);
    }
  });

//put users api
router.put("/users", async (req, res) => {
    const user = req.body;
    const filter = { email: user.email };
    const options = { upsert: true };
    const updatedDoc = {
      $set: user,
    };
    try{
        const result = await upsertOne(userCollection,filter,updatedDoc,options)
        res.send(result);
    }catch(err){
        console.log(err);
    }
  });

   //update seller verification
   router.put("/verifySeller/:id", async (req, res) => {
    const id = req.params.id;
    const filter = { _id: ObjectId(id) };
    const options = { upsert: true };
    const updatedDoc = {
      $set: { sellerVerified: true },
    };
    try{
        const updtaeUser = await upsertOne(userCollection,
            filter,
            updatedDoc,
            options
          );
          const seller = await findOneData(userCollection,filter);
          const sellerEmail = seller.email;
          const query = {
            sellerEmail: sellerEmail,
          };
          const updateProducts = await updateManyData(productCollection,
            query,
            updatedDoc,
            options
          );
          res.send(updtaeUser);
    }catch(err){
        console.log(err)
    }
  });

  //delete seller
  router.delete("/users/:id", verifyJWT, verifyAdmin, async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    try{
        const result = await deleteOneData(userCollection,query);
        res.send(result);
    }catch(err){
        console.log(err)
    }
  });



  module.exports = router;

