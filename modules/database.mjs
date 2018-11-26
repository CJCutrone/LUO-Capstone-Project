import mysql from "mysql";

/**
 * @author Camille Cutrone
 */
const pool = mysql.createPool({
    connectionLimit: 20,
    host: process.env.herokuSQLHost,
    port: process.env.herokuSQLPort,
    user: process.env.herokuSQLUser,
    password: process.env.herokuSQLPassword,
    database: process.env.CapstoneSQLDatabase,
    multipleStatements: true
});

/**
 * Retrives a connection from the pool, and puts 
 * the result of the query into a promise
 * @param { String } sql 
 * @param { Array } data 
 * @author Camille Cutrone
 */
const query = async (sql, data) => 
    new Promise((resolve, reject) => {
        pool.query(sql, data, (err, results) =>{
            if(err) reject(err);
            resolve(results);
        });
    });

export default {
    query
};