const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const dbConnect = require("./db/dbConnect");
const cors = require("cors");
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true })); 
const journalRouter = require("./routes/journalRoutes");
//execute database connection
dbConnect();

app.use(cors());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS" 
  );
  next();
});

// body parser configuration
app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  
  
app.use(journalRouter);
// Project by Adedotun Os-Efa
module.exports = app;
