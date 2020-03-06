const blockElems = ["Part", "Chapter", "Article", "Paragraph", "Item", "Subitem1"]
function elemToLocation(el){
  let loc = {}
  blockElems.forEach(name => {
    const container = el.closest(name)
    if(!container)return;
    loc[name] = container.attributes["Num"].value
  })
  return loc
}
function locationToPath(loc){
  let ret = []
  blockElems.forEach(name => {
    if(loc[name]) ret.push(loc[name])
  })
  return ret.join("-")
}
function pathToElem(path){
  let selectors = []
  path.split("-").forEach((v, i) => {
    const name = blockElems[i]
    selectors.push(`${name}[Num='${v}']`)
  })
  return document.querySelector(selectors.join(" "))
}
function onClick(ev){
  const loc = elemToLocation(ev.target)
  const path = locationToPath(loc)
  history.pushState(null, path, "/" + path)
  select(pathToElem(path))
}
function select(el){
  document.querySelectorAll(".selected").forEach(el => el.classList.remove("selected"))
  el.classList.add("selected")
  el.scrollIntoView({behavior: "smooth", block: 'center'});
}
function selectByPath(){
  const {pathname} = document.location
  const path = pathname.split("/").slice(-1)[0]
  select(pathToElem(path))
};
window.addEventListener("load", selectByPath)
window.addEventListener('popstate', selectByPath)
document.addEventListener("click", onClick)
