# Energi Vote Tracker API

These are the APIs that the Vote Tracker front-end consumes.

## Requirements
* node
* redis
* energid (with RPC enabled)

## Install
* Get latest code from github:
```shell
git clone https://github.com/energicryptocurrency/vote-tracker-api.git
```

* Inside the clones folder, run `npm install` to install all dependencies

* Change the configuration file, according to your network settings (Energi network type and RPC credentials)

* Add cron/job.js script to your crontab, activate for main and/or test net, both for blocks24h and for masternode full list