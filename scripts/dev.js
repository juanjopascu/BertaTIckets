const { spawn } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

const processes = [
  {
    name: 'CRM Backend (:3001)',
    command: 'node',
    args: ['server.js'],
    cwd: path.join(rootDir, 'backend'),
    prefix: '\x1b[34m[CRM-API]\x1b[0m'
  },
  {
    name: 'CRM Frontend (:5173)',
    command: 'npm',
    args: ['run', 'dev'],
    cwd: path.join(rootDir, 'frontend'),
    prefix: '\x1b[36m[CRM-WEB]\x1b[0m'
  }
];

console.log('\x1b[1m🎫 Iniciando DACAS CRM & Mesa de Ayuda...\x1b[0m\n');

const running = [];

processes.forEach(proc => {
  const child = spawn(proc.command, proc.args, {
    cwd: proc.cwd,
    stdio: 'pipe',
    shell: true,
    env: { ...process.env, FORCE_COLOR: '1' }
  });

  child.stdout.on('data', data => process.stdout.write(`${proc.prefix} ${data.toString()}`));
  child.stderr.on('data', data => process.stderr.write(`${proc.prefix} ${data.toString()}`));
  running.push(child);
});

function cleanup() {
  console.log('\n🛑 Deteniendo BertaTickets...');
  running.forEach(c => {
    try { c.kill(); } catch (_) {}
  });
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
