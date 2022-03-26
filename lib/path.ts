const blockElems = ["Article", "Paragraph", "Item", "Subitem1"];
export function elemToPath(el: Element) {
  const ret: string[] = [];
  const suppl = el.closest("SupplProvision");
  if (suppl) {
    ret.push("s-" + (suppl.attributes.getNamedItem("AmendLawId")?.value || 0));
  }
  blockElems.forEach((name) => {
    const container = el.closest(name);
    ret.push(
      container ? container.attributes.getNamedItem("Num")?.value! : "0",
    );
  });
  while (ret.slice(-1)[0] == "0") {
    ret.pop();
  }
  return ret.join("-");
}
export type DomQuery = {
  name: string;
  key?: string;
  val?: string;
};
export function pathToArray(path: string) {
  const selectors: DomQuery[] = [];
  const a = path.split("-");
  if (a[0] === "s") {
    a.shift();
    const val = a.shift();
    if (val === "0") {
      selectors.push({ name: "SupplProvision" });
    } else {
      selectors.push({ name: "SupplProvision", key: "AmendLawId", val });
    }
  }
  a.forEach((v, i) => {
    if (v == "0") return;
    const name = blockElems[i];
    if (i != 0 || name) {
      selectors.push({ name, key: "Num", val: v });
    }
  });
  return selectors;
}
export function pathToSelector(path: string) {
  const arr = pathToArray(path);
  return arr.map(({ name, key, val }) =>
    key ? `${name}[${key}='${val}']` : name
  ).join(" ");
}
