# mongodb性能测试

## 测试可以创建多个collection，以及性能的变化情况

* 1000个用户，每个用户10个表（A、B、C、D、
    * 表大小：100、1000、10000、100000、
    * 每条记录10个字段:F1、F2、。。F10
    * 每个表索引:2个，
    * 统计insert性能
    * 统计count的性能：
    * 统计查询一条记录的性能：日期索引、字符串索引、无索引、模糊查询

## 执行命令

```
npm install 
node mongodb_performance.js |tee mongodb_performance.log
```