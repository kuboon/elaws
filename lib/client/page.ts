import { elemToPath, pathToSelector } from "../path.ts";

const containerElems = ["PartTitle", "ChapterTitle", "SectionTitle"];

const share = document.getElementById("share")!;
prepareXml().then(selectByPath)
  .then(ensureLawTitle).then(observeSticky)
  .then(sleep(200)).then(selectByPath);
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
function ensureLawTitle(): Promise<HTMLElement> {
  const lawTitle = document.querySelector("LawTitle") as HTMLElement;
  return new Promise((resolve) => {
    if (lawTitle.clientHeight > 0) {
      return resolve(lawTitle);
    }
    setTimeout(() => resolve(ensureLawTitle()), 100);
  });
}
function sleep(ms: number) {
  return () => new Promise<void>((resolve) => setTimeout(resolve, ms));
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

function observeSticky(stickyElem: HTMLElement) {
  const originalHeight = stickyElem.clientHeight;
  const lineHeight = parseInt(getComputedStyle(stickyElem).lineHeight);

  const observeTarget = stickyElem.insertAdjacentElement(
    "afterend",
    document.createElement("div"),
  ) as HTMLElement;
  const observeHeight = (originalHeight - lineHeight) / 2;
  observeTarget.style.height = `${observeHeight}px`;
  observeTarget.style.marginBottom = `-${observeHeight}px`;

  const rootMargin = `-${lineHeight + observeHeight}px 0 -${
    globalThis.innerHeight - originalHeight
  }px 0`;
  const threshold = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1];
  const intersectionObserver = new IntersectionObserver(function (entries) {
    const top = observeTarget.getBoundingClientRect().top;
    if (entries[0].isIntersecting) {
      const px = Math.min(Math.max(lineHeight, top), originalHeight);
      stickyElem.style.maxHeight = `${px}px`;
    } else {
      const height = lineHeight < top ? originalHeight : lineHeight;
      stickyElem.style.maxHeight = `${height}px`;
    }
  }, { rootMargin, threshold });
  intersectionObserver.observe(observeTarget);
}
