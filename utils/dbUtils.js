// Утилиты для работы с базой данных
const dbUtils = {
    run: (query, params = []) => new Promise((resolve, reject) => {
      global.db.run(query, params, function(err) {
        if (err) reject(err);
        else resolve(this);
      });
    }),
    get: (query, params = []) => new Promise((resolve, reject) => {
      global.db.get(query, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    }),
    all: (query, params = []) => new Promise((resolve, reject) => {
      global.db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    })
  };
  
  module.exports = dbUtils;