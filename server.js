import express from "express";
import cors from "cors";
import config from "./knexfile.js"
import "dotenv/config";

const knex = initKnex(config);
const app = express();

import router from "./routes/"  // add route file 

const { PORT, CORS_ORIGIN } = process.env;

app.use(express.json()); 

app.use(express.static("public")); 

app.use(cors({ origin: CORS_ORIGIN })); 

app.use(router); 

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});