import mysql from "mysql";

const pool = mysql.createPool({
    connectionLimit: 20,
    host: process.env.herokuSQLHost,
    port: process.env.herokuSQLPort,
    user: process.env.herokuSQLUser,
    password: process.env.herokuSQLPassword,
    database: process.env.CapstoneSQLDatabase,
    multipleStatements: true
});

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