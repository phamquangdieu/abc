const winstonConfig = require('./config');

const winston = require('winston');

var user1 = 'user123456';
var user2 = 'abc';
var user3 = 'HelloWorld'
var action = ['deposit','transfer','create'];
var cointype = ['bitcoin','ethereum','ripple'];

loggerTransferRipple = winston.loggers.get('TRANSFER');
loggerTransferRipple.log('info','transfer ripple', {action: action[1], cointype: cointype[2], user1: user1, user2:user2, amount: 3000});


loggerCreateBitcoin = winston.loggers.get('CREATE');
loggerCreateBitcoin.log('info','Tao user!!',{action: action[2],cointype:cointype[0], user: user3, amount: 1500});


loggerDepositEthereum = winston.loggers.get('DEPOSIT');
loggerDepositEthereum.log('error','ERROR DEPOSIT',{action: action[0], cointype: cointype[1],amount: 1440});

user1 = '123456user';
loggerTransferRipple.log('info','transfer ripple', {action: action[1], cointype: cointype[2], user1: user1, user2:user2, amount: 3111});

