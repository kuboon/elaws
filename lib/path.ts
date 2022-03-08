const blockElems = ["Article", "Paragraph", "Item", "Subitem1"];
export function elemToPath(el: Element) {
  const ret: string[] = [];
  const suppl = el.closest("SupplProvision");
  if (suppl) {
    ret.push("s-" + (suppl.attributes.getNamedItem("AmendLawNum")?.value || 0));
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
export function pathToSelector(path: string) {
  const selectors = [];
  const a = path.split("-");
  if (a[0] === "s") {
    a.shift();
    selectors.push(`SupplProvision[AmendLawNum='${a.shift()}']`);
  }
  a.forEach((v, i) => {
    if (v == "0") return;
    const name = blockElems[i];
    if (i != 0 || name) {
      selectors.push(`${name}[Num='${v}']`);
    }
  });
  return selectors.join(" ");
}
