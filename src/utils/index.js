const assert = (val1, val2, msg) => {
  const opener = val1 === val2 ? '✅ Success' : '❌ Failure'

  console.log(msg ? `${opener}: ${msg}` : opener)
}

module.exports = {
  assert,
}
