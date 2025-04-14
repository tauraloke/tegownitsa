const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Путь к файлу latest.yml
const latestYmlPath = path.join(__dirname, '../../dist_electron', 'latest.yml');

// Чтение файла latest.yml
const latestYmlContent = fs.readFileSync(latestYmlPath, 'utf8');
const latestYml = yaml.load(latestYmlContent);

// Добавление minVersion
latestYml.minVersion = '2.0.0-alpha';

// Запись изменений в файл latest.yml
fs.writeFileSync(latestYmlPath, yaml.dump(latestYml), 'utf8');

console.log('minVersion успешно добавлен в latest.yml');
