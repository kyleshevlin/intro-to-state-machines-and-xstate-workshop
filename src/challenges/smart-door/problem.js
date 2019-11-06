const { Machine } = require('xstate')
const { assert } = require('../../utils')

// We're going to make a "smart" door that cannot be locked when it is open
// It can be in the following "states", it is up to you to determine how to make
// them work

// closed && locked
// closed && unlocked
// opened && unlocked

// Solve this using hiearchical state nodes

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
