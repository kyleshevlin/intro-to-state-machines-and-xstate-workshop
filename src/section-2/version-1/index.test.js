const { createMachine } = require('./index')

const config = {
  id: 'light-bulb',
  initial: 'unlit',
  states: {
    lit: {
      on: {
        TOGGLE: 'unlit',
        BREAK: 'broken',
      },
    },
    unlit: {
      on: {
        TOGGLE: 'lit',
        BREAK: 'broken',
      },
    },
    broken: {},
  },
}

describe('createMachine', () => {
  it('should have a defined `transition` method', () => {
    const machine = createMachine(config)
    expect(machine.transition).toBeDefined()
  })

  it('should take transition when given a valid state and event', () => {
    const machine = createMachine(config)
    expect(machine.transition('lit', 'TOGGLE')).toEqual('unlit')
    expect(machine.transition('unlit', 'TOGGLE')).toEqual('lit')
    expect(machine.transition('lit', 'BREAK')).toEqual('broken')
    expect(machine.transition('unlit', 'BREAK')).toEqual('broken')
  })

  it('should throw an error when given an invalid state', () => {
    const machine = createMachine(config)
    expect(() => {
      machine.transition('invalidState', 'DOES_NOT_MATTER')
    }).toThrow()
  })

  it('should not transition when given an invalid event', () => {
    const machine = createMachine(config)
    expect(machine.transition('lit', 'INVALID_EVENT')).toEqual('lit')
    expect(machine.transition('unlit', 'INVALID_EVENT')).toEqual('unlit')
    expect(machine.transition('broken', 'INVALID_EVENT')).toEqual('broken')
  })
})
