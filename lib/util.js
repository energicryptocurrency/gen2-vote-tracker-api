var RpcClient = require('@energicryptocurrency/energid-rpc');
const yaml = require('js-yaml');
const fs = require('fs');
var rpcConfig = {}
try {
    const config = yaml.safeLoad(fs.readFileSync('./config.yml', 'utf8'));
    const indentedJson = JSON.stringify(config, null, 4);

    energiRPC = config.energiRPC
    rpcConfig = {
    protocol: energiRPC.protocol,
    user: energiRPC.user,
    pass: energiRPC.pass,
    host: energiRPC.host,
    port: energiRPC.port,
    }
} catch (e) {
    console.log(e);
}

var rpc = new RpcClient(rpcConfig);

var txids = [];

// functions to be exported
module.exports = {
 getDifficulty: function() {
  rpc.getDifficulty(function(err, difficulty) {
  if (err) {
    return console.error(err);
  }
 
  console.log('Difficulty: ' + JSON.stringify(difficulty));
  return;
});
},
  //get masternode list
  getMasternodeList:  function(cb) {
  	return rpc.masternodelist('full', cb);
 }, 
   //get governance info
  getGovernanceInfo:  function(cb) {
  	return rpc.getGovernanceInfo(cb);
 },

  // get current block height
  getBlockCount:  function(cb) {
  	return rpc.getBlockCount(cb);
 },

  // get governance objects
  getGovernanceObjectList:  function(cb) {
  	return rpc.gobject('list', cb);
 }

}

