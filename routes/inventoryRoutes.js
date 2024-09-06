import express from "express";
import axios from 'axios';
import "dotenv/config";

const router = express.Router();
const { PORT} = process.env;

// Utility function to check if quantity is not a number
const isNumber = (value) => {
    const pattern = /^\d+$/;
    return pattern.test(value);
};

// Utility function to check if warehouse ID exists
const isValidWarehouseId = async (warehouseId) => {
    try{
        await axios.get(`http://localhost:${PORT}/api/warehouses/${warehouseId}`);
        return true;
    } catch (error) {
        return false;
    }
};

// GET all the routes to the inventories
router.get("/inventories", async (req, res) => {
    try{
        const inventories = await req.knexDb("inventories")
        .join("warehouses", "inventories.warehouse_id", "warehouses.id")
        .select(
            "inventories.id",
            "warehouses.warehouse_name",
            "inventories.warehouse_id",
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

// POST/CREATE a new inventory
router.post("/inventories", async (req, res) => {
    try {
        console.log(req.body);
        const { warehouse_id, item_name, description, category, status, quantity } = req.body;

        if (!warehouse_id || !item_name || !description || !category || !status || quantity === null || quantity == undefined || quantity === "") {
            return res.status(400).send("Error: Missing properties");
        }

        if (!await isValidWarehouseId(warehouse_id)) {
            return res.status(400).send("Error: Invalid warehouse ID");
        }

        if (!isNumber(quantity)) {
            return res.status(400).send("Error: Quantity must be a valid number");
        }

        const result = await req.knexDb("inventories").insert(req.body);
        const newInventoryId = result[0];
        const newInventory = await req.knexDb("inventories").where({ id: newInventoryId }).first();

        res.status(201).json({newInventory});
    } catch (error) {
        console.error("Error creating inventory", error);
        res.status(400).send("Error creating inventory");
    }
});

// PUT/EDIT a warehouse
router.put('/inventories/:id', async (req, res) => {
    const { id } = req.params;
    const { warehouse_id, item_name, description, category, status, quantity } = req.body;

    if (!warehouse_id || !item_name || !description || !category || !status || quantity === null || quantity == undefined || quantity === "") {
        return res.status(400).send("Error: Missing properties");
    }

    if (!await isValidWarehouseId(warehouse_id)) {
        return res.status(400).send("Error: Invalid warehouse ID");
    }

    if (!isNumber(quantity)) {
        return res.status(400).send("Error: Quantity must be a valid number");
    }

    try {
        const existingInventory = await req.knexDb('inventories').where({ id }).first();
        if (!existingInventory) {
            return res.status(404).json({ error: 'Inventory ID not found.' });
        }

        await req.knexDb('inventories')
            .where({ id })
            .update({
                warehouse_id, 
                item_name, 
                description, 
                category, 
                status, 
                quantity,
                updated_at: req.knexDb.fn.now(),
            });

        const updatedInventory = await req.knexDb('inventories').where({ id }).first();
        return res.status(200).json(updatedInventory);
    } catch (error) {
        console.error('Error updating inventory:', error);
        return res.status(500).json({ error: 'Error updating inventory.' });
    }
});

// DELETE an inventory
router.delete('/inventories/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const inventory = await req.knexDb('inventories').where({ id }).first();

        if (!inventory) {
            return res.status(404).send('Inventory ID not found');
        }

        await req.knexDb('inventories').where({ id }).del();
        return res.status(204).send();
    } catch (error) {
        console.error('Error deleting inventory:', error);
        res.status(500).send('Error deleting inventory');
    }
});

export default router;