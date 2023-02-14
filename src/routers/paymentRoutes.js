const express = require('express');
const { ObjectId } = require('mongodb');
const Bkash = require('../bkash/bkash');
const { findOneData } = require('../database/databaseop/index.js');
const router =express.Router();
const {bookingCollection} = require('../database/databaseop/collections')

const bksh = new Bkash(process.env.BKASH_username, process.env.BKASH_password, process.env.BKASH_appKey, process.env.BKASH_appSecret);

router.get("/bkashpayment/:id",async(req,res)=>{
    const id = req.params.id;
    const query ={_id:ObjectId(id)}
    const product = await findOneData(bookingCollection,query);
    if(product.price){
     let price = product.price;
     let payerReference="hellohello";
     let payerInf = await bksh.setPayerInfo(price,payerReference);
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

router.get('/executepayment',async(req,res)=>{
    let paymentID = req.query.paymentID
    let status = req.query.status;
    if(status ==="success"){
        let executePay = await bksh.executePayment(paymentID);
        res.send(executePay);
    }
    if(status === "cancel"){
        res.send({message:"Execute Payment Cancelled"});
    }
    if(status === "failure"){
        res.send({message:"Execute Payment Failure"});
    }
})

module.exports = router;

