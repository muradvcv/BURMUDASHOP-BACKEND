import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { MongoClient, ServerApiVersion } from "mongodb";

dotenv.config();

const app = express();
const port = 5000;

app.use(express.json());
app.use(cors());

const client = new MongoClient(process.env.MONGO_DB_URI as string, {
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

    // get api for fetching products from the database
    app.get("/api/products", async (req, res) => {
      try {
        const products = await productsCollection.find().toArray();
        res.json({ success: true, data: products });
      } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to fetch products" });
      }
    });


    //  post api for adding products to the database
    app.post("/api/products", async (req, res) => {
      try {
        const product = req.body;
        const result = await productsCollection.insertOne(product);
        res.status(201).json({ success: true, data: result });
      } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to add product" });
      }
    });


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