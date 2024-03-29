import { elemToPath, pathToSelector } from "./path.ts";

const containerElems = ["PartTitle", "ChapterTitle", "SectionTitle"];
let share: HTMLElement;
addEventListener("load", () => {
  prepareXml().then(observeSticky);
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
    select(document.querySelector(pathToSelector(path))!);
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
  scrollTo({ top: el.offsetTop - globalThis.innerHeight / 3, behavior: "smooth" });
  if (navigator.share != undefined) {
    el.append(share);
    share.style.display = "block";
  }
}
function selectByPath() {
  const { pathname } = document.location;
  const path = pathname.split("/")[2];
  if (path) select(document.querySelector(pathToSelector(path))!);
}
async function prepareXml() {
  const xml = document.querySelector("#xml:empty") as HTMLElement;
  if (xml) {
    const content = await fetch(
      xml.dataset.xmlurl!,
    ).then(x => x.text());
    xml.innerHTML = content.slice(
      `<?xml version="1.0" encoding="UTF-8"?>`.length,
    );
  }
  selectByPath();
}
function observeSticky() {
  const lawTitle: HTMLDivElement = document.querySelector("LawTitle")!;
  let sticking = false;
  const intersectionObserver = new IntersectionObserver(function (entries) {
    if (sticking) return;
    if (!entries[0].isIntersecting) {
      lawTitle.classList.add("stuck");
      sticking = true;
      setTimeout(() => {
        scrollTo({ top: lawTitle.offsetTop, behavior: "smooth" });
        sticking = false;
      }, 500);
    } else {
      lawTitle.classList.remove("stuck");
    }
  }, { rootMargin: "-1px 0px 0px 0px", threshold: 1 });
  intersectionObserver.observe(lawTitle);
}
