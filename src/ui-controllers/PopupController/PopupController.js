import classes from './PopupController.scss'
import presets from '../../misc/presets'

class PopupController {

  constructor(element, onPopupClose) {
    this.element = element
    this.onPopupClose = onPopupClose
  }

  presetClickListener = e => {
    e.preventDefault()
    const preset = presets[+e.target.getAttribute('data-preset-index')]
    setTimeout(() => this.onPopupClose('preset', preset), 0)
    this.hide()
  }

  btnClickListener = e => {
    const cols = +this.cols.value
    const rows = +this.rows.value
    if (!isNaN(cols) && !isNaN(rows) && cols > 0 && rows > 0) {
      setTimeout(() => this.onPopupClose('empty', { cols, rows }), 0)
      this.hide()
    }
  }

  show() {

    const children = []

    const p1 = document.createElement('p')
    p1.innerHTML = 'Выберите пресет:'
    children.push(p1)

    presets.forEach((v, i) => {
      const a = document.createElement('a')
      a.setAttribute('href', "#")
      a.setAttribute('data-preset-index', i)
      a.innerHTML = v.name
      a.addEventListener('click', this.presetClickListener)
      children.push(a)
    })

    const p2 = document.createElement('p')
    p2.innerHTML = 'Или создайте пустую вселенную<br /> размером <em>cols</em> &times; <em>rows</em>:'
    children.push(p2)

    const div = document.createElement('div')
    div.classList.add(classes.form)
    this.cols = document.createElement('input')
    this.cols.value = 100
    this.rows = document.createElement('input')
    this.rows.value = 50
    this.btn = document.createElement('button')
    this.btn.innerHTML = 'Создать'
    this.btn.addEventListener('click', this.btnClickListener)
    this.cols.setAttribute('placeholder', 'cols')
    this.rows.setAttribute('placeholder', 'rows')
      ;[this.cols, this.rows, this.btn].forEach(v => {
        div.appendChild(v)
      })

    children.push(div)

    this.element.classList.add(classes.visible)
    children.forEach(c => this.element.appendChild(c))

  }


  hide() {
    Array.from(this.element.querySelectorAll('a')).forEach(a => a.removeEventListener('click', this.presetClickListener))
    this.element.classList.remove(classes.visible)
    this.element.innerHTML = ''
    this.cols = null
    this.rows = null
    this.btn.removeEventListener('click', this.btnClickListener)
    this.btn = null
  }

}

export default PopupController
