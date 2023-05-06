/* istanbul ignore file */

import postgres from "postgres";

function getDatabaseUrl(): string {
	return process.env.DATABASE_URL;
}

const sql = postgres(getDatabaseUrl(), {
	idle_timeout: 20,
	max_lifetime: 60 * 30,
});

export default sql;
