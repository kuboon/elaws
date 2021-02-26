const containerElems = ['PartTitle', 'ChapterTitle', 'SectionTitle']
const blockElems = ['Article', 'Paragraph', 'Item', 'Subitem1']
const share = document.querySelector('#share')
function elemToPath (el) {
  let ret = []
  const suppl = el.closest('SupplProvision')
  if (suppl) {
    ret.push('s-' + (suppl.attributes.AmendLawNum?.value || 0))
  }
  blockElems.forEach(name => {
    const container = el.closest(name)
    ret.push(container ? container.attributes['Num'].value : '0')
  })
  while (ret.slice(-1) == '0') {
    ret.pop()
  }
  return ret.join('-')
}
function pathToElem (path) {
  let selectors = []
  const a = path.split('-')
  if (a[0] === 's') {
    a.shift()
    selectors.push(`SupplProvision[AmendLawNum='${a.shift()}']`)
  }
  a.forEach((v, i) => {
    if (v == '0') return
    const name = blockElems[i]
    if (i == 0 && !name) {
    } else {
      selectors.push(`${name}[Num='${v}']`)
    }
  })
  return document.querySelector(selectors.join(' '))
}
function getContainer (el) {
  let ret
  containerElems.reverse().find(n => {
    const container = el.closest(n)
    if (container) {
      ret = container
      return true
    }
  })
  return ret
}
function onClick (ev) {
  const path = elemToPath(ev.target)
  if (path) {
    history.pushState(
      null,
      path,
      `/${document.location.pathname.split('/')[1]}/${path}`
    )
    select(pathToElem(path))
    return
  }
  const container = getContainer(ev.target)
  if (container) {
    container.classList.toggle('collapse')
  }
}
function select (el) {
  document
    .querySelectorAll('.selected')
    .forEach(el => el.classList.remove('selected'))
  share.style.display = 'none'
  if (!el) return
  el.classList.add('selected')
  scrollTo({ top: el.offsetTop - window.innerHeight / 2, behavior: 'smooth' })
  if (navigator.share) {
    el.prepend(share)
    share.style.display = 'block'
  }
}
function selectByPath () {
  const { pathname } = document.location
  const path = pathname.split('/')[2]
  if (path) select(pathToElem(path))
}
async function prepareXml () {
  const xml = document.querySelector('#xml:empty')
  if (xml) {
    const content = await fetch(xml.attributes.xmlUrl.value).then(res =>
      res.text()
    )
    xml.innerHTML = content.replace(/<([^>]+)\/>/g, '<$1></$1>')
  }
  selectByPath()
}
window.addEventListener('load', prepareXml)
window.addEventListener('popstate', selectByPath)
document.addEventListener('click', onClick)
if (navigator.share) {
  share.addEventListener('click', () => {
    navigator.share({
      title: document.title,
      text: share.parentElement.innerText.slice(0, 100),
      url: location.href
    })
  })
}
