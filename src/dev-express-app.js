const expressApp = require('./express-app.js');
const path = require('node:path');

expressApp(path.join(__dirname, "../config"));