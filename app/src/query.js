import db from '@mysql/xdevapi';

const CONFIG = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  host: process.env.DB_HOST,
  schema: process.env.DB_SCHEMA,
  port: +process.env.DB_PORT || 33060
};

console.log(CONFIG)
export async function testQuery() {
  try {
    let session = await db.getSession(CONFIG);
    let res = (await session
      .sql('select * from t1')
      .execute());
    session.close();
    return res;
  } catch (e) {
    console.error(e);
  }
}

export async function clean_insert(query, usesKeyConstraints = false) {
  if (query.length < `insert into `.length) {
    return;
  }

  let table = query
    .substring(`insert into `.length, query.indexOf('('))
    .trimEnd();

  try {
    let session = await db.getSession(CONFIG);
    await session
      .sql(usesKeyConstraints ? `delete from ${table}` : `truncate ${table}`)
      .execute();
    await session.sql(query).execute();
    session.close();
  } catch (e) {
    console.error(e);
  }
}