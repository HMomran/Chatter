const { spawn } = require('node:child_process');
const children = ['backend', 'frontend'].map(folder => spawn('npm', ['start'], { cwd: folder, stdio: 'inherit', shell: process.platform === 'win32' }));
function stop(code = 0) { children.forEach(child => child.kill('SIGTERM')); process.exit(code); }
children.forEach(child => child.on('exit', code => stop(code || 0)));
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
