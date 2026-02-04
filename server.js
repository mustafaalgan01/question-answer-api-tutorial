const express = require("express");
const dotenv = require("dotenv");
const connectDatabase = require("./helpers/database/connectDatabase");
const routers = require("./routers/index")
const customErrorHandler = require("./middlewares/errors/customErrorHandler");
const path = require("path");

// Enviroment Veriables

dotenv.config({
    path: "./config/env/config.env"
});

//Mongodb Connect
connectDatabase();

const app = express();


//Express Middleware
app.use(express.json());


const PORT = process.env.PORT;


// Routers Middleware

app.use("/api", routers);

//Error Handler
app.use(customErrorHandler);

//Static Files
app.use(express.static(path.join(__dirname, "public")));


app.listen(PORT, () => {

});