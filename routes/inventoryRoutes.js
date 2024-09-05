import express from "express";

const router = express.Router();

// GET all the routes to the inventories
router.get("/inventories", async (req, res) => {
    try{
        const inventories = await req.knexDb("inventories")
        .join("warehouses", "inventories.warehouse_id", "warehouses.id")
        .select(
            "inventories.id",
            "warehouses.warehouse_name",
            "inventories.item_name",
            "inventories.description",
            "inventories.category",
            "inventories.status",
            "inventories.quantity",
        )
        res.status(200).json(inventories)
        
    }catch(error){
        console.error("Error fetching the inventories", error);
    }
})

// Search route to satisfy query
router.get("/inventories/search", async (req, res) => {
    try {
        const query = req.query.query; // Extract query parameter from the query string
        if (!query) {
            return res.status(400).json({ error: 'Query parameter "query" is required' });
        }

        const matches = await req.knexDb("inventories")
            .join("warehouses", "inventories.warehouse_id", "warehouses.id")
            .select(
                "inventories.id",
                "warehouses.warehouse_name",
                "inventories.item_name",
                "inventories.description",
                "inventories.category",
                "inventories.status",
                "inventories.quantity",
            )
            .where('warehouses.warehouse_name', 'like', `%${query}%`) // Match item_name
            .orWhere('inventories.id', 'like', `%${query}%`)
            .orWhere('inventories.item_name', 'like', `%${query}%`)
            .orWhere('inventories.description', 'like', `%${query}%`)
            .orWhere('inventories.category', 'like', `%${query}%`)
            .orWhere('inventories.status', 'like', `%${query}%`)
            .orWhere('inventories.quantity', 'like', `%${query}%`);
        res.status(200).json(matches);
    } catch (error) {
        console.error('Error querying inventories:', error);
        res.status(500).json({ error: 'Error querying inventories' });
    }
});

// GET route to single inventories
router.get("/inventories/:id", async (req, res) => {
    try{
        const {id} = req.params;
        const item = await req.knexDb("inventories")
            .join("warehouses", "inventories.warehouse_id", "warehouses.id")
            .select(
                "inventories.id",
                "warehouses.warehouse_name",
                "inventories.item_name",
                "inventories.description",
                "inventories.category",
                "inventories.status",
                "inventories.quantity",
            )
            .where("inventories.id", id)
            .first(); 
        if(!item){
            res.status(404).json({error: "Inventory item does not exist"})
        }
        res.status(200).json(item)
    }catch(error){
        console.error("Error fetching the inventory item", error);
    }
})

export default router;