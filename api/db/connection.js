import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: "localhost",
  user: "sawa",
	password: "",
  database: "todo",
});
