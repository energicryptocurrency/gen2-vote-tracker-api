
var redis = require("redis"),
    client = redis.createClient();

function MHGETALL(keys, cb) {
    var multi = client.multi()
    keys.forEach(function (key, index) {
        multi.hget(key, 'list');
    });

    multi.exec(function (err, result) {
        cb(err, result);
    });
}

module.exports = {
    getProposalList: function (callback) {
        var govArray = new Array();
        var multi = client.multi()
        client.zrevrange('proposal:time', 0, -1, (err, list) => {
            MHGETALL(list, (err, result) => {
                for (var i in result) {
                    let str = result[i].split(',')
                    govArray.push(str)
                }
                callback(govArray)
            })
        })
    },
    mnList: function (callback) {
        var mnArray = new Array();
        var tmpArray = new Array();
        client.lrange('masternode', 0, -1, (err, list) => {
            for (var i in list) {
                (function (i) {
                    if (i % 8 == 0 && i != 0) {
                        mnArray.push(tmpArray)
                        tmpArray = new Array()
                    }
                    tmpArray.push(list[i])
                })(i);
            }
            callback(mnArray)
        })

    }
}
