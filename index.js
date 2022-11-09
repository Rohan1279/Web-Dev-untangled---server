const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.port || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wvywou5.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const servicesCollection = client
      .db("webDevUntangled")
      .collection("services");

    const serviceReviewCollection = client
      .db("webDevUntangled")
      .collection("reviews");

    //read for home page
    app.get("/", async (req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query);
      const services = await cursor.limit(3).toArray();
      res.send(services);
    });
    //read for services page
    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });
    //read for service detail
    app.get("/service/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await servicesCollection.findOne(query);
      res.send(service);
    });
    // create service for add service
    app.post("/services", async (req, res) => {
      const service = req.body;
      const result = await servicesCollection.insertOne(service);
      res.send(result);
    });
    //create review for service detail section
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await serviceReviewCollection.insertOne(review);
      res.send(result);
    });
    // //read for service review section
    // app.get("/reviews/:id", async (req, res) => {
    //   const id = req.params.id;
    //   const query = { service_id: id };
    //   const cursor = serviceReviewCollection.find(query);
    //   const reviews = await cursor.toArray();
    //   res.send(reviews);
    // });
    //read for service review section
    app.get("/reviews", async (req, res) => {
      let query = {};
      if (req.query.service_id) {
        query = {
          service_id: req.query.service_id,
        };
      }
      if (req.query.email) {
        query = {
          user_email: req.query.email,
        };
      }
      const cursor = serviceReviewCollection.find(query).sort({ date: -1 });

      const reviews = await cursor.toArray();
      res.send(reviews);
    });
    // read for my review route
  } finally {
  }
}
run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("simple nodeserver running");
});
app.listen(port, () => {
  console.log(`simple node server running on port ${port}`);
});
