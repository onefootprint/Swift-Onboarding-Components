import airplane from 'airplane';
import { Client } from 'pg';

export default airplane.task(
  {
    slug: 'lookup_id',
    name: 'Lookup ID',
    parameters: {
      id: {
        name: 'Lookup a Footprint ID',
        required: true,
        default: 'org_abcd',
        type: 'shorttext',
        description: 'Extract all relevant info on id',
      },
    },
    envVars: {
      DATABASE_URL: { config: 'DATABASE_URL' },
    },
  },
  async params => {
    const dbUrl = process.env.DATABASE_URL;
    const id = params.id;

    const components = id.split('_');
    if (components.length < 2) {
      return ['invalid identifier'];
    }

    const prefix = components.slice(0, components.length - 1).join('_');
    let query: string;
    console.log('got prefix: ', prefix);

    switch (prefix) {
      case 'ob':
        query = `
        SELECT * from onboarding
        INNER JOIN scoped_user on scoped_user.id=onboarding.scoped_user_id
        INNER JOIN tenant on tenant.id=scoped_user.tenant_id
        WHERE onboarding.id='${id}';`;
        break;
      case 'su':
        query = `
        SELECT * from scoped_user
        INNER JOIN onboarding on onboarding.scoped_user_id=scoped_user.id
        INNER JOIN tenant on tenant.id=scoped_user.tenant_id
        WHERE scoped_user.id='${id}';`;
        break;
      case 'org':
        query = `SELECT * from tenant WHERE id='${id}';`;
        break;
      case 'fp_id':
        query = `
        SELECT * from scoped_user
        INNER JOIN onboarding on onboarding.scoped_user_id=scoped_user.id
        INNER JOIN tenant on tenant.id=scoped_user.tenant_id
        WHERE scoped_user.fp_user_id='${id}';`;
        break;
      default:
        return ['unsupported id prefix'];
    }

    const client = new Client({
      connectionString: dbUrl,
    });
    await client.connect();

    // Run the UPDATE query
    const res = await client.query(query);

    // Close the database connection.
    await client.end();

    return res.rows;
  },
);
