const { Machine } = require('xstate')

const createSubStates = eventPrefix => ({
  initial: 'disabled',
  states: {
    disabled: {
      on: { [`${eventPrefix}_ENABLE`]: 'enabled' },
    },
    enabled: {
      on: { [`${eventPrefix}_DISABLE`]: 'disabled' },
    },
  },
})

const richTextMachine = Machine({
  id: 'door',
  type: 'parallel',
  states: {
    bold: {
      ...createSubStates('BOLD'),
    },
    italic: {
      ...createSubStates('ITALIC'),
    },
    underline: {
      ...createSubStates('UNDERLINE'),
    },
  },
  on: {
    RESET: [
      { target: '.bold.disabled' },
      { target: '.italic.disabled' },
      { target: '.underline.disabled' },
    ],
  },
})

module.exports = {
  richTextMachine,
}
