export async function run(_event, db, query, values) {
  return await db.query(query, values);
}
