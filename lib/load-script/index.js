
function loadScript(src) {
	return new Promise((rev, rej) => {
		let script = document.createElement('script')
		script.type = 'text/javascript'
		script.src = src
		document.head.appendChild(script)
		script.onload = function() {
			rev(window.TEMP)
		}
		script.onerror = function() {
			rej()
		}
	})
}

export {loadScript}