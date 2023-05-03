import classes from './PanelController.scss'

class PanelController {

  constructor(element, startable, onStart, onDelayChange) {
    this.element = element
    this.onStart = onStart
    this.startable = startable
    this.onDelayChange = onDelayChange
    this.createPanel()
  }

  createPanel() {

    const d = () => document.createElement('div')
    const wrapper = d()
    wrapper.classList.add(classes.wrapper)
    this.element.appendChild(wrapper)

    const left = d()
    left.classList.add(classes.left)
    wrapper.appendChild(left)

    const right = d()
    right.classList.add(classes.right)
    wrapper.appendChild(right)

    const spentIndicator = d()
    spentIndicator.classList.add(classes.spentIndicator)
    right.appendChild(spentIndicator)
    this.spentIndicator = spentIndicator
    this.spentIndicatorTemplate = (n, v) => `Среднее время обсчёта за ${n} последних итераций, мс: ${v}`
    this.spentIndicator.innerHTML = this.spentIndicatorTemplate(0, '?')

    const iterationsIndicator = d()
    iterationsIndicator.classList.add(classes.iterationsIndicator)
    right.appendChild(iterationsIndicator)
    this.iterationsIndicator = iterationsIndicator
    this.iterationsIndicatorTemplate = v => `Итераций: ${v}`
    this.iterationsIndicator.innerHTML = this.iterationsIndicatorTemplate('?')

    const delayWrapper = d()
    delayWrapper.classList.add(classes.delayWrapper)
    const delayWrapperCaption = d()
    delayWrapperCaption.innerHTML = 'Задержка между итерациями, мс:'
    delayWrapper.appendChild(delayWrapperCaption)
    const delaySelector = document.createElement('select')
    delaySelector.innerHTML = `
    <option value="20">20</option>
    <option value="100" selected>100</option>
    <option value="500">500</option>
    `
    delaySelector.addEventListener('change', e => this.onDelayChange(+e.target.value))
    delayWrapper.appendChild(delaySelector)
    left.appendChild(delayWrapper)

    if (this.startable) {

      const startButton = document.createElement('button')
      startButton.innerHTML = 'Запустить'
      startButton.addEventListener('click', e => {
        e.target.removeEventListener('click', this.onStart)
        e.target.parentNode.removeChild(e.target)
        setTimeout(this.onStart, 0)
      })
      left.appendChild(startButton)
    }
  }


  updateSpentIndication(n, value) {
    this.spentIndicator.innerHTML = this.spentIndicatorTemplate(n, value)
  }

  updateIterationsIndicator(value) {
    this.iterationsIndicator.innerHTML = this.iterationsIndicatorTemplate(value)
  }



}

export default PanelController
