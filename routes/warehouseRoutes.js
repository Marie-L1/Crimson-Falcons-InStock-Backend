import express from "express";

const router = express.Router();

// GET all the routes to the warehouses
router.get("/warehouses", async (req, res) => {
    try{
        // query the db for all warehouses - uses req.knexDb for queries
        const warehouses = await req.knexDb("warehouses").select("*");
        
        // respond with 200 status and data
        res.status(200).json(warehouses)

    }catch{
        res.status(500).send("Error fetching warehouses")
    }
});


// GET a single warehouse
router.get("/warehouses/:id", async (req, res) => {
    try{
        // request params -> extract the id
        const { id } = req.params;

        // query for warehouse
        const warehouse = await req.knexDb("warehouses").where({ id }).first();

        res.status(200).json(warehouse)
    }catch(error){
        console.error("Error fetching warehouse", error)
        res.status(500).send("Error fetching warehouse")
    }
})


export default router;