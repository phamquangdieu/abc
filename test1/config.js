const winston = require('winston');

const transfer = 'TRANSFER';

function createLoggerConfig(){
    return {
        level: 'info',
        transports: [
            new winston.transports.Console({
                timestamp: true,
            }),
            new winston.transports.File({
            	filename: 'app.log'
            })
      	],
        format: winston.format.combine(
             winston.format.timestamp(),
             winston.format.printf((info) => {
                if(arguments[0]=='TRANSFER'){
                    return `${info.timestamp}:[${info.level}]:${info.action}:${info.cointype}:${info.user1}:${info.user2}:${info.amount}:${info.message}`;
                }
                else if(arguments[0]=='CREATE'){
                    return `${info.timestamp}:[${info.level}]:${info.action}:${info.cointype}:${info.user}:${info.amount}:${info.message}`;
                }
                else if(arguments[0]=='DEPOSIT'){
                    return `${info.timestamp}:[${info.level}]:${info.action}:${info.cointype}:${info.amount}:${info.message}`;
                }
            })
        )
    };
}

winston.loggers.add(transfer, createLoggerConfig(transfer));
winston.loggers.add('CREATE', createLoggerConfig('CREATE'));
winston.loggers.add('DEPOSIT', createLoggerConfig('DEPOSIT'));

module.exports.createLoggerConfig = createLoggerConfig;