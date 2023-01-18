const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const bodyParser = require("body-parser");

// to connect mongodb database.
const Connection = require("./db/database");

// to add api end points.
const router = require("./routes/router");

const app = express();
const PORT = process.env.PORT || 8000;

dotenv.config();
// To bypassing the Access-Control-Allow-Origin headers, which specify which origins can access the API
app.use(cors());

// to process data sent in an HTTP request body.
app.use(bodyParser.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

//adding end points.
app.use("/", router);

// listening on port.. 8000..
app.listen(PORT, () => {
  console.log(`Server running over port: ${PORT}`);
});

// getting mongodb login credentails
const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;

// connecting the mongodb Database.
Connection(username, password);
