# 1. Winston
## Install
```js
  npm install winston
```
## Config.js
### Khai báo:
```js
const winston = require('winston');
```
### Hàm cấu hình cho log createLoggerConfig()
```js
function createLoggerConfig(){
    return {
        level: 'info',
        transports: [
            new winston.transports.Console(),
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
            })
        )
    };
}
```
Giải thích:
- Level : trả về log khi level log truyền vào có giá trị nhỏ hơn hoặc bằng giá trị khai báo. Các level log được `npm` ưu tiên từ thấp tới cao:
``` js
{ 
  error: 0, 
  warn: 1, 
  info: 2, 
  verbose: 3, 
  debug: 4, 
  silly: 5 
}
```
- Transport
    Hiển thi đầu ra của log Console và file `app.log`
```js
    new winston.transports.Console(),
    new winston.transports.File({
        filename: 'app.log'
    })
```
- Format
  - Định dạng đầu ra của log
Thêm thời gian:
```js
    winston.format.timsestamp()
```
Dựa vào param action mà hàm trả về định dạng log khác nhau, định dạng này cần phù hợp với các params truyền vào từ hàm .log() được sử dụng trong file `app.js`
Ví dụ:
```js
 winston.format.printf((info) => {
                if(arguments[0]=='TRANSFER'){
                    return `${info.timestamp}:[${info.level}]:${info.action}:${info.cointype}:${info.user1}:${info.user2}:${info.amount}:${info.message}`;
                }
}
```
Nếu action là transfer thì log có dạng
`
timestamp:levelLog:transfer:cointype:user1:user2:amount:message
`
### Định nghĩa log mới
```js
winston.loggers.add(Log, createLoggerConfig(Log));
//Log là tên log mới định nghĩa
```
### Export
```js
module.exports.createLoggerConfig = createLoggerConfig;
```
## App.js
### Include module
```js
    const winstonConfig = require('./config');
    const winston = require('winston');
```
### Gọi log đã định nghĩa 
```js
    loggerTransferRipple = winston.loggers.get('Log');
    //Log là tên log mới định nghĩa
```
### sử dụng
Ví dụ:
```js
loggerTransferRipple.log('info','transfer ripple', {action: 'transfer', cointype:'ripple', user1:'123', user2:'abc', amount: 3000});
```
Note: Các tham số truyền vào theo mẫu nhất định để có thể cấu hình log phù hợp
# 2. Logstash - Elasticsearch - Kibana
## Cài đặt trên ubuntu
Note: Logstash yêu cầu Java 8 hoặc Java 11
Kiểm tra version java:
> java -version
* Tải và cài đặt Public Signing Key:
>  wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
* Bạn có thể cần cài đặt gói `apt-transport-https`
> sudo apt-get install apt-transport-https
* Lưu định nghĩa kho lưu trữ `/etc/apt/sources.list.d/elastic-7.x.list`
> echo "deb https://artifacts.elastic.co/packages/7.x/apt stable main" | sudo tee -a /etc/apt/sources.list.d/elastic-7.x.list
* Cài đặt
> sudo apt-get update && sudo apt-get install logstash
## File cấu hình
Định dạng .conf được đặt trong `/etc/logstah/config.d`
### Input
```
input {
	file{
		path => "/home/phamquang/log/test1/app.log"
		start_position => "beginning"
		sincedb_path =>"/dev/null"	
	}
}
```

path : đường dẫn file log cần đọc
start_position: giá trị là` beginning` hoặc `end`. Lựa chọn vị trí Logstash bắt đầu đọc file
sincedb_path: giá trị `/dev/null`
### Filter
Sử dụng grok để lọc log thành các trường đã định dạng từ trước
```
grok {
    	match => { "message" => "%{TIMESTAMP_ISO8601:time}:\[%{WORD:leveLog}\]:%{WORD:action}:%{GREEDYDATA:detail}"}
  	}
    if [action] == "transfer" {
      grok {
          match => { "detail" => "%{WORD:coin}:%{WORD:user}:%{WORD:user}:%{INT:amount}:%{GREEDYDATA:actionMessage}"
        }
      }
    }
}
```
Ví dụ với đầu vào là: 
>2019-04-22T15:31:00.164Z:[info]:transfer:ripple:user123456:abc:3000:transfer ripple

Sau khi filter sẽ được kết quả:
 * time: 2019-04-22T15:31:00.164Z
 * levelLog: info
 * action: transfer
 * cointype: ripple
 * user: user123456, abc
 * amount: 3000
 * messageAction: transfer ripple

Tham khảo thêm grok pattern tại: https://github.com/logstash-plugins/logstash-patterns-core/blob/master/patterns/grok-patterns

### Output
```
output{
	elasticsearch { hosts => "localhost" } //Kết nối tới ElasticSearch
	stdout{ codec => rubydebug } //Hiển thị ra console
}
```
## Sử dụng Logstash
>/bin/logstash -f /etc/logstash/config.d/log.conf 

Nếu xảy ra lỗi có thể thêm `--path.settings /etc/logstash` sau command
Note: Vị trí thư mục /bin có thể thay đổi theo nền tảng. Tham khảo vị trí tại: [Directory Layout](https://www.elastic.co/guide/en/logstash/7.0/dir-layout.html)
## Cài đặt và khởi động ElasticSearch và Kibana
### ElasticSearch
* Tải xuống ElasticSearch 7.0.0 cho Linux
> curl -L -O https://artifacts.elastic.co/downloads/elasticsearch/elasticsearch-7.0.0-linux-x86_64.tar.gz
* Extract
> tar -xvf elasticsearch-7.0.0-linux-x86_64.tar.gz
* Chuyển tới thư mục bin
> cd elasticsearch-7.0.0/bin
* Start
> ./elasticsearch
### Kibana
* Tải và cài đặt Public Signing Key:
>wget -qO - https://artifacts.elastic.co/GPG-KEY-elasticsearch | sudo apt-key add -
* Có thể cần cài đặt gói apt-transport-https
> sudo apt-get install apt-transport-https
* Lưu định nghĩa kho lưu trữ
> echo "deb https://artifacts.elastic.co/packages/7.x/apt stable main" | sudo tee -a /etc/apt/sources.list.d/elastic-7.x.list
 
Sử dụng `update-rc.d` để cấu hình Kibana tự động khởi động cùng hệ thống
```
sudo update-rc.d kibana defaults 95 10
```
Khởi động và dừng Kibana bằng lệnh `service`
```
sudo -i service kibana start
sudo -i service kibana stop
```
Note: Kibana mặc định hoạt động ở cổng 5601 http://localhost:5601

