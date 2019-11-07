const { Machine } = require('xstate')

// We're going to make a "smart" door that cannot be locked when it is open
// It can be in the following "states", it is up to you to determine how to make
// them work

// closed && locked
// closed && unlocked
// opened && unlocked

// Solve this using hiearchical state nodes

// Look at the tests if you need hints

const doorMachine = Machine({
  id: 'door',
  initial: 'locked',
  states: {
    locked: {},
    unlocked: {},
  },
})

module.exports = {
  doorMachine,
}
