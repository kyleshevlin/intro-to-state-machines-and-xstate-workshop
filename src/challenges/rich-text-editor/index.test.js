const { richTextMachine } = require('./index')

describe('rich text machine', () => {
  it('should initialize with all states disabled', () => {
    expect(richTextMachine.initialState.value).toEqual({
      bold: 'disabled',
      italic: 'disabled',
      underline: 'disabled',
    })
  })

  it('should respond to events intended only for that substate', () => {
    expect(
      richTextMachine.transition(
        {
          bold: 'disabled',
          italic: 'disabled',
          underline: 'disabled',
        },
        'BOLD_ENABLE'
      ).value
    ).toEqual({
      bold: 'enabled',
      italic: 'disabled',
      underline: 'disabled',
    })
    expect(
      richTextMachine.transition(
        {
          bold: 'disabled',
          italic: 'disabled',
          underline: 'disabled',
        },
        'ITALIC_ENABLE'
      ).value
    ).toEqual({
      bold: 'disabled',
      italic: 'enabled',
      underline: 'disabled',
    })
    expect(
      richTextMachine.transition(
        {
          bold: 'disabled',
          italic: 'disabled',
          underline: 'disabled',
        },
        'UNDERLINE_ENABLE'
      ).value
    ).toEqual({
      bold: 'disabled',
      italic: 'disabled',
      underline: 'enabled',
    })
  })

  it('should reset all states on RESET', () => {
    expect(
      richTextMachine.transition(
        {
          bold: 'enabled',
          italic: 'enabled',
          underline: 'enabled',
        },
        'RESET'
      ).value
    ).toEqual({
      bold: 'disabled',
      italic: 'disabled',
      underline: 'disabled',
    })
  })
})
