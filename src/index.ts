// tslint:disable:no-var-requires
require = require('esm')(module);
module.exports = require(`./main.${
  process.env.NODE_ENV === 'production' ? 'js' : 'ts'
}`);
// tslint:enable:no-var-requires
