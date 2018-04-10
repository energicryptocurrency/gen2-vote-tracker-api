# Energi Vote Tracker API

These are the APIs that the Vote Tracker front-end consumes.

## Requirements
* node (>=9.4.0)
* redis
* energid (with RPC enabled)

## Install
* Get latest code from github:
```shell
git clone https://github.com/energicryptocurrency/vote-tracker-api.git
```

* Inside the cloned folder, run `npm install` to install all dependencies

* Change the configuration file according to your network settings (Energi network type and RPC credentials)

* Energi daemon should be running with RPC enabled

* Make sure redis is running, and it would be a good idea to activate persistence, though not strictly required. See details [here](https://redis.io/topics/persistence)

* Run `node cron/job.js` via screen, to update data for proposals and for masternode full list