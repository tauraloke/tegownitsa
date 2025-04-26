// Only NodeJS-Side.
import { spawn } from 'child_process';
import * as path from 'path';
import { existsSync } from 'fs';

let pythonProcess = null;

/**
 * Looking for python script.
 * @returns {string}
 */
function findPythonPath() {
  const canditates = [
    path.join(__dirname, 'libs', 'wd_tagger', 'server.py'),
    path.join(__dirname, '..', 'libs', 'wd_tagger', 'server.py'),
    path.join(__dirname, '..', '..', 'libs', 'wd_tagger', 'server.py')
  ];
  for (const i in canditates) {
    console.log('Looking for python ai-detection server in ', canditates[i]);
    if (existsSync(canditates[i])) {
      return canditates[i];
    }
  }
  throw new Error('Cannot find path to python ai-detection server script!');
}

/**
 * Singleton for python process.
 * @returns {ChildProcessWithoutNullStreams}
 */
export function getPythonProcess() {
  if (pythonProcess !== null) return pythonProcess;
  const pythonScriptPath = findPythonPath();
  pythonProcess = spawn('python', [pythonScriptPath], {
    stdio: ['pipe', 'pipe', 'pipe']
  });
  pythonProcess.stdin.setEncoding('utf-8');
  pythonProcess.stdout.setEncoding('utf-8');
  return pythonProcess;
}

export function quitPython() {
  console.log('Kill background python process');
  if (pythonProcess) {
    pythonProcess.kill();
  }
}

// Отправка запроса в Python и ожидание ответа
export async function handlePythonMessage(message) {
  return new Promise((resolve) => {
    // Отправляем данные в Python
    getPythonProcess().stdin.write(JSON.stringify(message) + '\n');

    // Ждём ответа из stdout
    const listener = (chunk) => {
      const responseStr = chunk.toString().trim();
      if (!responseStr) return; // Игнорируем пустые строки

      getPythonProcess().stdout.off('data', listener); // Удаляем обработчик
      resolve(JSON.parse(responseStr));
    };

    getPythonProcess().stdout.on('data', listener);
  });
}
