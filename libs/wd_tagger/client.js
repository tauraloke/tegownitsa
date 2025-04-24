const { spawn } = require('child_process');

let pythonProcess = null;
function getPythonProcess() {
  if (pythonProcess !== null) return pythonProcess;
  pythonProcess = spawn('python', ['server.py'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });
  return pythonProcess;
}
// Отправка запроса в Python и ожидание ответа
async function handleMessage(message) {
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

(async () => {
  try {
    let res = await handleMessage({ action: 'ping' });
    console.log('Result from python', res);
    res = await handleMessage({ action: 'ping' });
    console.log(111);
    console.log('Result from python', res);
    console.log(222);
    console.log(
      'Result from python',
      await handleMessage({
        action: 'wd_predict_tags',
        params: {
          filepath:
            'D:/projects/tegownitsa/node_modules/electron/dist/storage/7/1/1745316032136.png',
          general_threshold: 0.3,
          character_threshold: 0.8
        }
      })
    );
    console.log(333);
    //while (true) {}
  } catch (error) {
    console.error('Error during ping:', error);
    throw error; // Перебрасываем ошибку клиенту
  }
})();
