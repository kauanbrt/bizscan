const fs = require('fs');
const path = require('path');

const LOG_FILE = path.join(__dirname, '../../logs/app.log');

function logEvent(type, message, metadata = {}) {
  const line = JSON.stringify({
    timestamp: new Date().toISOString(),
    type,
    message,
    metadata,
  }) + '\n';

  fs.mkdir(path.dirname(LOG_FILE), { recursive: true }, (err) => {
    if (err) {
      console.error('Erro ao criar diretório de logs:', err);
      return;
    }
    fs.appendFile(LOG_FILE, line, (err2) => {
      if (err2) {
        console.error('Erro ao escrever log:', err2);
      }
    });
  });
}

module.exports = {
  logEvent,
};
