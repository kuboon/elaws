import { elemToPath, pathToSelector } from "../path.ts";

const containerElems = ["PartTitle", "ChapterTitle", "SectionTitle"];

let share: HTMLElement
document.addEventListener("DOMContentLoaded", ()=> {
  share = document.getElementById("share")!;
  prepareXml().then(selectByPath)
    .then(ensureLawTitle).then(observeSticky);
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
})

type ObserveStickyParams = { stickyElem: HTMLElement; lineHeight: number };
async function ensureLawTitle(): Promise<ObserveStickyParams> {
  const lawTitle = document.querySelector("LawTitle") as HTMLElement;
  const style = getComputedStyle(lawTitle);
  const { promise, resolve } = Promise.withResolvers<ObserveStickyParams>();
  while (true) {
    const lineHeight = parseInt(style.lineHeight);
    if (lineHeight > 0) {
      resolve({ stickyElem: lawTitle, lineHeight });
      break;
    }
    await new Promise<void>((resolve) => setTimeout(resolve, 100));
  }
  return promise;
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
}

function observeSticky({ stickyElem, lineHeight }: ObserveStickyParams) {
  const stickyFirstLine = stickyElem.cloneNode(true) as HTMLElement;
  stickyFirstLine.style.marginBlockEnd = `${-lineHeight}px`;
  stickyFirstLine.style.maxHeight = `${lineHeight}px`;
  stickyFirstLine.style.zIndex = "100";
  stickyElem.insertAdjacentElement("beforebegin", stickyFirstLine);

  const hr = document.createElement("hr");
  hr.style.top = `${lineHeight}px`;
  stickyElem.insertAdjacentElement("afterend", hr);
}
