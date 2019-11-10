const { interpret, Machine } = require('xstate')

const machine = Machine({})

const service = interpret(machine).start()
