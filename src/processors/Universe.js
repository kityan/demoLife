class Universe {

  constructor({ size, onIterationComplete, onPopulateComplete }) {
    this.size = size
    this.onIterationComplete = onIterationComplete
    this.onPopulateComplete = onPopulateComplete
    const { cols, rows } = size
    this.universeState = Array(cols).fill().map(v => Array(rows).fill())
  }

  showDebugTree(tree) {
    const show = (tree, level) => {
      console.log(new Array(level).fill('\t').join('') + tree.from.join(';') + ' -> ' + tree.to.join(';'))
      level++
      tree.children && tree.children.forEach(tree => show(tree, level))
    }
    show(tree, 0)
  }

  getQuadtree(birthlog, keeplog, necrolog) {
    const tree = { from: [0, 0], to: [this.size.cols - 1, this.size.rows - 1], sleepy: true, children: null };
    [...birthlog, ...keeplog, ...necrolog].forEach(cell => processTree(tree, cell, 0))

    //this.showDebugTree(tree)

    return tree
  }

  populate(seeds) {
    const birthlog = []
    const necrolog = []
    const us = this.universeState

    seeds.forEach(([x, y]) => {
      if (!us[x][y]) {
        birthlog.push([x, y])
      } else {
        necrolog.push([x, y])
      }
      us[x][y] = !us[x][y]
    })
    const totalSeeds = []
    for (let i = 0; i < us.length; i++) {
      for (let j = 0; j < us[i].length; j++) {
        if (us[i][j]) { totalSeeds.push([i, j]) }
      }
    }
    this.onPopulateComplete(this.universeState, birthlog, necrolog, totalSeeds)
  }

  step() {

    const start = Date.now()
    const birthlog = []
    const necrolog = []
    const keeplog = []
    const us = this.universeState

    for (let i = 0; i < us.length; i++) {
      for (let j = 0; j < us[i].length; j++) {
        const adjacent = this.getAdjacent(i, j)
        const neighborsCounter = adjacent.reduce((sum, [x, y]) => sum += us[x][y] ? 1 : 0, 0)
        if (us[i][j]) {
          if (neighborsCounter < 2 || neighborsCounter > 3) {
            necrolog.push([i, j])
          } else {
            keeplog.push([i, j])
          }
        } else
          if (neighborsCounter === 3) {
            birthlog.push([i, j])
          }
      }
    }

    birthlog.forEach(([x, y]) => this.universeState[x][y] = true)
    necrolog.forEach(([x, y]) => this.universeState[x][y] = false)

    const tree = this.getQuadtree(birthlog, keeplog, necrolog)

    const spent = Date.now() - start
    this.onIterationComplete(this.universeState, birthlog, necrolog, spent, tree)
  }

  getAdjacent(x, y) {
    const { cols, rows } = this.size

    const N = [
      x,
      y === 0 ? rows - 1 : y - 1,
    ]
    const NW = [
      x === 0 ? cols - 1 : x - 1,
      y === 0 ? rows - 1 : y - 1,
    ]
    const W = [
      x === 0 ? cols - 1 : x - 1,
      y,
    ]
    const SW = [
      x === 0 ? cols - 1 : x - 1,
      y === rows - 1 ? 0 : y + 1,
    ]
    const S = [
      x,
      y === rows - 1 ? 0 : y + 1,
    ]
    const SE = [
      x === cols - 1 ? 0 : x + 1,
      y === rows - 1 ? 0 : y + 1,
    ]
    const E = [
      x === cols - 1 ? 0 : x + 1,
      y,
    ]
    const NE = [
      x === cols - 1 ? 0 : x + 1,
      y === 0 ? rows - 1 : y - 1,
    ]
    return [
      N, NE, E, SE, S, SW, W, NW
    ]
  }


}


function makeSubTree(tree) {
  const { from, to } = tree
  const midX = from[0] + Math.floor((to[0] - from[0]) / 2)
  const midY = from[1] + Math.floor((to[1] - from[1]) / 2)
  return [
    { from, to: [midX, midY] },
    { from: [midX + 1, from[1]], to: [to[0], midY] },
    { from: [from[0], midY + 1], to: [midX, to[1]] },
    { from: [midX + 1, midY + 1], to }
  ].map(item => ({ ...item, sleepy: true, children: null }))
}

function processTree(tree, cell, level) {

  if (
    cell[0] >= tree.from[0] &&
    cell[1] >= tree.from[1] &&
    cell[0] <= tree.to[0] &&
    cell[1] <= tree.to[1]
  ) {
    tree.sleepy = false
    if (!tree.children) {
      // стоит ли делить, не слишком ли маленький регион?
      if (tree.to[0] - tree.from[0] >= 20 && tree.to[1] - tree.from[1] >= 20) {
        tree.children = makeSubTree(tree)
        tree.children.forEach(tree => processTree(tree, cell, ++level))
      }
    } else {
      tree.children.forEach(tree => processTree(tree, cell, ++level))
    }
  }
}


export default Universe
