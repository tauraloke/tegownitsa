module.exports = {
  run: async (_event, db, query, values) => {
    return await db.query(query, values);
  }
};
