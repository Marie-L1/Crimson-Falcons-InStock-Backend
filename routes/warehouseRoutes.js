import express from "express";

const router = express.Router();

// GET all the routes to the warehouses
router.get("/warehouses", async (req, res) => {
    try{
        // query the db for all warehouses - uses req.knexDb for queries
        const warehouses = await req.knexDb("warehouses").select("*");
        
        // respond with 200 status and data
        res.status(200).json(warehouses)

    }catch(error){
        console.error("Error fetching the warehouses", error);
    }
})

export default router;