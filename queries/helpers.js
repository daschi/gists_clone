const offset = function (page, limit) {
  return limit * (page - 1)
}

module.exports = {offset}
