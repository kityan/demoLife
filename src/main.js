import './main.scss'
import CanvasRenderer from './renderers/CanvasRenderer/CanvasRenderer'
import Universe from './processors/Universe'
import PopupController from './ui-controllers/PopupController/PopupController'
import { getCalcSpentAvg2 } from './misc/helpers'
import PanelController from './ui-controllers/PanelController/PanelController'

new PopupController(document.getElementById('popup'), onPopupClose).show()

function onPopupClose(type, data) {

  const autostart = type === 'preset' ? true : false

  const panel = new PanelController(
    document.getElementById('panel'),
    !autostart,
    onStart,
    onDelayChange,
  )

  let paused = true

  let totalIterations = 0
  let size = { cols: 30, rows: 30 }
  let seeds = []
  let cellSizeAtScale1 = undefined
  let delay = 100

  if (type === 'preset') {
    size = data.size
    seeds = data.seeds
    cellSizeAtScale1 = data.cellSizeAtScale1
  }

  if (type === 'empty') {
    size = data
  }

  const renderer = new CanvasRenderer({
    size,
    displayElement: document.getElementById('display'),
    cellSizeAtScale1,
    onCellClick,
  })

  const calcSpentAvg = getCalcSpentAvg2((n, value) => panel.updateSpentIndication(n, value))

  const universe = new Universe({
    size,
    onIterationComplete: onUniverseIterationComplete,
    onPopulateComplete: onUniversePopulateComplete,
  })

  if (type === 'preset') {
    universe.populate(seeds)
  }

  if (autostart) {
    // автозапуск
    paused = false
    universe.step()
  }

  function onUniversePopulateComplete(universeState, birthlog, necrolog, totalSeeds) {
    renderer.render(universeState, birthlog, necrolog)
    //  console.log(JSON.stringify(totalSeeds))
  }

  function onUniverseIterationComplete(universeState, birthlog, necrolog, spent, quadtree) {
    totalIterations++
    panel.updateIterationsIndicator(totalIterations)
    renderer.render(universeState, birthlog, necrolog, quadtree)
    calcSpentAvg(spent)
    if (!paused) {
      setTimeout(() => universe.step(), delay)
    }
  }

  function onCellClick([col, row]) {
    if (paused) {
      universe.populate([[col, row]])
    }
  }

  function onStart() {
    paused = false
    universe.step()
  }

  function onDelayChange(v) {
    delay = v
  }

}


