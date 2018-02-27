const redis = require("redis"),
    client = redis.createClient();
const energiUtil = require('../lib/util.js')
const moment = require('moment')

const proposalKey = 'proposal'
const masternodeKey = 'masternode' 

client.on("error", function (err) {
    console.error("Error " + err);
});

var superBlockCycle = energiUtil.getSuperBlockCycle()

// client.hset(["hash key", "hashtest 2", "some other value"], redis.print);

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
                        multi.rpush(proposalKey, item[1].name + ' ' + '(<a href="' + item[1].url + '">Details</a>)')
                        multi.rpush(proposalKey, item[1].payment_amount)
                        multi.rpush(proposalKey, (item[1].end_epoch - item[1].start_epoch) / superBlockCycle)
                        let d = new Date(item[1].start_epoch)*1000
                        multi.rpush(proposalKey, moment(d).utc());
                        console.log(moment(d).utc())
                        d = new Date(item[1].end_epoch)*1000
                        multi.rpush(proposalKey, moment(d).utc());
                    } else
                        return
                })(i);
            }

            if (isProposal) {
                multi.rpush(proposalKey, gobj['YesCount']);
                multi.rpush(proposalKey, gobj['NoCount']);
                multi.rpush(proposalKey, gobj['AbstainCount']);
                multi.rpush(proposalKey, gobj['Hash']);
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
        var multi = client.multi()
        var obj = list.result
        for (var key in obj) {
            str = obj[key].toString().trim();
            str = str.split(/(\s+)/);
            mn = new Array();
            for (var i = 0; i < str.length; i++) {
                if (str[i].trim().length > 0) {
                    multi.rpush(masternodeKey, str[i]);
                }
            }
            multi.exec(function (errors, results) {
                if (errors) {
                    console.error(errors)
                    throw errors
                }
                // console.log(results)
            })
        }
    });
}

populateProposalList()
// mnList()