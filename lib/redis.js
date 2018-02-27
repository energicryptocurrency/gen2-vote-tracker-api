
var redis = require("redis"),
    client = redis.createClient();

module.exports = {
    getProposalList: function (callback) {
        var govArray = new Array();
        var tmpArray = new Array();
        client.lrange('proposal', 0, -1, (err, list) => {
            for (var i in list) {
                (function (i) {
                    if (i % 9 == 0 && i != 0) {
                        govArray.push(tmpArray)
                        tmpArray = new Array()
                    }
                    tmpArray.push(list[i])
                })(i);
            }
            callback(govArray)
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
