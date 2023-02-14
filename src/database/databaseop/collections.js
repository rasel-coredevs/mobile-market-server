const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k4jjnoi.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const bookingCollection = client.db("MoblieMarket").collection("Bookings");
const categoryCollection = client.db("MoblieMarket").collection("Categories");
const productCollection = client.db("MoblieMarket").collection("Products");
const userCollection = client.db("MoblieMarket").collection("Users");
const reportedProductCollection = client.db("MoblieMarket").collection("reportedProducts");

module.exports ={client,bookingCollection,categoryCollection,productCollection,userCollection,reportedProductCollection}