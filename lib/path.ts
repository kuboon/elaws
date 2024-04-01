const blockElems = ["Article", "Paragraph", "Item", "Subitem1"];
function getSupplIndex(suppl: Element) {
  const idx = Array.from(
    suppl.parentElement!.querySelectorAll("SupplProvision"),
  ).indexOf(suppl);
  if (idx < 0) throw new Error("SupplProvision not found");
  return idx;
}
export function elemToPath(el: Element) {
  const ret: string[] = [];
  const suppl = el.closest("SupplProvision");
  if (suppl) {
    const idx = getSupplIndex(suppl);
    ret.push(`s-${idx}`);
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
  idx?: number;
};
export function pathToArray(path: string) {
  const selectors: DomQuery[] = [];
  const a = path.split("-");
  if (a[0] === "s") {
    a.shift();
    const idx = Number(a.shift());
    selectors.push({ name: "SupplProvision", idx });
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
  return arr.map(({ name, key, val, idx }) =>
    key
      ? `${name}[${key}='${val}']`
      : idx
      ? `${name}:nth-of-type(${idx + 1})`
      : name
  ).join(" ");
}
