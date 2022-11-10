const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.port || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");

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
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
//   if (!authHeader) {
//     return res.status(401).send({ message: "unauthorized access" });
//   }
  const token = authHeader.split(" ")[1];
  //verify token
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    // if (err) {
    //   return res.status(403).send({ message: "forbidden access" });
    // }
    req.decoded = decoded;
    next();
  });
}
async function run() {
  try {
    const servicesCollection = client
      .db("webDevUntangled")
      .collection("services");

    const serviceReviewCollection = client
      .db("webDevUntangled")
      .collection("reviews");

    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "7d",
      });
      res.send({ token });
    });
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
    //read for service review section
    app.get("/reviews", verifyJWT, async (req, res) => {
      const decoded = req.decoded;
      console.log("Inside orders api", decoded);
      if (decoded.email !== req.query.email) {
        res.status(403).send({ message: "unauthorized access" });
      }
      let query = {};
      if (req.query.email) {
        query = {
          user_email: req.query.email,
        };
      }
      const cursor = serviceReviewCollection.find(query).sort({ date: -1 });

      const reviews = await cursor.toArray();
      res.send(reviews);
    });
    //read for service review section
    //read for service review section
    app.get("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { service_id: id };
      const cursor = serviceReviewCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    // delete for my review route
    app.delete("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await serviceReviewCollection.deleteOne(query);
      res.send(result);
    });
    // update for my review route
    app.patch("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const updatedReview = req.body.updatedReview;
      const query = { _id: ObjectId(id) };
      const updatedDoc = {
        $set: {
          reviewText: updatedReview,
        },
      };
      const result = await serviceReviewCollection.updateOne(query, updatedDoc);
      res.send(result);
      // console.log(result);
    });
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
