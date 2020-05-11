import got from 'got'
import {writeFileSync} from "fs";

got("https://elaws.e-gov.go.jp/api/1/lawlists/1").then(res=>{
  writeFileSync('../data/index.xml', res.body)
})
