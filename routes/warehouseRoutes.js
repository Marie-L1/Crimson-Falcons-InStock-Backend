import express from 'express';

const router = express.Router();

// Utility function to validate phone numbers and emails
const isValidPhoneNumber = (phone) => {
    const phoneRegex = /^\+?[1-9]\d{0,2}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}$/; // E.164 format for international numbers
    return phoneRegex.test(phone);
};

const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email validation
    return emailRegex.test(email);
};

// GET all warehouses
router.get("/warehouses", async (req, res) => {
    try {
        const warehouses = await req.knexDb("warehouses").select("*");
        res.status(200).json(warehouses);
    } catch (error) {
        console.error("Error fetching warehouses", error);
        res.status(500).send("Error fetching warehouses");
    }
});

// Search route to satisfy query
router.get("/warehouses/search", async (req, res) => {
    try {
        const query = req.query.query; // Extract query parameter from the query string
        if (!query) {
            return res.status(400).json({ error: 'Query parameter "query" is required' });
        }
        const matches = await req.knexDb("warehouses").select("*")
            .where('warehouses.warehouse_name', 'like', `%${query}%`) 
            .orWhere('warehouses.id', 'like', `%${query}%`)
            .orWhere('warehouses.address', 'like', `%${query}%`)
            .orWhere('warehouses.country', 'like', `%${query}%`)
            .orWhere('warehouses.contact_name', 'like', `%${query}%`)
            .orWhere('warehouses.contact_position', 'like', `%${query}%`)
            .orWhere('warehouses.contact_email', 'like', `%${query}%`);
        res.status(200).json(matches);
    } catch (error) {
        console.error('Error querying inventories:', error);
        res.status(500).json({ error: 'Error querying inventories' });
    }
});

// GET a single warehouse
router.get("/warehouses/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const warehouse = await req.knexDb("warehouses").where({ id }).first();

        if (!warehouse) {
            return res.status(404).send("Warehouse ID not found");
        }

        res.status(200).json(warehouse);
    } catch (error) {
        console.error("Error fetching warehouse", error);
        res.status(500).send("Error fetching warehouse");
    }
});

// POST/CREATE a new warehouse
router.post("/warehouses", async (req, res) => {
    try {
        const { warehouse_name, address, city, country, contact_name, contact_position, contact_phone, contact_email } = req.body;

        if (!warehouse_name || !address || !city || !country || !contact_name || !contact_position || !contact_email || !contact_phone) {
            return res.status(400).send("Error: Missing properties");
        }

        if (!isValidEmail(contact_email)) {
            return res.status(400).send("Error: Invalid email address");
        }

        if (!isValidPhoneNumber(contact_phone)) {
            return res.status(400).send("Error: Invalid phone number");
        }

        const result = await req.knexDb("warehouses").insert(req.body);
        const newWarehouseId = result[0];
        const newWarehouse = await req.knexDb("warehouses").where({ id: newWarehouseId }).first();

        res.status(201).json(newWarehouse);
    } catch (error) {
        console.error("Error creating warehouse", error);
        res.status(400).send("Error creating warehouse");
    }
});

// PUT/EDIT a warehouse
router.put('/warehouses/:id', async (req, res) => {
    const { id } = req.params;
    const {
        warehouse_name,
        address,
        city,
        country,
        contact_name,
        contact_position,
        contact_phone,
        contact_email,
    } = req.body;

    if (
        !warehouse_name || !address || !city || !country ||
        !contact_name || !contact_position || !contact_phone || !contact_email
    ) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    if (!isValidPhoneNumber(contact_phone)) {
        return res.status(400).json({ error: 'Invalid phone number.' });
    }

    if (!isValidEmail(contact_email)) {
        return res.status(400).json({ error: 'Invalid email address.' });
    }

    try {
        const existingWarehouse = await req.knexDb('warehouses').where({ id }).first();
        if (!existingWarehouse) {
            return res.status(404).json({ error: 'Warehouse ID not found.' });
        }

        await req.knexDb('warehouses')
            .where({ id })
            .update({
                warehouse_name,
                address,
                city,
                country,
                contact_name,
                contact_position,
                contact_phone,
                contact_email,
                updated_at: req.knexDb.fn.now(),
            });

        const updatedWarehouse = await req.knexDb('warehouses').where({ id }).first();
        return res.status(200).json(updatedWarehouse);
    } catch (error) {
        console.error('Error updating warehouse:', error);
        return res.status(500).json({ error: 'Error updating warehouse.' });
    }
});

// DELETE a warehouse
router.delete('/warehouses/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const warehouse = await req.knexDb('warehouses').where({ id }).first();

        if (!warehouse) {
            return res.status(404).send('Warehouse ID not found');
        }

        await req.knexDb('warehouses').where({ id }).del();
        return res.status(204).send();
    } catch (error) {
        console.error('Error deleting warehouse:', error);
        res.status(500).send('Error deleting warehouse');
    }
});

//GET inventories by warehouse id
router.get('/warehouses/:id/inventories', async (req, res) => {
    try {
        const { warehouseId } = req.params;
        const warehouse = await req.knexDb('warehouses').where({ id:req.params.id });

        if (!warehouse) {
            return res.status(404).send('Warehouse ID not found');
        }

        const warehouseInventories = await req.knexDb('inventories').where({ warehouse_id:warehouse[0].id }).select("*")
        res.status(200).send(warehouseInventories);
    } catch (error) {
        console.error('Error getting warehouse by inventory', error);
        res.status(500).send('Error getting warehouse by inventory');
    }
});

export default router;