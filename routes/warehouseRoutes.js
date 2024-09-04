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

        // Validation - check if the warehouse id was found
        if(!warehouse){
            return res.status(404).send("Warehouse id not found");
        }

        res.status(200).json(warehouse)
    }catch(error){
        console.error("Error fetching warehouse", error)
        res.status(500).send("Error fetching warehouse")
    }
});

// POST/CREATE a new warehouse
router.post("/warehouses", async (req, res) =>{
    try{
        const {warehouse_name, address, city, country, contact_name, contact_position, contact_phone, contact_email} = req.body;

         // Check for missing properties
         if (!warehouse_name || !address || !city || !country || !contact_name || !contact_position || !contact_email || !contact_phone) {
            return res.status(400).send("Error: Missing properties");
        }

        // Validation - check if the email includes "@"
        if (!contact_email.includes("@")) {
            return res.status(400).send("Error: Invalid email address");
        }

        // Validation - check the length of the contact phone number
        if (contact_phone.length < 10) {
            return res.status(400).send("Error: Invalid phone number");
        }

        // insert the new warehouse into the database and return the new warehouse
        const result = await req.knexDb("warehouses").insert(req.body);

        // fetch the new warehouse
        const newWarehouseId = result[0]; // return the id
        const newWarehouse = await req.knexDb("warehouses").where({ id: newWarehouseId }).first();

        res.status(201).json(newWarehouse);

    }catch(error){
        console.error("Error catching warehouse", error);
        res.status(400).send("Error creating warehouse");
    }
});


export default router;