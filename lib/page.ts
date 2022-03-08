import { elemToPath, pathToElem } from "./path.ts";

const containerElems = ["PartTitle", "ChapterTitle", "SectionTitle"];
let share: HTMLElement;
addEventListener("load", () => {
  prepareXml();
  addEventListener("popstate", selectByPath);
  document.addEventListener("click", onClick);
  share = document.querySelector("#share")!;
  if (navigator.share) {
    share.addEventListener("click", () => {
      navigator.share({
        title: document.title,
        text: share.parentElement!.innerText.slice(0, 100),
        url: location.href,
      });
    });
  }
});
function getContainer(el: Element) {
  for (const c of containerElems.reverse()) {
    const container = el.closest(c);
    if (container) {
      return container;
    }
  }
  return undefined;
}
function onClick(ev: Event) {
  const path = elemToPath(ev.target as Element);
  if (path) {
    history.pushState(
      null,
      path,
      `/${document.location.pathname.split("/")[1]}/${path}`,
    );
    select(pathToElem(path)!);
    return;
  }
  const container = getContainer(ev.target as Element);
  if (container) {
    container.classList.toggle("collapse");
  }
}
function select(el: HTMLElement) {
  document
    .querySelectorAll(".selected")
    .forEach((el) => el.classList.remove("selected"));
  share.style.display = "none";
  if (!el) return;
  el.classList.add("selected");
  scrollTo({ top: el.offsetTop - window.innerHeight / 3, behavior: "smooth" });
  if (navigator.share != undefined) {
    el.append(share);
    share.style.display = "block";
  }
}
function selectByPath() {
  const { pathname } = document.location;
  const path = pathname.split("/")[2];
  if (path) select(pathToElem(path)!);
}
async function prepareXml() {
  const xml = document.querySelector("#xml:empty");
  if (xml) {
    const content = await fetch(
      xml.attributes.getNamedItem("xmlUrl")!.value,
    ).then((res) => res.text());
    xml.innerHTML = content.replace(/<([^>]+)\/>/g, "<$1></$1>");
  }
  selectByPath();
}
