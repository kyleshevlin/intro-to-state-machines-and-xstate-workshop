const { createMachine, interpret } = require('./index')

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
  it('should have an initialState property', () => {
    const machine = createMachine(config)
    expect(machine.initialState).toEqual('unlit')
  })

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

describe('interpret', () => {
  let service

  beforeEach(() => {
    service = interpret(createMachine(config)).start()
  })

  afterEach(() => {
    service.stop()
  })

  it('should have a currentState method that returns the current state', () => {
    expect(service.currentState).toBeDefined()
    expect(service.currentState()).toEqual('unlit')
  })

  it('should have a send method that receives an event and transitions the machine', () => {
    service.send('TOGGLE')
    expect(service.currentState()).toEqual('lit')
    service.send('TOGGLE')
    expect(service.currentState()).toEqual('unlit')
    service.send('BREAK')
    expect(service.currentState()).toEqual('broken')
  })

  it('should have a subscribe method that calls listeners on start and every transition', () => {
    const listener = jest.fn()
    const { unsubscribe } = service.subscribe(listener)

    // Should call on start
    service.start()
    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledWith('unlit')

    // Should call on send
    service.send('TOGGLE')
    expect(listener).toHaveBeenCalledTimes(2)
    expect(listener).toHaveBeenCalledWith('lit')

    // Unsubscribe should remove the listener
    unsubscribe()
    service.send('TOGGLE')
    expect(listener).toHaveBeenCalledTimes(2)
  })

  it('should have a stop method that deletes all listeners', () => {
    const listener1 = jest.fn()
    const listener2 = jest.fn()

    service.subscribe(listener1)
    service.subscribe(listener2)

    // Should call on start
    service.start()
    expect(listener1).toHaveBeenCalledTimes(1)
    expect(listener2).toHaveBeenCalledTimes(1)
    service.stop()

    // Should delete listeners on stop
    service.start()
    expect(listener1).toHaveBeenCalledTimes(1)
    expect(listener2).toHaveBeenCalledTimes(1)
  })
})
