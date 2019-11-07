const { doorMachine } = require('./index')

describe('smart door', () => {
  it('should respond to UNLOCK correctly', () => {
    expect(doorMachine.transition('locked', 'UNLOCK').value).toEqual({
      unlocked: 'closed',
    })
  })

  it('should respond to LOCK correctly', () => {
    expect(doorMachine.transition('unlocked', 'LOCK').value).toEqual('locked')
    expect(
      doorMachine.transition({ unlocked: 'opened' }, 'LOCK').changed
    ).toEqual('false')
  })

  it('should respond to OPEN correctly', () => {
    expect(doorMachine.transition('unlocked', 'OPEN').value).toEqual({
      unlocked: 'opened',
    })
    expect(doorMachine.transition('locked', 'OPEN').changed).toEqual(false)
  })

  it('should respond to CLOSE correctly', () => {
    expect(
      doorMachine.transition({ unlocked: 'opened' }, 'CLOSE').value
    ).toEqual({ unlocked: 'closed' })
  })
})
