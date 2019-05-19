const offset = function (page, pageSize) {
  return pageSize * (page - 1)
}

module.exports = {offset}
