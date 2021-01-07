;
(function() {
  const VERSION = '0.21.0107'
  const log = msg => console.log(msg)

  let path = location.hostname + location.pathname,
      isZGB = path === 'zgb.jd.com/order_detail.html',
      isALITONG = path === 'm.8.1688.com/lst-pc/mine-v2-order-detail.html',
      isTMALL = path === 'trade.tmall.com/detail/orderDetail.htm',
      isJD = path === 'details.jd.com/normal/item.action'

  if ([isZGB, isALITONG, isTMALL, isJD].some(item => item)) {
    log('The version of export copies: ', VERSION)
    dynamicInsert('https://mengyifan.github.io/exportCopies/main.css', callback)
  }

  // main function
    function handleSave() {
      let sum = 0,
          path = location.hostname + location.pathname,
          rows = []

      if (isZGB) {
        rows = [
          ...document.querySelectorAll('.od-list-row')
        ]
      } else if (isALITONG) {
        rows = [
          ...document.querySelectorAll('.p-warehouse__offer-title')
        ]
      } else if (isTMALL) {
        rows = [
          ...document.querySelectorAll('.order-item-info')
        ]
      } else if (isJD) {
        rows = [
          ...document.querySelectorAll('.goods-list tbody tr')
        ].filter(row => row.style.display !== 'none')
      }

      let content = rows.map(row => {
        let tr,
            name,
            parseNameRes,
            size = 1,
            number = 1,
            totalNumber, 
            totalPrice, 
            cols, 
            price, 
            priceStat,
            date = '',
            timeRegExp = /\d{4}-\d{2}-\d{2}/g,
            nameRegExp = /(\d+(\.\d+)?(([\*|\d|A-Za-z]+)|([\u4e00-\u9fa5]){1})?)/g,
            numberRegExp = /[^\d\.]/gi

        if (isALITONG) {
          //
          date = [
					    ...document.querySelectorAll('.p-order-detail-buyer-info-item')
					].reduce((acc, curr) => {
						if (-1 !== curr.textContent.indexOf('付款时间')) {
							return (curr.textContent.match(timeRegExp) || [])[0] || ''
						}

						return acc
					}, '')

          tr = findParentByEle(row, 'tr')
          name = tr.querySelector('.p-warehouse__offer-title').textContent
          parseNameRes = name.match(nameRegExp)
          totalNumber = tr.querySelectorAll('td')[2].textContent.replace(/[^\d\.]/gi, '')
          totalPrice = tr.querySelectorAll('td')[4].textContent.replace(/[^\d\.]/gi, '')
        } else if (isZGB) {
          //
					date = [
					    ...document.querySelectorAll('.card .c2-item .content .row')
					].reduce((acc, curr) => {
						if (-1 !== curr.textContent.indexOf('下单时间')) {
							return (curr.textContent.match(timeRegExp) || [])[0] || ''
						}

						return acc
					}, '')

          name = row.querySelector('.good-name').textContent
          parseNameRes = name.match(nameRegExp)
          cols = row.querySelectorAll('div.rl')
          price = cols[2].textContent.replace(numberRegExp, '')
          totalNumber = cols[3].textContent.replace(numberRegExp, '')
          totalPrice = Math.round(price * totalNumber * 100) / 100
        } else if (isTMALL) {
          //
          try {
          	date = document.querySelectorAll('.step-time .step-time-wraper')[1].textContent.match(timeRegExp)
          } catch(e) {
          	date = ''
          }

          priceStat = [
            ...document.querySelectorAll('.total-count-line')
          ].reduce((acc, curr) => {
            let textContent = curr.textContent,
                price = +textContent.replace(numberRegExp, '')

            if (-1 !== textContent.indexOf('商品总价')) {
              acc.total = price
            }

            if (-1 !== textContent.indexOf('天猫超市卡') ||
              -1 !== textContent.indexOf('实付款')
            ) {
              acc.actual += price
            }

            return acc
          }, {
            actual: 0,
            total: 0
          })

          tr = findParentByEle(row, 'tr')
          name = tr.querySelector('.item-link').textContent
          parseNameRes = name.match(nameRegExp)
          price = +tr.querySelector('.header-price').textContent.replace(numberRegExp, '')
          totalNumber = +tr.querySelector('.header-count').textContent
          totalPrice = (totalNumber * price) * priceStat.actual / priceStat.total
        } else if (isJD) {
        	try {
          	date = document.querySelectorAll('#pay-info-nozero .dd .item')[1].textContent.match(timeRegExp)
          	date = date ? date[0] : ''
          } catch(e) {
          	date = ''
          }

          //
          priceStat = [
            ...document.querySelectorAll('.goods-total ul li')
          ].reduce((acc, curr) => {
            let textContent = curr.textContent,
                price = +textContent.replace(numberRegExp, '')

            if (-1 !== textContent.indexOf('商品总额')) {
              acc.total = price
            }

            if (-1 !== textContent.indexOf('实付款')) {
              acc.actual += price
            }

            return acc
          }, {
            actual: 0,
            total: 0
          })
        
          name = row.querySelector('.p-info .p-name').textContent.trim()
          parseNameRes = name.match(nameRegExp)
          cols = row.querySelectorAll('td')
          price = row.querySelector('span.f-price').textContent.replace(numberRegExp, '')
          totalNumber = cols[4].textContent.replace(numberRegExp, '')
          totalPrice = (totalNumber * price) * priceStat.actual / priceStat.total
        }

        if (parseNameRes) {
          parseNameRes = [...new Set(parseNameRes)]
          size = parseNameRes[0] || 1
          number = parseNameRes[1] || 1
        }

        sum += +totalPrice
        totalPrice = getPirce(totalPrice)

        return `${date}	 	${name}	${size}	${number}	${totalNumber}	${totalPrice}`
      })

      content.push(` 	  	 	 	 	 ${getPirce(sum)}`)
      copy(content.join('\t\n'))

      alertMsg('复制成功，请在Excel粘贴。')
    }

  function callback() {
    let div = document.createElement('div')
    div.classList.add('btn--export-data')
    div.innerText = '导出数据'
    div.addEventListener('click', handleSave)
    document.body.appendChild(div)
  }

  function dynamicInsert(url, callback = null, type = 'style') {
    let head = document.head || document.getElementsByTagName('head')[0]
    let ele = document.createElement(type === 'style' ? 'link' : 'script')

    if (type === 'style') {
      ele.setAttribute('rel', 'stylesheet')
      ele.href = url
    } else {
      ele.type = 'text/javascript'
      ele.src = url
    }

    if (typeof(callback) === 'function') {
      ele.onload = ele.onreadystatechange = function() {
        if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
          callback()
          ele.onload = ele.onreadystatechange = null
        }
      }
    }

    head.appendChild(ele)
  }

  function getPirce(price) {
    return Math.round(price * 100) / 100
  }

  function copy(content) {
    let textarea = document.createElement('textarea')
    textarea.classList.add('ele--hidden')
    document.body.appendChild(textarea)
    let range = document.createRange();

    textarea.value = content || ''
    textarea.select();
    document.execCommand("Copy");
    textarea.remove()
  }

  function findParentByEle(ele, tagName) {
    let parentNode = ele.parentNode,
      nodeName = parentNode.nodeName.toUpperCase()

    if (parentNode === null) {
      return null
    }

    return nodeName === tagName.toUpperCase() ?
      parentNode :
      findParentByEle(parentNode, tagName)
  }

  function alertMsg(msg) {
    div = document.createElement('div')
    div.classList.add('dialog')
    div.innerText = msg
    document.body.appendChild(div)

    setTimeout(function() {
      div.remove()
      div = null
    }, 2000);
  }
}());