const { Machine } = require('xstate')

const richTextMachine = Machine({
  id: 'richText',
})

module.exports = {
  richTextMachine,
}
