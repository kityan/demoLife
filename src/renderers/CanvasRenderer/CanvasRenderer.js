import classes from './CanvasRenderer.scss'
import Renderer from '../Renderer'
class CanvasRenderer extends Renderer {

  canvas = null
  lastKnownUniverseState = null

  translateY = 0
  translateX = 0

  cellSizeAtScale1 = 10
  scale = 1
  align = 0.5

  constructor(args) {
    super(args)

    this.draggable = false
    this.skipNextOnClick = false

    this.cellSizeAtScale1 = args.cellSizeAtScale1 || this.cellSizeAtScale1
    this.cellSize = this.cellSizeAtScale1

    this.prepareDOM()

    window.addEventListener('resize', this.onWindowResize.bind(this))
  }

  prepareDOM() {
    const wrapper = document.createElement('div')

    wrapper.classList.add(classes.wrapper)
    wrapper.addEventListener('wheel', this.onWrapperWheel.bind(this))

    const canvas = document.createElement('canvas')
    canvas.classList.add(classes.canvas)
    canvas.addEventListener('click', this.onCanvasClick.bind(this))
    canvas.addEventListener('mousedown', this.onMouseDown.bind(this))
    canvas.addEventListener('mouseout', this.onMouseOut.bind(this))
    canvas.addEventListener('mousemove', this.onMouseMove.bind(this))
    canvas.addEventListener('mouseup', this.onMouseUp.bind(this))

    const ctx = canvas.getContext("2d")
    this.ctx = ctx

    this.displayElement.appendChild(wrapper)
    wrapper.appendChild(canvas)

    this.wrapper = wrapper
    this.canvas = canvas

    this.setCanvasSize()
    this.drawGrid()
  }

  setCanvasSize() {
    this.canvas.setAttribute('width', this.wrapper.clientWidth)
    this.canvas.setAttribute('height', this.wrapper.clientHeight)
  }

  drawLine(ctx, x1, y1, x2, y2) {
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }


  setCell(x, y, alive = false) {
    const { align, cellSize: cs, ctx } = this
    ctx.fillStyle = 'black'
    ctx[alive ? 'fillRect' : 'clearRect'](
      cs * x + align * 2 + Math.round(this.translateX * this.scale),
      cs * y + align * 2 + Math.round(this.translateY * this.scale),
      cs - align * 2,
      cs - align * 2
    )
  }

  drawGrid() {

    const { cols, rows } = this.size
    const { align, cellSize: cs, ctx } = this
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    ctx.strokeStyle = 'lightgray'
    ctx.lineWidth = 1

    const tx = Math.round(this.translateX * this.scale)
    const ty = Math.round(this.translateY * this.scale)

    for (let y = 0; y <= rows; y++) {
      this.drawLine(
        ctx,
        align + tx,
        y * cs + align + ty,
        cols * cs + align + tx,
        y * cs + align + ty
      )
    }

    for (let x = 0; x <= cols; x++) {
      this.drawLine(
        ctx,
        x * cs + align + tx,
        align + ty,
        x * cs + align + tx,
        rows * cs + align + ty
      )
    }

  }

  onWrapperWheel(e) {
    const zoomUp = (e.deltaY < 1)
    const scale = this.scale * (zoomUp ? 2 : 0.5)
    const cs = this.cellSizeAtScale1 * scale

    if (cs > 1) {

      // смещение
      this.translateX += ((e.offsetX / this.scale) * (this.scale - scale) / scale)
      this.translateY += ((e.offsetY / this.scale) * (this.scale - scale) / scale)

      this.cellSize = cs
      this.scale = scale
      this.redraw()
    }
  }

  onWindowResize() {
    this.setCanvasSize()
    this.redraw()
  }

  onCanvasClick(e) {
    if (this.skipNextOnClick) {
      this.skipNextOnClick = false
      return
    }

    const col = Math.floor((e.offsetX - this.translateX * this.scale) / this.cellSize)
    const row = Math.floor((e.offsetY - this.translateY * this.scale) / this.cellSize)
    if (col >= 0 && col < this.size.cols && row >= 0 && row < this.size.rows) {
      this.onCellClick([col, row])
    }
  }

  onMouseDown(e) {
    this.draggable = true
  }

  onMouseUp(e) {
    this.draggable = false
  }

  onMouseMove(e) {
    if (this.draggable) {
      this.translateX += e.movementX / this.scale
      this.translateY += e.movementY / this.scale
      this.redraw()
      this.skipNextOnClick = true
    }
  }

  onMouseOut(e) {
    this.draggable = false
  }

  redraw() {
    this.drawGrid()
    this.redrawLastKnownUniverseState()
  }

  redrawLastKnownUniverseState() {
    const us = this.lastKnownUniverseState
    if (us) {
      for (let i = 0; i < us.length; i++) {
        for (let j = 0; j < us[i].length; j++) {
          if (us[i][j]) {
            this.setCell(i, j, true)
          }
        }
      }
    }

    if (this.lastKnownQuadtree) {
      this.drawSleepy(this.lastKnownQuadtree)
    }

  }

  drawSleepy(tree) {
    if (!tree.children) {
      if (tree.sleepy) {
        const { align, cellSize: cs, ctx } = this
        ctx.fillStyle = 'rgba(0, 255, 0, 0.5)'
        ctx.fillRect(
          cs * tree.from[0] + align * 2 + Math.round(this.translateX * this.scale),
          cs * tree.from[1] + align * 2 + Math.round(this.translateY * this.scale),
          cs * (tree.to[0] - tree.from[0] + 1) - align * 2,
          cs * (tree.to[1] - tree.from[1] + 1) - align * 2
        )
      }
    } else {
      tree.children.forEach(tree => this.drawSleepy(tree))
    }
  }

  render(universeState, birthlog, necrolog, quadtree) {

    // для this.redrawLastKnownUniverseState()
    this.lastKnownUniverseState = universeState
    this.lastKnownQuadtree = quadtree


    if (!quadtree) {
      // штатно рисуем/затираем только обновления
      for (let i = 0; i < birthlog.length; i++) {
        this.setCell(birthlog[i][0], birthlog[i][1], true)
      }
      for (let i = 0; i < necrolog.length; i++) {
        this.setCell(necrolog[i][0], necrolog[i][1], false)
      }
    }

    // если ренденрим в дебаге quadtree, то всё надо перерисовать, как и при pan/zoom
    if (quadtree) {
      this.redraw()
      this.drawSleepy(quadtree)
    }


  }

}


export default CanvasRenderer

