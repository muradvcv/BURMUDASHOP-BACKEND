import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { MongoClient, ServerApiVersion } from "mongodb";

dotenv.config();

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

const client = new MongoClient(process.env.MONGODB_URI as string, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function startServer() {
  try {
    await client.connect();
    console.log("successfully connected to MongoDB");

    const db = client.db("burmuda_shop");
    const productsCollection = db.collection("products");


    //  post api for adding products to the database
    app.post("/api/products", async (req, res) => {
      const product = req.body;
      const result =await productsCollection.insertOne(product);
      res.send(result);
    })



    app.get("/", (req, res) => {
      res.send(" Server is running successfully");
    });

    app.listen(port, () => {
      console.log(` Server running on port ${port}`);
    });
  } catch (err) {
    console.error(err);
  }
}

startServer();