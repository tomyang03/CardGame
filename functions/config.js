const dotenv = require("dotenv");
dotenv.config();
module.exports = {
  port: process.env.PORT,
  url: process.env.MONGO_URL,
  dbname: process.env.DB,
  profilescoll: process.env.PROFILESCOLLECTION,
  tradescoll: process.env.TRADESCOLLECTION,
  requestscoll: process.env.REQUESTSCOLLECTION,
  userscoll: process.env.USERSCOLLECTION,
  cardscoll: process.env.CARDSCOLLECTION,
};
