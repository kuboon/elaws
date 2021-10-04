/** @jsx h */
/// <reference lib="dom" />
import { h, IS_BROWSER } from '../deps.ts'

interface Props {
  params: Record<string, string | string[]>
}

export default function Page (props: Props) {
  return <div>Hello {props.params.id}</div>
}

const document = globalThis.document
const containerElems = ['PartTitle', 'ChapterTitle', 'SectionTitle']
const blockElems = ['Article', 'Paragraph', 'Item', 'Subitem1']
let share: HTMLElement
if (IS_BROWSER) {
  window.addEventListener('load', prepareXml)
  window.addEventListener('popstate', selectByPath)
  document.addEventListener('click', onClick)
  share = document.querySelector('#share')!
  if (navigator.share) {
    share.addEventListener('click', () => {
      navigator.share({
        title: document.title,
        text: share.parentElement!.innerText.slice(0, 100),
        url: location.href
      })
    })
  }
}
function elemToPath (el: Element) {
  const ret = []
  const suppl = el.closest('SupplProvision')
  if (suppl) {
    ret.push('s-' + (suppl.attributes.getNamedItem('AmendLawNum')?.value || 0))
  }
  blockElems.forEach(name => {
    const container = el.closest(name)
    ret.push(container ? container.attributes.getNamedItem('Num')?.value : '0')
  })
  while (ret.slice(-1)[0] == '0') {
    ret.pop()
  }
  return ret.join('-')
}
function pathToElem (path: string) {
  const selectors = []
  const a = path.split('-')
  if (a[0] === 's') {
    a.shift()
    selectors.push(`SupplProvision[AmendLawNum='${a.shift()}']`)
  }
  a.forEach((v, i) => {
    if (v == '0') return
    const name = blockElems[i]
    if (i != 0 || name) {
      selectors.push(`${name}[Num='${v}']`)
    }
  })
  return document.querySelector(selectors.join(' ')) as HTMLElement
}
function getContainer (el: Element) {
  for (const c of containerElems.reverse()) {
    const container = el.closest(c)
    if (container) {
      return container
    }
  }
  return undefined
}
function onClick (ev: Event) {
  const path = elemToPath(ev.target as Element)
  if (path) {
    history.pushState(
      null,
      path,
      `/${document.location.pathname.split('/')[1]}/${path}`
    )
    select(pathToElem(path)!)
    return
  }
  const container = getContainer(ev.target as Element)
  if (container) {
    container.classList.toggle('collapse')
  }
}
function select (el: HTMLElement) {
  document
    .querySelectorAll('.selected')
    .forEach(el => el.classList.remove('selected'))
  share.style.display = 'none'
  if (!el) return
  el.classList.add('selected')
  scrollTo({ top: el.offsetTop - window.innerHeight / 3, behavior: 'smooth' })
  if (navigator.share != undefined) {
    el.append(share)
    share.style.display = 'block'
  }
}
function selectByPath () {
  const { pathname } = document.location
  const path = pathname.split('/')[2]
  if (path) select(pathToElem(path)!)
}
async function prepareXml () {
  const xml = document.querySelector('#xml:empty')
  if (xml) {
    const content = await fetch(
      xml.attributes.getNamedItem('xmlUrl')!.value
    ).then(res => res.text())
    xml.innerHTML = content.replace(/<([^>]+)\/>/g, '<$1></$1>')
  }
  selectByPath()
}
