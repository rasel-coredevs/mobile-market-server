const {Router} = require('express');
const { verifyJWT } = require('../auth/authenticate');
const { findOneData, insertOneData, findAll } = require('../database/databaseop');
const router = Router();
const {bookingCollection} = require('../database/databaseop/collections')

//post booking
router.post("/bookings", async (req, res) => {
    const booking = req.body;
    const query = {
      userEmail: booking.userEmail,
      productId: booking.productId,
    };
    try{
      const alredyBooked = await findOneData(bookingCollection,query);
    if (alredyBooked) {
      return res.send({
        acknowledged: false,
        message: "You Already Booked This Product",
      });
    }

    const result = await insertOneData(bookingCollection,booking);
    res.send(result);
    }catch(err){
      console.log(err);
    }
  });

  //get specific booking
  router.get("/bookings/:id", async (req, res) => {
    const id = req.params.id;
    const query = { _id: ObjectId(id) };
    try{
        const booking = await findOneData(bookingCollection,query);
        res.send(booking);
    }catch(err){
        console.log(err);
    }
  });

//get bookings for a user
router.get("/bookings", verifyJWT, async (req, res) => {
    const decoded = req.decoded;
    //console.log(req.headers.authorization);
    const email = req.query.email;
    if (decoded.email !== email) {
        res.status(403).send({ message: "forbidden access" });
    }
    const query = { userEmail: email };
    try{
        const bookings = await findAll(bookingCollection,query);
        res.send(bookings);
    }catch(err){
        console.log(err)
    }
    });

  module.exports = router;