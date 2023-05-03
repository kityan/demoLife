class Renderer {


  size = {
    cols: 20,
    rows: 10
  }

  constructor({ size, displayElement, onCellClick }) {
    this.size = size
    this.displayElement = displayElement
    this.onCellClick = onCellClick
  }
}

export default Renderer
