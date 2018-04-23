const redis = require("redis"),
    client = redis.createClient();
const energiUtil = require('../lib/util.js')
const moment = require('moment')
const prettySeconds = require('pretty-seconds');
const cron = require('node-cron');

const proposalKey = 'proposal'
const proposalTimeSet = 'proposal:time'
const masternodeKey = 'mn'
const masternodeSet = 'mn:set'

client.on("error", function (err) {
    console.error("Error " + err);
});

const superBlockCycle = energiUtil.getSuperBlockCycle()

function populateProposalList() {
    energiUtil.getGovernanceObjectList((err, list) => {
        if (err) {
            console.error(err);
        } 
        else if (list )
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
                        let num = (item[1].end_epoch - item[1].start_epoch) / superBlockCycle
                        g.push(item[1].name + ' ' + '(<a href="' + item[1].url + '">Details</a>)')
                        g.push(parseInt(item[1].payment_amount) * num)
                        g.push(num)
                        let d = new Date(item[1].start_epoch) * 1000
                        g.push(moment(d).utc().toString())
                        d = new Date(item[1].end_epoch) * 1000
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
                multi.hset(proposalKey + ':' + gobj['Hash'], 'list', g.toString(), redis.print)
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


function populateMasternodeList() {
    energiUtil.getMasternodeList((err, list) => {
        if (err) {
            console.error(err);
        }
        var multi = client.multi()
        var obj = list.result
        var active
        for (var key in obj) {
            mn = new Array();
            str = obj[key].toString().trim();
            str = str.split(/(\s+)/);
            let addr = ''
            //push ip first
            mn.push(str[str.length - 1])
            for (var i = 0; i < str.length - 1; i++) {
                if (str[i].trim().length > 0) {
                    // to forego the payee address
                    if (i === 4) {
                        continue
                    }

                    // to change active seconds to readable duration 
                    else if (i === 8) {
                        active = str[i]
                        mn.push(prettySeconds(parseInt(str[i])).replace(/\s/g, '').replace(/days/g, 'd').replace(/seconds/g, 's')
                            .replace(/minutes/g, 'm').replace(/hours/g, 'h').replace(/weeks/g, 'w').replace(/,|and/g, ':'))
                        continue
                    }
                    // to change epoch to date format
                    else if (!isNaN(str[i]) && (n = parseInt(str[i])) && n > 1483228800) {
                        let d = new Date(n) * 1000
                        mn.push(moment(d).utc().toString());
                        continue
                    }
                    mn.push(str[i]);
                }
            }
            multi.hset(masternodeKey + ':' + key, 'list', mn.toString(), redis.print)
            multi.zadd(masternodeSet, active, masternodeKey + ':' + key, redis.print)
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

// scheduled job for updating data in redis
cron.schedule('*/2 * * * *', function () {
    populateProposalList()
    populateMasternodeList()
});


