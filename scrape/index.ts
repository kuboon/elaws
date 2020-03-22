require('source-map-support').install({environment: 'node'});

import * as https from 'https'
import got from 'got'
import {IncomingMessage} from 'http'
import * as unzip from 'unzipper'
import {pipeline, Transform, Writable} from 'stream'
import {writeFileSync} from "fs";
import {promisify} from 'util'
import {JSDOM} from 'jsdom'
require('events').defaultMaxListeners = 15;
const Saxophone = require('saxophone');
const pipe = promisify(pipeline);

class OnlyXml extends Transform {
  constructor(opts = {}){
    super({objectMode: true, ...opts})
  }
  _transform(e, _enc, done){
    const ext = e.path.split(".").slice(-1)[0];
    if (e.type !== "File" || ext !== 'xml') {
      return e.autodrain().promise().then(done);
    }
    this.push(e)
    done()
  }
}
class PickTitle extends Transform {
  constructor(opts = {}){
    super({objectMode: true, ...opts})
  }
  async _transform(e, _enc, done){
    const path = e.path.split("/").slice(-1)[0];
    const result = {path}
    await pipe(e, parserFactory(result))
    this.push(result)
    done()
  }
}
function parserFactory(ret){
  const parser = new Saxophone();
  const tagopen = tag => {
    switch(tag.name){
    case "LawNum":
      parser.once('text', text => {ret["name"] = text.contents})
      break;
    case "LawTitle":
      parser.once('text', text => {
        ret["title"] = text.contents
        parser.off('tagopen', tagopen)
      })
      break;
    }
  }
  parser.on('tagopen', tagopen)
  return parser
}

class ResultReceiver extends Writable {
  public result: any[];
  constructor(opts = {}){
    super({objectMode: true, ...opts})
    this.result = []
  }
  _write(obj:any, _, next){
    this.result.push(obj)
    next()
  }
}
async function getAndExtract(num, all, errors) {
  console.log(num)
  const res: IncomingMessage = await new Promise(
    (ok, ng) => 
      https.get(`https://elaws.e-gov.go.jp/download/${num}.zip`, res => 
        res.statusCode == 200 ? ok(res) : ng(res)
      )
  )
  const receiver = new ResultReceiver
  await pipe(
    res
  , unzip.Parse()
  , new OnlyXml
  , new PickTitle
  , receiver
  ).catch(err => {
    if (err.code === "ERR_STREAM_PREMATURE_CLOSE") return; 
    if (err){
      errors.push([num, err]);
      console.error(err)
    }
  });
  receiver.result.forEach(e => {
    all[e.name] = {
      num,
      path: e.path,
      title: e.title
    }
  })
}
async function zipList() {
  const res = await got(`https://elaws.e-gov.go.jp/download/lawdownload.html`)
  const { document } = (new JSDOM(res.body)).window;
  const list = Array.from(document.querySelectorAll("#sclTbl a[href]")).map(a => {
    const match = a.attributes["href"].value.match(/javascript:lawdata_download\('(...).zip'\)/)
    return match ? match[1] : null
  }).filter(e=>e)
  return list
}
async function main() {
  const all = {}, errors = [];
  for(let i of await zipList()){
    await getAndExtract(i, all, errors)
  }
  writeFileSync('index.json', JSON.stringify(all));
  console.log('errors', errors);
}
main();
