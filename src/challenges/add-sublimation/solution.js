const { Machine } = require('xstate')

// "Sublimation" is when matter in a solid state goes directly to a gaseous
// state. Add a "SUBLIMATE" event and the correct transition to sublimate water

// For fun, you can also add "Deposition", which is when matter in a gaseous
// state goes directly to aa solid state. Add the tests for it, too.

const h2oMachine = Machine({
  id: 'h2o',
  initial: 'water',
  states: {
    ice: {
      on: {
        HEAT: 'water',
        SUBLIMATE: 'vapor',
      },
    },
    water: {
      on: {
        COOL: 'ice',
        HEAT: 'vapor',
      },
    },
    vapor: {
      on: {
        COOL: 'water',
        DEPOSIT: 'ice',
      },
    },
  },
})

module.exports = {
  h2oMachine,
}
