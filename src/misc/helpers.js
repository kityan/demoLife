export function getCalcSpentAvg(onAverageReady) {
  const _spentAvg = { sum: 0, n: 0 }
  let spentAvg = { ..._spentAvg }
  return spent => {
    // оценка затрат времени на расчёты
    spentAvg.sum += spent
    spentAvg.n++
    if (spentAvg.n === 10) {
      onAverageReady(10, (spentAvg.sum / 10).toFixed(1))
      spentAvg = { ..._spentAvg }
    }
  }
}


export function getCalcSpentAvg2(onAverageReady) {
  const values = []
  return spent => {
    values.push(spent)
    if (values.length > 10) {
      values.shift()
    }
    onAverageReady(values.length, (values.reduce((sum, v) => sum + v, 0) / values.length).toFixed(1))
  }
}
