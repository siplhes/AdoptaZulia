const { createRequire } = require('module');
const require = createRequire(import.meta.url);
try {
  require('firebase/database');
  console.log('import ok');
} catch (err) {
  console.error('import failed');
  console.error(err && err.stack ? err.stack : err);
}
