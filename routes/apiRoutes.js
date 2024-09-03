import express from "express";
import knex from "knex";
import config from "../knexfile.js"
import { v4 as uuidv4 } from "uuid";

const knexDb = knex(config.development);
const router = express.Router();

// todo:try catch
router.get("/warehouses", async (req,res)=>{
    const warehouseData = await knexDb.select("*").from("warehouses");
    res.json(warehouseData);
})

export default router;