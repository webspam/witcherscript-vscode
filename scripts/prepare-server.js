const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const extensionRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(extensionRoot, '..');
const parserRoot = path.join(repoRoot, 'parser');
const executable = process.platform === 'win32' ? 'witcherscript-lsp.exe' : 'witcherscript-lsp';
const builtServer = path.join(parserRoot, 'target', 'release', executable);
const bundledServerDir = path.join(extensionRoot, 'server');
const bundledServer = path.join(bundledServerDir, executable);

execFileSync('cargo', ['build', '--release', '--bin', 'witcherscript-lsp'], {
  cwd: parserRoot,
  stdio: 'inherit'
});

fs.mkdirSync(bundledServerDir, { recursive: true });
fs.copyFileSync(builtServer, bundledServer);

if (process.platform !== 'win32') {
  fs.chmodSync(bundledServer, 0o755);
}

console.log(`Bundled ${bundledServer}`);
