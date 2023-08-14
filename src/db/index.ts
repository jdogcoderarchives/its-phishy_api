import { Pool } from 'pg';

const pool = new Pool({
	database: process.env.POSTGRES_DB || 'itsphishy-api',
	user: process.env.POSTGRES_USER || 'default_host',
	host: process.env.DATABASE_URL || 'localhost',
	password: process.env.POSTGRES_PASSWORD || 'supersecurepassword',
	port: Number(process.env.POSTGRES_PORT || 5432),
});

export const query = (text: any, params: any) => pool.query(text, params);
