
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
    getProposalList: function (start, length, callback) {
        var govArray = new Array();
        var multi = client.multi()
        client.zcard('proposal:time', (err, card) => {
            client.zrevrange('proposal:time', start, start + length - 1, (err, list) => {
                MHGETALL(list, (err, result) => {
                    for (var i in result) {
                        let str = result[i].split(',')
                        govArray.push(str)
                    }
                    callback(card, govArray)
                })
            })
        })
    },
    getMasternodeList: function (start, length, callback) {
        var mn = new Array();
        var multi = client.multi()
        var begin = start * length
        client.zcard('mn:set', (err, card) => {
            client.zrevrange('mn:set', start, start + length - 1, (err, list) => {
                MHGETALL(list, (err, result) => {
                    for (var i in result) {
                        let str = result[i].split(',')
                        mn.push(str)
                    }
                    callback(card, mn)
                })
            })
        })
    }
}
