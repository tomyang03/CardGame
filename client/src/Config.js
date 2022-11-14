const dotenv = require("dotenv");
dotenv.config();
module.exports = {
  SERVERURL:
    process.env.NODE_ENV === "production" // npm run build
      ? ""
      : process.env.REACT_APP_SERVERURL, // npm start
};
