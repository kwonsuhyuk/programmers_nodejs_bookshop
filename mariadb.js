// mysql
const mariadb = require("mysql2");

// DB 연결
const connection = mariadb.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "root",
  database: "Bookshop",
  dateStrings: true,
});

module.exports = connection;
