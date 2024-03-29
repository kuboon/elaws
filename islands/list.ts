const query = document.getElementById('query');
const list = document.getElementById('list');
const listLength = document.getElementById('listLength');

query?.addEventListener('input', (e) => {
  const query = (e.target as HTMLInputElement).value;

  let count = 0
  list?.querySelectorAll('details').forEach((details) => {
    const anchors = details.querySelectorAll('a')
    let countInYear = anchors.length;
    anchors.forEach((anchor) => {
      const text = anchor.textContent ?? '';
      if (text.includes(query)) {
        anchor.parentElement?.classList.remove('hidden');
        count++;
      } else {
        anchor.parentElement?.classList.add('hidden');
        countInYear--;
      }
    });
    if(countInYear === 0) {
      details.classList.add('hidden');
    } else {
      details.classList.remove('hidden');
    }
  })
  listLength!.textContent = String(count);
  list?.querySelectorAll('details').forEach((details) => {
    details.open = count < 100;
  })
})
