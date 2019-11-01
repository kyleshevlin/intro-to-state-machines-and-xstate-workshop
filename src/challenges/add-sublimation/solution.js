const { Machine } = require('xstate')
const { assert } = require('../../utils')

// "Sublimation" is when matter in a solid state goes directly to a gaseous
// state. Add a "SUBLIMATE" event and the correct transition to sublimate water

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
      COOL: 'water',
    },
  },
})

assert(
  h2oMachine.transition('ice', 'SUBLIMATE').value,
  'vapor',
  'Sublimating H2O'
)
