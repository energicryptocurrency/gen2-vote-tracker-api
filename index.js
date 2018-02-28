const express = require('express')
const util = require('./lib/util')
const redis = require('./lib/redis')


var app = express();

var superBlockCycle;

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/gov/list', async function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    await redis.getProposalList((list) => {
        var data = {
            data: list,
            draw: list.length,
            recordsTotal: list.length,
            recordsFiltered: list.length
        }
        res.status(200).send(data);
    })
});

app.get('/gov/info', async function (req, res) {
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

app.get('/diff', function (req, res) {
    x = util.getDifficulty();
    res.setHeader('Content-Type', 'application/json');
    res.status(200).send(x);
});

app.get('/mn/list', async function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    await redis.mnList((list) => {
        var data = {
            data: list,
            draw: list.length,
            recordsTotal: list.length,
            recordsFiltered: list.length
        }
        res.status(200).send(data);
    })

});

app.get('/block/count', async function (req, res) {
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

app.listen(3000, function () {
    console.log('energi-rpc api listening on port 3000!');
    superBlockCycle = util.getSuperBlockCycle()
});

