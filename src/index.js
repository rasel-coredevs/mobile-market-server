const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const paymentRouter = require('./routers/paymentRoutes');
const categoryRouter = require('./routers/categories');
const productsRouter = require('./routers/productsRouter');
const bookingRouter = require('./routers/bookingRouter');
const userRouter = require('./routers/userRouter');
const connect = require("./database/connect");
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use(paymentRouter);
app.use(categoryRouter);
app.use(productsRouter);
app.use(bookingRouter);
app.use(userRouter);

app.get("/", (req, res) => {
  res.send("Mobile Market Server is Running.....");
});

app.listen(port, async() => {
  try{
    const connected = await connect();
    console.log(connected);
    console.log("Mobile Market Server is Running on Port ", port);
  }catch(err){
    console.log(err)
  }
});
