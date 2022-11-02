require("dotenv").config();

const DB_PORT = process.env.DB_PORT || 3000,
  DB_DATABASE = process.env.DB_DATABASE || 'data_bot',
  DB_USER = process.env.DB_USER || 'root',
  DB_PASSWORD = process.env.DB_PASSWORD || '0906gean',
  DB_HOST = process.env.INSTANCE_HOST || 'localhost',
  DB_DIALECT = process.env.DB_DIALECT || 'mysql',
  PORT = process.env.PORT || 3000;

  module.exports = {
    PORT, 
    DB_PORT,
    DB_DATABASE,
    DB_USER,
    DB_PASSWORD,
    DB_HOST,
    DB_DIALECT
  };
