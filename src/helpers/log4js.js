const log4js = require('log4js');

log4js.configure({
    appenders: {
        fileAppender: {
            type: 'file',
            filename: './src/logs/errorLogs.log'
        }
    },
    categories: {
        default: {
            appenders: ['fileAppender'],
            level: 'error'
        }
    }
});

const logger = log4js.getLogger();

const opusLog = (message, type) => {
    switch (type) {
        case 'error':
            logger.error(message);
            break;
        case 'trace':
            logger.trace(message);
            break;
        case 'debug':
            logger.debug(message);
            break;
        case 'info':
            logger.info(message);
            break;
        case 'warn':
            logger.warn(message);
            break;
        case 'fatal':
            logger.fatal(message);
        default:
            logger.error('[Unknown]: ' + message);
            break;
    }
}

module.exports = {
    opusLog
}