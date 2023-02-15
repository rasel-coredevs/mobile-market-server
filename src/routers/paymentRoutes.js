const express = require('express');
const { ObjectId } = require('mongodb');
const Bkash = require('../bkash/bkash');
const { findOneData, upsertOne, updateManyData } = require('../database/databaseop/index.js');
const router =express.Router();
const {bookingCollection, productCollection} = require('../database/databaseop/collections')

const bksh = new Bkash(process.env.BKASH_username, process.env.BKASH_password, process.env.BKASH_appKey, process.env.BKASH_appSecret);

router.get("/bkashpayment/:id",async(req,res)=>{
    const id = req.params.id;
    const query ={_id:ObjectId(id)}
    const product = await findOneData(bookingCollection,query);
    if(product.price){
     let price = product.price;
     let payerReference="hellohello";
     let bookingId=id;
     let productId=product?.productId;
     let payerInf = await bksh.setPayerInfo(price,payerReference,bookingId,productId);
     await bksh.grantToken();
    
     res.send({url:"http://localhost:5000/createagreement"})
    }
  else{
    res.send({message:"Something Went Wrong!!!!"})
  }
})

router.get("/createagreement",async(req,res)=>{
   let createAgr = await bksh.createAgreement({});
   res.redirect(createAgr.bkashURL);
})

router.get('/executeagreement',async(req,res)=>{
    let paymentID = req.query.paymentID
    let status = req.query.status;
    //res.send({paymentID,status});
    if(status === "success"){
        const executeAgr = await bksh.executePayment(paymentID);
        const createPay = await bksh.createPayment({
            agreementID:executeAgr.agreementID,   
        });
         res.redirect(createPay.bkashURL)
         //console.log({createPayment:createPay}); 
        //res.send(executeAgr);
    }
    if(status === "cancel"){
        res.send({message:"Execute Agreement Cancelled"});
    }
    if(status === "failure"){
        res.send({message:"Execute Agreement Failure"});
    }
})

router.get('/executepayment/:bookingId/:productId',async(req,res)=>{
    let paymentID = req.query.paymentID
    let status = req.query.status;
    let bookingId = req.params.bookingId;
    let productId = req.params.productId;
    if(status ==="success"){
        let executePay = await bksh.executePayment(paymentID);
        if(executePay.statusMessage ==="Successful"){
            let query1= {_id:ObjectId(bookingId)};
            let updatedDoc1 ={
                $set:{
                    isSold: true,
                    paid:true,
                    paymentID: executePay.paymentID,
                    agreementID: executePay.agreementID,
                    payerReference: executePay.payerReference,
                    trxID: executePay.trxID,
                }
            }
            await upsertOne(bookingCollection,query1,updatedDoc1);
            let updatedDoc2 ={
                $set:{
                    isSold: true,
                }
            }
            let query={productId}
            await updateManyData(bookingCollection,query,updatedDoc2);
            let query2= {_id: ObjectId(productId)};
            await upsertOne(productCollection,query2,updatedDoc2);

            res.redirect("http://localhost:3000/dashboard/myorders");
            //res.send(executePay);
        }
        
    }
    if(status === "cancel"){
        res.send({message:"Execute Payment Cancelled"});
    }
    if(status === "failure"){
        res.send({message:"Execute Payment Failure"});
    }
})

module.exports = router;

