const { createMachine, interpret } = require('./index')

const config = {
  id: 'light-bulb',
  initial: 'unlit',
  context: {
    foo: 'bar',
  },
  states: {
    lit: {
      on: {
        TOGGLE: 'unlit',
        BREAK: {
          target: 'broken',
        },
      },
    },
    unlit: {
      on: {
        TOGGLE: 'lit',
        BREAK: {
          target: 'broken',
        },
      },
    },
    broken: {},
  },
}

describe('createMachine', () => {
  it('should have an initialState property', () => {
    const machine = createMachine(config)
    expect(machine.initialState).toEqual({
      value: 'unlit',
      context: { foo: 'bar' },
    })
  })

  it('should have a defined `transition` method', () => {
    const machine = createMachine(config)
    expect(machine.transition).toBeDefined()
  })

  it('should take transition when given a valid state and event', () => {
    const machine = createMachine(config)
    expect(machine.transition('lit', 'TOGGLE')).toEqual({
      value: 'unlit',
      changed: true,
      context: { foo: 'bar' },
    })
    expect(machine.transition('unlit', 'TOGGLE')).toEqual({
      value: 'lit',
      changed: true,
      context: { foo: 'bar' },
    })
    expect(machine.transition('lit', 'BREAK')).toEqual({
      value: 'broken',
      changed: true,
      context: { foo: 'bar' },
    })
    expect(machine.transition('unlit', 'BREAK')).toEqual({
      value: 'broken',
      changed: true,
      context: { foo: 'bar' },
    })
  })

  it('should throw an error when given an invalid state', () => {
    const machine = createMachine(config)
    expect(() => {
      machine.transition('invalidState', 'DOES_NOT_MATTER')
    }).toThrow()
  })

  it('should not transition when given an invalid event', () => {
    const machine = createMachine(config)
    expect(machine.transition('lit', 'INVALID_EVENT')).toEqual({
      value: 'lit',
      changed: false,
      context: { foo: 'bar' },
    })
    expect(machine.transition('unlit', 'INVALID_EVENT')).toEqual({
      value: 'unlit',
      changed: false,
      context: { foo: 'bar' },
    })
    expect(machine.transition('broken', 'INVALID_EVENT')).toEqual({
      value: 'broken',
      changed: false,
      context: { foo: 'bar' },
    })
  })

  it('should fire actions on a transition', () => {
    const litToBrokenAction = jest.fn()
    const machine = createMachine({
      id: 'light-bulb',
      initial: 'unlit',
      context: { foo: 'bar' },
      states: {
        lit: {
          on: {
            TOGGLE: 'unlit',
            BREAK: {
              target: 'broken',
              actions: [litToBrokenAction],
            },
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
    })

    machine.transition('lit', 'BREAK')
    expect(litToBrokenAction).toHaveBeenCalledTimes(1)
    expect(litToBrokenAction).toHaveBeenCalledWith(
      { foo: 'bar' },
      { type: 'BREAK' }
    )
  })

  it('should fire exit actions first, then transition actions, then entry actions', () => {
    const litExitAction = jest.fn()
    const litToBrokenAction = jest.fn()
    const brokenEntryAction = jest.fn()
    const machine = createMachine({
      id: 'light-bulb',
      initial: 'unlit',
      context: { foo: 'bar' },
      states: {
        lit: {
          exit: [litExitAction],
          on: {
            TOGGLE: 'unlit',
            BREAK: {
              target: 'broken',
              actions: [litToBrokenAction],
            },
          },
        },
        unlit: {
          on: {
            TOGGLE: 'lit',
            BREAK: 'broken',
          },
        },
        broken: {
          entry: [brokenEntryAction],
        },
      },
    })

    machine.transition('lit', 'BREAK')
    expect(litExitAction).toHaveBeenCalledTimes(1)
    expect(litExitAction).toHaveBeenCalledWith(
      { foo: 'bar' },
      { type: 'BREAK' }
    )
    expect(litToBrokenAction).toHaveBeenCalledTimes(1)
    expect(litToBrokenAction).toHaveBeenCalledWith(
      { foo: 'bar' },
      { type: 'BREAK' }
    )
    expect(brokenEntryAction).toHaveBeenCalledTimes(1)
    expect(brokenEntryAction).toHaveBeenCalledWith(
      { foo: 'bar' },
      { type: 'BREAK' }
    )
    expect(litExitAction).toHaveBeenCalledBefore(litToBrokenAction)
    expect(litToBrokenAction).toHaveBeenCalledBefore(brokenEntryAction)
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
    expect(service.currentState()).toEqual({
      value: 'unlit',
      context: { foo: 'bar' },
    })
  })

  it('should have a send method that receives an event and transitions the machine', () => {
    service.send('TOGGLE')
    expect(service.currentState()).toEqual({
      value: 'lit',
      changed: true,
      context: { foo: 'bar' },
    })
    service.send('TOGGLE')
    expect(service.currentState()).toEqual({
      value: 'unlit',
      changed: true,
      context: { foo: 'bar' },
    })
    service.send('BREAK')
    expect(service.currentState()).toEqual({
      value: 'broken',
      changed: true,
      context: { foo: 'bar' },
    })
  })

  it('should have a subscribe method that calls listeners on start and every transition', () => {
    const listener = jest.fn()
    const { unsubscribe } = service.subscribe(listener)

    // Should call on start
    service.start()
    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledWith({
      value: 'unlit',
      context: { foo: 'bar' },
    })

    // Should call on send
    service.send('TOGGLE')
    expect(listener).toHaveBeenCalledTimes(2)
    expect(listener).toHaveBeenCalledWith({
      value: 'lit',
      changed: true,
      context: { foo: 'bar' },
    })

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
