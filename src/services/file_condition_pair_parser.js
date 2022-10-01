const systemParsers = {
  without_tags: () => {
    return `files.id IN (
      SELECT files.id
      FROM files
      LEFT JOIN file_tags ON file_tags.file_id=files.id
      WHERE file_tags.id IS NULL
      GROUP BY files.id
      )`;
  }
};

/** @type {Object<string, function(string):string>} */
export default {
  fresh: (value) => {
    value = parseInt(value);
    if (!value) {
      return null;
    }
    return `files.created_at > DATETIME('NOW', '-${value} minutes')`;
  },
  in_reco: (value) => {
    return `files.caption LIKE "%${value}%`;
  },
  in_filename: (value) => {
    return `files.source_filename LIKE "%${value}%`;
  },
  in_url: (value) => {
    return `files.id IN (SELECT file_urls.file_id FROM file_urls WHERE url LIKE "%${value}%")`;
  },
  in_title: (value) => {
    return `files.id IN (SELECT file_urls.file_id FROM file_urls WHERE title LIKE "%${value}%")`;
  },
  system: (value) => {
    return systemParsers[value]();
  }
};
