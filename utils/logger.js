import fs from 'fs';
import path from 'path';

const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logPath = path.join(logsDir, 'error.log');

export function logError(err) {
  const timestamp = new Date().toISOString();
  const msg = `[${timestamp}] ${err.stack || err}\n`;
  console.error(msg);
  fs.appendFile(logPath, msg, (e) => {
    if (e) console.error('❌ Failed to write log:', e);
  });
}
