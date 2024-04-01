import { elemToPath, pathToSelector } from "../lib/path.ts";

const containerElems = ["PartTitle", "ChapterTitle", "SectionTitle"];
const share = document.getElementById("share")!;
prepareXml().then(observeSticky);
addEventListener("popstate", selectByPath);
document.addEventListener("click", onClick);
if (navigator.share) {
  share.addEventListener("click", () => {
    navigator.share({
      title: document.title,
      text: share.parentElement!.innerText.slice(0, 100),
      url: location.href,
    });
  });
}
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
  scrollTo({
    top: el.offsetTop - globalThis.innerHeight / 3,
    behavior: "smooth",
  });
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
    ).then((x) => x.text());
    xml.innerHTML = content.slice(
      `<?xml version="1.0" encoding="UTF-8"?>`.length,
    );
  }
  selectByPath();
}

function observeSticky() {
  const stickyElem: HTMLDivElement = document.querySelector("LawTitle")!;
  const originalHeight = stickyElem.clientHeight;
  const observeTarget = stickyElem.insertAdjacentElement("afterend", document.createElement("div")) as HTMLElement;
  observeTarget.style.height = `${originalHeight/2}px`;
  observeTarget.style.marginBottom = `-${originalHeight/2}px`;

  const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
  const lineHeight = 4.1 * rootFontSize;

  const rootMargin = `${-originalHeight/2}px 0 -${globalThis.innerHeight - originalHeight}px 0`;
  const threshold = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
  const intersectionObserver = new IntersectionObserver(function (entries) {
    const top = observeTarget.getBoundingClientRect().top
    if(entries[0].isIntersecting){
      const px = Math.min(Math.max(lineHeight, top), originalHeight)
      stickyElem.style.maxHeight = `${px}px`
    } else if(lineHeight<top) {
      stickyElem.style.maxHeight = `${originalHeight}px`
    }
  }, { rootMargin, threshold });
  intersectionObserver.observe(observeTarget);
}
