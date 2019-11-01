const { Machine } = require('xstate')
const { assert } = require('../../utils')

// Make a door that can be
// closed && locked
// closed && unlocked
// opened && unlocked
// using hierarchical states

// I've only given you a few of the failing assertions, but it should give you
// an idea how to proceed

const doorMachine = Machine({
  id: 'door',
  initial: 'locked',
  states: {
    locked: {},
    unlocked: {},
  },
})

assert(doorMachine.transition('locked', 'UNLOCK').matches('unlocked'), true)
assert(doorMachine.transition('unlocked', 'LOCK').matches('locked'), true)
