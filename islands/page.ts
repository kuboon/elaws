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
  const observeTarget = stickyElem.insertAdjacentElement("afterend", document.createElement("div"))!;

  const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
  const lineHeight = 4.1 * rootFontSize;

  function onScroll() {
    const top = observeTarget.getBoundingClientRect().top
    const px = Math.min(Math.max(lineHeight, top), originalHeight)
    stickyElem.style.maxHeight = `${px}px`
    scrollTo({ top: scrollY, behavior: "instant" })
    console.log({top, px})
  }

  const intersectionObserver = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting) {
      addEventListener("scroll", onScroll);
    } else {
      removeEventListener("scroll", onScroll);
    }
  }, { rootMargin: `0 0 -${globalThis.innerHeight - originalHeight}px 0`, threshold: [0, 1] });
  intersectionObserver.observe(observeTarget);
  if(originalHeight < scrollY) {
    stickyElem.style.maxHeight = `${lineHeight}px`
  }
}
