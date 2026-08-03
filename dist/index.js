import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb";
dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
// MongoDB Client
const client = new MongoClient(process.env.MONGO_DB_URI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});
// Connect MongoDB
async function connectDB() {
    try {
        await client.connect();
        console.log("✅ MongoDB Connected");
    }
    catch (error) {
        console.log(error);
    }
}
connectDB();
// Home Route
app.get("/", (req, res) => {
    res.send("Server is running successfully");
});
// Database & Collections
const db = client.db("burmuda_shop");
const productsCollection = db.collection("products");
// lasted 4 products
app.get("/api/products/latest", async (req, res) => {
    try {
        const latestProducts = await productsCollection.find().sort({ _id: -1 }).limit(4).toArray();
        res.status(200).json({
            success: true,
            data: latestProducts,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch latest products",
        });
    }
});
// delete Product by ID
app.delete("/api/products/:id", async (req, res) => {
    const { id } = req.params;
    const result = await productsCollection.deleteOne({ _id: new ObjectId(id) });
    res.status(200).json({
        success: true,
        data: result,
    });
});
// Get Product by ID
app.get("/api/products/:id", async (req, res) => {
    const { id } = req.params;
    const result = await productsCollection.findOne({ _id: new ObjectId(id) });
    res.status(200).json({
        success: true,
        data: result,
    });
});
// get products by session user
app.get("/api/products/user/:userId", async (req, res) => {
    const { userId } = req.params;
    const result = await productsCollection.find({ userId }).toArray();
    res.status(200).json({
        success: true,
        data: result,
    });
});
// Get all Products
app.get("/api/products", async (req, res) => {
    const search = req.query.search;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 8;
    const skip = (page - 1) * limit;
    const query = {};
    if (search) {
        query.$or = [
            { title: { $regex: search, $options: "i" } },
            { shortDescription: { $regex: search, $options: "i" } },
            { fullDescription: { $regex: search, $options: "i" } },
            { category: { $regex: search, $options: "i" } },
            { userEmail: { $regex: search, $options: "i" } },
        ];
    }
    try {
        const totalProducts = await productsCollection.countDocuments(query);
        const products = await productsCollection
            .find(query)
            .skip(skip)
            .limit(limit)
            .toArray();
        res.status(200).json({
            success: true,
            data: products,
            pagination: {
                page,
                limit,
                totalProducts,
                totalPages: Math.ceil(totalProducts / limit),
            },
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch products",
        });
    }
});
// Add Product
app.post("/api/products", async (req, res) => {
    try {
        const product = req.body;
        const result = await productsCollection.insertOne(product);
        res.status(201).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to add product",
        });
    }
});
// Local Development
if (process.env.NODE_ENV !== "production") {
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
        console.log(`🚀 Server running on port ${port}`);
    });
}
export default app;
//# sourceMappingURL=index.js.map