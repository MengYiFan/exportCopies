;(function () {
	const dynamicInsert = function (url, callback = null, type = 'style') {
		let head = document.head || document.getElementsByTagName('head')[0]
		let ele = document.createElement(type === 'style' ? 'link' : 'script')
		
		if (type === 'style') {
			ele.ref = 'stylesheet'
			ele.href = url
		} else {
			ele.type = 'text/javascript'
			ele.src = url
		}

		if (typeof(callback) === 'function') {
				ele.onload = ele.onreadystatechange = function() {
					if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete"){
						callback()
						ele.onload = ele.onreadystatechange = null
					}		
				}
		}

		head.appendChild(ele)
	}

	const callback = function() {
		div = document.createElement('div')
		div.classList.add('btn--export-data')
		div.innerText = '导出数据'
		div.addEventListener('click', handleSave)
		document.body.appendChild(div)
		
		function handleSave() {
			let content = [
				...document.querySelectorAll('.p-warehouse__offer-title')
			].map(ele => {
		    let tr = findParentByEle(ele, 'tr'),
		    	name = tr.querySelector('.p-warehouse__offer-title').textContent,
		    	parseNameRes = name.match(/(\d+(\.\d+)?(([\*|\d|A-Za-z]+)|([\u4e00-\u9fa5]){1})?)/g),
		    	size = 1,
		    	number = 1,
		    	totalNumber = tr.querySelectorAll('td')[2].textContent.replace(/[^\d\.]/gi, ''),
		    	totalPrice = tr.querySelectorAll('td')[4].textContent.replace(/[^\d\.]/gi, '')

	    	if (parseNameRes) {
	    		parseNameRes = [...new Set(parseNameRes)]
	    		size = parseNameRes[0] || 1
	    		number = parseNameRes[1] || 1
	    	}

			return `${name}	${size}	${number}	${totalNumber}	${totalPrice}`
		})

			copy(content.join('\t\n'))
			alertMsg('复制成功，请在Excel粘贴。')
		}
	}

	dynamicInsert('https://mengyifan.github.io/exportCopies/main.css', callback)
}());
