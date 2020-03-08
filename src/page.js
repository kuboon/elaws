// const blockElems = ["Part", "Chapter", "Section", "Article", "Paragraph", "Item", "Subitem1"]
const blockElems = ["Article", "Paragraph", "Item", "Subitem1"]
function elemToPath(el){
  let ret = []
  blockElems.forEach(name => {
    const container = el.closest(name)
    ret.push(container ? container.attributes["Num"].value : "0")
  })
  while(ret.slice(-1)=="0"){ ret.pop() }
  return ret.join("-")
}
function pathToElem(path){
  let selectors = []
  path.split("-").forEach((v, i) => {
    if(v=="0") return
    const name = blockElems[i]
    selectors.push(`${name}[Num='${v}']`)
  })
  return document.querySelector(selectors.join(" "))
}
function onClick(ev){
  const path = elemToPath(ev.target)
  if(path == "") return
  history.pushState(null, path, `/${document.location.pathname.split("/")[1]}/${path}`)
  select(pathToElem(path))
}
function select(el){
  document.querySelectorAll(".selected").forEach(el => el.classList.remove("selected"))
  el.classList.add("selected")
  el.scrollIntoView({behavior: "smooth", block: 'center'});
}
function selectByPath(){
  const {pathname} = document.location
  const path = pathname.split("/")[2]
  if(path)select(pathToElem(path))
};
window.addEventListener("load", selectByPath)
window.addEventListener('popstate', selectByPath)
document.addEventListener("click", onClick)
