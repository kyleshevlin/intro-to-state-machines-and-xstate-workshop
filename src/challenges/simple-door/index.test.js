const { doorMachine } = require('./index')

describe('doorMachine', () => {
  it('should handle UNLOCK correctly', () => {
    const nextState = doorMachine.transition('locked', 'UNLOCK')
    expect(nextState.value).toEqual({ unlocked: 'closed' })
  })

  it('should handle OPEN correctly', () => {
    expect(
      doorMachine.transition({ unlocked: 'closed' }, 'OPEN').value
    ).toEqual({
      unlocked: { opened: 'deadboltDisengaged' },
    })
  })

  it('should handle LOCK correctly', () => {
    expect(
      doorMachine.transition({ unlocked: 'closed' }, 'LOCK').value
    ).toEqual('locked')
    expect(
      doorMachine.transition({ unlocked: 'opened' }, 'LOCK').changed
    ).toEqual(false)
  })

  it('should handle CLOSE correctly', () => {
    expect(
      doorMachine.transition(
        { unlocked: { opened: 'deadboltDisengaged' } },
        'CLOSE'
      ).value
    ).toEqual({ unlocked: 'closed' })
    expect(
      doorMachine.transition(
        { unlocked: { opened: 'deadboltEngaged' } },
        'CLOSE'
      ).changed
    ).toEqual(false)
  })
})
