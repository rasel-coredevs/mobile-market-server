const {Router} = require('express');
const { ObjectId } = require('mongodb');
const { verifyJWT, verifySeller, verifyAdmin, verifyUser } = require('../auth/authenticate');
const { findAll, findOneData, createOne, upsertOne, deleteOneData} = require('../database/databaseop');
const {productCollection, userCollection, reportedProductCollection} = require('../database/databaseop/collections')

const router = Router();

//get all one category product
router.get("/products/:id", async (req, res) => {
    const id = req.params.id;
    const query = {
      categoryId: id,
      isSold: false,
    };
    try{
      const products = await findAll(productCollection,query);
    res.send(products);
    }catch(err){
      console.log(err);
    }
  });

  // get advertised products
  router.get("/advertised", async (req, res) => {
    const query = {
      isSold: false,
      advertised: true,
    };
    try{
      const products = await findAll(productCollection,query);
      res.send(products);
    }catch(err){
      console.log(err)
    }
  });

  //get myproducts-seller api
  router.get("/myproducts", async (req, res) => {
    const email = req.query.email;
    const query = { sellerEmail: email };
    //have to modified
    try{
      const products = await findAll(productCollection,query);
      res.send(products);
    }catch(err){
      console.log(err);
    }
  });
// get reported items api
  router.get("/reportedItems", verifyJWT, verifyAdmin, async (req, res) => {
    const query = {};
    try{
      const products = await findAll(reportedProductCollection,query);
      res.send(products);
    }catch(err){
      console.log(err);
    }
  });

  router.post("/products", verifyJWT, verifySeller, async (req, res) => {
    const product = req.body;
    const sellerEmail = product.sellerEmail;
    const query = {
      email: sellerEmail,
    };
    try{
      const seller = await findOneData(userCollection,query);

    if (seller?.verified) {
      product.sellerVerified = true;
    } else {
      product.sellerVerified = false;
    }
    const result = await createOne(productCollection,product);
    res.send(result);
    }catch(err){
      console.log(err);
    }
  });

    // put reported items
    router.put("/reportedItems", verifyJWT, verifyUser, async (req, res) => {
      const product = req.body;
      const filter = { productId: product.productId };
      const updatedDoc = {
          $set: product,
        };
        const options = { upsert: true };
      try{
        const result = await upsertOne(
          reportedProductCollection,
          filter,
          updatedDoc,
          options
        );
        res.send(result);
      }catch(err){
        console.log(err)
      }
    });

    //update specific product
    router.put("/products/:id", verifyJWT, verifySeller, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      try{
        const alredyAdvertised = await findOneData(productCollection,query);
      if (alredyAdvertised?.advertised) {
        return res.send({
          acknowledged: false,
          message: "Sorry! This Product Already Advertised",
        });
      }
      const updatedDoc = {
        $set: {
          advertised: true,
        },
      };
      const result = await upsertOne(productCollection,query, updatedDoc);
      res.send(result);
      }catch(err){
        console.log(err)
      }
    });

    //delete specific product
    router.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      try{
        const result = await deleteOneData(productCollection,query);
        res.send(result);
      }catch(err){
        console.log(err)
      }
    });

    //delete reported products api
    router.delete(
      "/reportedItems/:id",
      verifyJWT,
      verifyAdmin,
      async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) };
        try{
          const reportedProduct = await findOneData(reportedProductCollection,query);
          const filter = { _id: ObjectId(reportedProduct?.productId) };
          const deletedFromProduct = await deleteOneData(productCollection,filter);
          const result = await deleteOneData(reportedProductCollection,query);
          res.send(result);
        }catch(err){
          console.log(err);
        }
      }
    );

  

  module.exports = router;

