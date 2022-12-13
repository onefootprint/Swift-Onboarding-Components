import { Client } from 'pg';

type Params = {
  query: string;
};

export default async function ({ query }: Params) {
  // Connect using DATABASE_URL (which we'll set later)
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();

  // Run the UPDATE query
  const res = await client.query(query);

  // Close the database connection.
  await client.end();

  return res.rows;
}
