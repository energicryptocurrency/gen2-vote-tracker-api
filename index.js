var express = require('express');
var util = require('./lib/util');

var app = express();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/diff', function(req, res) {
    x = util.getDifficulty();
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(x);
});

app.get('/mn/list', async function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    await util.getMasternodeList((err, list) => {
        if (err) {
            console.error(err);
            res.status(500).send({
                err: err
            })
            return
        }
        var mnArray = new Array();
        var obj = list.result
        console.log('RESULT:' + obj);
        for (var key in obj) {
            str = obj[key].toString().trim();
            str = str.split(/(\s+)/);
            mn = new Array();
            for (var i = 0; i < str.length; i++) {
                if (str[i].trim().length > 0) {
                    mn.push(str[i]);
                }
            }
            mnArray.push(mn);
        }

        var data = {
            data: mnArray,
            error: null
        }
        res.status(200).send(data);
        return;

    });

});

app.get('/gov/list', async function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    await util.getGovernanceObjectList((err, list) => {
        if (err) {
            console.error(err);
            res.status(500).send({
                err: err
            })
            return
        }
        var govArray = new Array();
        var obj = list.result
        for (var key in obj) {
            gobj = obj[key];
            g = new Array();
            g.push(gobj['Hash']);
            g.push(gobj['CreationTime']);
            g.push(gobj['SigningMasternode']);
            g.push(gobj['AbsoluteYesCount']);
            g.push(gobj['YesCount']);
            g.push(gobj['NoCount']);
            g.push(gobj['AbstainCount']);

            govArray.push(g);
        }

        var data = {
            data: govArray,
            error: null
        }
        res.status(200).send(data);
        return;

    });

});

app.get('/gov/info', async function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    await util.getGovernanceInfo((err, info) => {
        if (err) {
            console.error(err);
            res.status(500).send({
                err: err
            })
            return
        }
        res.status(200).send(info);
        return;

    });

});

app.get('/block/count', async function(req, res) {
    res.setHeader('Content-Type', 'application/json');
    await util.getBlockCount((err, count) => {
        if (err) {
            console.error(err);
            res.status(500).send({
                err: err
            })
            return
        }
        res.status(200).send(count);
        return;

    });

});

app.listen(3000, function() {
    console.log('energi-rpc api listening on port 3000!');
});