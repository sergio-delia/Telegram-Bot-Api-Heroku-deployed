require("dotenv").config();
var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : process.env.host,
  user     : process.env.dbUs,
  password : process.env.dbPsw,
  database : process.env.dbNm
});
 
function executeQuery(sql, params, callback){
    connection.query(sql, params, callback);
}

module.exports = executeQuery;
