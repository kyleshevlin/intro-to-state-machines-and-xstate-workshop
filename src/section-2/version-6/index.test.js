const { assign, createMachine, interpret } = require('./index')

const config = {
  id: 'light-bulb',
  initial: 'unlit',
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
    expect(machine.initialState).toEqual({ actions: [], value: 'unlit' })
  })

  it('should have a defined `transition` method', () => {
    const machine = createMachine(config)
    expect(machine.transition).toBeDefined()
  })

  it('should take transition when given a valid state and event', () => {
    const machine = createMachine(config)
    expect(machine.transition('lit', 'TOGGLE')).toEqual({
      actions: [],
      value: 'unlit',
      changed: true,
    })
    expect(machine.transition('unlit', 'TOGGLE')).toEqual({
      actions: [],
      value: 'lit',
      changed: true,
    })
    expect(machine.transition('lit', 'BREAK')).toEqual({
      actions: [],
      value: 'broken',
      changed: true,
    })
    expect(machine.transition('unlit', 'BREAK')).toEqual({
      actions: [],
      value: 'broken',
      changed: true,
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
      actions: [],
      value: 'lit',
      changed: false,
    })
    expect(machine.transition('unlit', 'INVALID_EVENT')).toEqual({
      actions: [],
      value: 'unlit',
      changed: false,
    })
    expect(machine.transition('broken', 'INVALID_EVENT')).toEqual({
      actions: [],
      value: 'broken',
      changed: false,
    })
  })

  it('should add actions to state object in correct order, current state exit, transition actions, then next state entry', () => {
    const litExitAction = jest.fn()
    const litToBrokenAction = jest.fn()
    const brokenEntryAction = jest.fn()
    const machine = createMachine({
      id: 'light-bulb',
      initial: 'unlit',
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

    expect(machine.transition('lit', 'BREAK')).toEqual({
      value: 'broken',
      actions: [
        { type: 'mockConstructor', exec: litExitAction },
        { type: 'mockConstructor', exec: litToBrokenAction },
        { type: 'mockConstructor', exec: brokenEntryAction },
      ],
      changed: true,
    })
    expect(litExitAction).toHaveBeenCalledTimes(0)
    expect(litToBrokenAction).toHaveBeenCalledTimes(0)
    expect(brokenEntryAction).toHaveBeenCalledTimes(0)
  })

  it('should update context when it encounters an `assign` action', () => {
    const machine = createMachine({
      id: 'counter',
      initial: 'idle',
      context: {
        count: 0,
      },
      states: {
        idle: {
          on: {
            INCREMENT_WITH_OBJECT: {
              target: 'idle',
              actions: [
                assign({
                  count: context => context.count + 1,
                }),
              ],
            },
            INCREMENT_WITH_FUNCTION: {
              target: 'idle',
              actions: [
                assign(context => ({
                  count: context.count + 1,
                })),
              ],
            },
          },
        },
      },
    })

    expect(machine.initialState.context.count).toEqual(0)
    expect(
      machine.transition('idle', 'INCREMENT_WITH_OBJECT').context.count
    ).toEqual(1)
    expect(
      machine.transition('idle', 'INCREMENT_WITH_FUNCTION').context.count
    ).toEqual(1)
  })

  it('should not transition when there is no target', () => {
    const machine = createMachine({
      id: 'multi-choice',
      initial: 'A',
      states: {
        A: {
          on: {
            CHOOSE: {},
          },
        },
      },
    })

    expect(machine.transition('A', 'CHOOSE').value).toEqual('A')
  })

  it('should update context, even if there is no target', () => {
    const machine = createMachine({
      id: 'multi-choice',
      initial: 'A',
      context: {
        foo: 'bar',
      },
      states: {
        A: {
          on: {
            CHOOSE: {
              actions: assign({ foo: 'baz' }),
            },
          },
        },
      },
    })

    const nextState = machine.transition('A', 'CHOOSE')
    expect(nextState.value).toEqual('A')
    expect(nextState.context.foo).toEqual('baz')
  })

  it('should take a transition when a condition is met', () => {
    const machine = createMachine({
      id: 'light-bulb',
      initial: 'lit',
      context: {
        value: 5,
      },
      states: {
        lit: {
          on: {
            TOGGLE: {
              target: 'unlit',
              cond: (context, event) =>
                context.value > 4 && event.foo === 'bar',
            },
          },
        },
        unlit: {},
      },
    })

    expect(
      machine.transition('lit', { type: 'TOGGLE', foo: 'bar' }).value
    ).toEqual('unlit')
  })

  it('should not transition when no condition is met', () => {
    const machine = createMachine({
      id: 'multi-choice',
      initial: 'A',
      states: {
        A: {
          on: {
            CHOOSE: [
              { target: 'B', cond: () => false },
              { target: 'C', cond: () => false },
              { target: 'D', cond: () => false },
            ],
          },
        },
        B: {},
        C: {},
        D: {},
      },
    })

    expect(machine.transition('A', 'CHOOSE').value).toEqual('A')
  })

  it('should take the first transition whose condition is met', () => {
    const machine = createMachine({
      id: 'multi-choice',
      initial: 'A',
      states: {
        A: {
          on: {
            CHOOSE: [
              { target: 'B', cond: () => false },
              { target: 'C', cond: () => true },
              { target: 'D', cond: () => true },
            ],
          },
        },
        B: {},
        C: {},
        D: {},
      },
    })

    expect(machine.transition('A', 'CHOOSE').value).toEqual('C')
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
    expect(service.currentState()).toEqual({ actions: [], value: 'unlit' })
  })

  it('should have a send method that receives an event and transitions the machine', () => {
    service.send('TOGGLE')
    expect(service.currentState()).toEqual({
      actions: [],
      value: 'lit',
      changed: true,
    })
    service.send('TOGGLE')
    expect(service.currentState()).toEqual({
      actions: [],
      value: 'unlit',
      changed: true,
    })
    service.send('BREAK')
    expect(service.currentState()).toEqual({
      actions: [],
      value: 'broken',
      changed: true,
    })
  })

  it('should call all actions when taking a transition via send', () => {
    const litExitAction = jest.fn()
    const litToBrokenAction = jest.fn()
    const brokenEntryAction = jest.fn()
    const machine = createMachine({
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
          exit: [litExitAction],
          on: {
            TOGGLE: 'lit',
            BREAK: {
              target: 'broken',
              actions: [litToBrokenAction],
            },
          },
        },
        broken: {
          entry: [brokenEntryAction],
        },
      },
    })
    service = interpret(machine)
    service.start()

    service.send('BREAK')

    expect(litExitAction).toHaveBeenCalledTimes(1)
    expect(litExitAction).toHaveBeenCalledWith(undefined, { type: 'BREAK' })
    expect(litExitAction).toHaveBeenCalledBefore(litToBrokenAction)
    expect(litToBrokenAction).toHaveBeenCalledTimes(1)
    expect(litToBrokenAction).toHaveBeenCalledWith(undefined, { type: 'BREAK' })
    expect(litToBrokenAction).toHaveBeenCalledBefore(brokenEntryAction)
    expect(brokenEntryAction).toHaveBeenCalledTimes(1)
    expect(brokenEntryAction).toHaveBeenCalledWith(undefined, { type: 'BREAK' })
  })

  it('should have a subscribe method that calls listeners on start and every transition', () => {
    const listener = jest.fn()
    const { unsubscribe } = service.subscribe(listener)

    // Should call on start
    service.start()
    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener).toHaveBeenCalledWith({ actions: [], value: 'unlit' })

    // Should call on send
    service.send('TOGGLE')
    expect(listener).toHaveBeenCalledTimes(2)
    expect(listener).toHaveBeenCalledWith({
      actions: [],
      value: 'lit',
      changed: true,
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
