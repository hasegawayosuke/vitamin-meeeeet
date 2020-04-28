async function load () {
  const res = await fetch(chrome.runtime.getURL('cs.js'), { method: 'GET' })
  const js = await res.text()
  const script = document.createElement('script')
  script.textContent = js
  document.body.insertBefore(script, document.body.firstChild)
}

window.addEventListener('load', (evt) => {
  load()
}, false)
