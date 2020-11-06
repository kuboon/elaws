require('source-map-support').install({ environment: 'node' })

import * as https from 'https'
import * as fs from 'fs'
import { pipeline, Readable, Transform, Writable } from 'stream'
import { promisify } from 'util'

import got from 'got'
import { JSDOM } from 'jsdom'
import { execSync } from 'child_process'
import { exit } from 'process'

require('events').defaultMaxListeners = 15
const Saxophone = require('saxophone')
const pipe = promisify(pipeline)

function parserFactory (ret) {
  const parser = new Saxophone()
  const tagopen = tag => {
    switch (tag.name) {
      case 'LawNum':
        parser.once('text', text => {
          ret['name'] = text.contents
        })
        break
      case 'LawTitle':
        parser.once('text', text => {
          ret['title'] = text.contents
          parser.off('tagopen', tagopen)
        })
        break
    }
  }
  parser.on('tagopen', tagopen)
  return parser
}
async function getIso (num) {
  const fileName = `../iso/${num}.iso`
  if (!fs.existsSync(fileName)) {
    return new Promise((ok, ng) =>
      https.get(`https://elaws.e-gov.go.jp/download/${num}.iso`, res => {
        if (res.statusCode == 200) {
          ok(pipe(res, fs.createWriteStream(fileName)))
        } else ng(res)
      })
    )
  }
}
async function buildIndex () {
  const ret: any = {}
  const dirents = await new Promise<fs.Dirent[]>((ok, ng) =>
    fs.readdir('../xml', { withFileTypes: true }, (err, dirents) => {
      if (err) {
        console.error(err)
        return ng(err)
      }
      ok(dirents)
    })
  )
  for (const dirent of dirents) {
    if (dirent.isDirectory()) {
      return
    }

    const fStream = fs.createReadStream('../xml/' + dirent.name)
    const props: any = {}
    await pipe(fStream, parserFactory(props))
    ret[props.name] = {
      path: dirent.name,
      title: props.title
    }
  }
  return ret
}
async function zipList () {
  const res = await got(`https://elaws.e-gov.go.jp/download/lawdownload.html`)
  const { document } = new JSDOM(res.body).window
  const list = Array.from(document.querySelectorAll('#sclTbl a[href]'))
    .map(a => {
      const match = a.attributes['href'].value.match(
        /javascript:lawdata_download\('(...).zip'\)/
      )
      return match ? match[1] : null
    })
    .filter(e => e)
  return list
}
async function main () {
  const errors = []
  const list = await zipList()
  for (let num of await zipList()) {
    await getIso(num).catch(err => errors.push({ num, err }))
  }
  if (errors.length > 0) {
    console.error(errors)
    exit(1)
  }
  // you need sudo apt install p7zip-full
  execSync("7z e -ir!'*.xml' -y -o../xml '../iso/*.iso'")

  const index = buildIndex()
  fs.writeFileSync('../xml/index.json', JSON.stringify(index))
}
main()
