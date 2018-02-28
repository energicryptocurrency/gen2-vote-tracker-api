const redis = require("redis"),
    client = redis.createClient();
const energiUtil = require('../lib/util.js')
const moment = require('moment')

const proposalKey = 'proposal'
const masternodeKey = 'masternode' 
const proposalTimeSet = 'proposal:time'

client.on("error", function (err) {
    console.error("Error " + err);
});

var superBlockCycle = energiUtil.getSuperBlockCycle()

function populateProposalList() {
    energiUtil.getGovernanceObjectList((err, list) => {
        if (err) {
            console.error(err);
        }
        // var govArray = new Array();
        var multi = client.multi()
        var obj = list.result
        for (var key in obj) {
            isProposal = false
            gobj = obj[key];
            g = new Array();
            data = gobj['DataString'];
            json = JSON.parse(data);
            for (var i in json) {
                (function (i) {
                    item = json[i];
                    if (item[0] == 'proposal') {
                        isProposal = true;
                        g.push(item[1].name + ' ' + '(<a href="' + item[1].url + '">Details</a>)')
                        g.push(item[1].payment_amount)
                        g.push((item[1].end_epoch - item[1].start_epoch) / superBlockCycle)
                        let d = new Date(item[1].start_epoch)*1000
                        g.push(moment(d).utc().toString())
                        d = new Date(item[1].end_epoch)*1000
                        g.push(moment(d).utc().toString())
                    } else
                        return
                })(i);
            }

            if (isProposal) {
                g.push(gobj['YesCount'])
                g.push(gobj['NoCount'])
                g.push(gobj['AbstainCount'])
                g.push(gobj['Hash'])
                multi.hset('proposal:' + gobj['Hash'], 'list', g.toString(), redis.print)
                multi.zadd(proposalTimeSet, item[1].start_epoch, 'proposal:' + gobj['Hash'], redis.print)
            } else
                continue;
        }
        multi.exec(function (errors, results) {
            if (errors) {
                console.error(errors)
                throw errors
            }
            // console.log(results)
        })
    });
}


function mnList() {
    energiUtil.getMasternodeList((err, list) => {
        if (err) {
            console.error(err);
        }
        client.del(masternodeKey, (err, n) => {
            var multi = client.multi()
            var obj = list.result
            for (var key in obj) {
                str = obj[key].toString().trim();
                str = str.split(/(\s+)/);
                mn = new Array();
                let addr = ''
                multi.rpush(masternodeKey, str[str.length - 1])
                for (var i = 0; i < str.length - 1; i++) {
                    if (str[i].trim().length > 0) {
                        // to forego the payee address
                        if (str[i].toString().startsWith('t')) {
                            continue
                        }
                        // to change epoch to date format
                        let n = parseInt(str[i].toString())
                        if (!isNaN(str[i]) && n > 1483228800) {
                            let d = new Date(n)*1000
                            multi.rpush(masternodeKey, moment(d).utc().toString());
                            continue
                        }
                        multi.rpush(masternodeKey, str[i]);
                    }
                }
                multi.rpush(masternodeKey, str[str.length - 1])
                multi.exec(function (errors, results) {
                    if (errors) {
                        console.error(errors)
                        throw errors
                    }
                    // console.log(results)
                })
            }
        })

    });
}

populateProposalList()
mnList()

