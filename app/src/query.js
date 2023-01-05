import db from '@mysql/xdevapi';

const CONFIG = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  schema: process.env.DB_SCHEMA,
};

try {
  let session = await db.getSession(CONFIG);
  let res = await session.sql('show tables').execute();
  console.log(res);
} catch (e) {
  console.error(e);
}

process.exit();