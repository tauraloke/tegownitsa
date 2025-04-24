// Only NodeJS-Side.
import { spawn } from 'child_process';
import * as path from 'path';

let pythonProcess = null;

/**
 * Singleton for python process.
 * @returns {ChildProcessWithoutNullStreams}
 */
export function getPythonProcess() {
  if (pythonProcess !== null) return pythonProcess;
  const pythonScriptPath = path.join(
    __dirname,
    '..',
    'libs',
    'wd_tagger',
    'server.py'
  );
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
