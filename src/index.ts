#!/usr/bin/env node
import yargs = require('yargs/yargs');
import {main} from './main'
import * as fs from 'fs'
const argv = yargs(process.argv.slice(2)).options({
  channel: { type: 'string', demandOption: true },
  video_id: { type: 'string', alias: 'video-id', demandOption: true },
}).argv;

(async function () {
  const {zipFile, comments} = await main(argv.channel, argv.video_id, "nodebuffer")
  await fs.promises.writeFile(`${argv.video_id}.zip`, zipFile)
  const commentsStringified = JSON.stringify(comments)
  await fs.promises.writeFile(`${argv.video_id}.json`, commentsStringified)
})()