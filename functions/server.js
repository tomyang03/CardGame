"use strict";
const path = require("path");
const { port, url } = require("./config");
const express = require("express");
const serverless = require("serverless-http");
const myroutes = require("./routes");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/", myroutes);

const router = express.Router();
router.get("/", (req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write("<h1>Hello from Express.js!</h1>");
  res.end();
});
router.get("/another", (req, res) => res.json({ route: req.originalUrl }));
router.post("/", (req, res) => res.json({ postBody: req.body }));

app.use(bodyParser.json());

// we can choose to prefixes every route with /.netlify/functions/server
// app.use("/.netlify/functions/server", router);
// Or redirect each server call frolm "/*" to "/.netlify/functions/server" in netlify.toml
app.use("/", router);
// app.use("/", (req, res) =>
//   res.sendFile(path.join(__dirname, "../build/"), "index.html")
// );

//https://stackoverflow.com/questions/30845416/how-to-go-back-1-folder-level-with-dirname

console.log(port);
console.log(url);
module.exports = app;
module.exports.handler = serverless(app);
