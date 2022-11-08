const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.port || 5000;
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}
@cluster0.tulr71e.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    
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
