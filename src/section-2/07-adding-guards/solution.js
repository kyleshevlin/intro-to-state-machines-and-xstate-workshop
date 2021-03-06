const toArray = value => (value === undefined ? [] : [].concat(value))

const toStateObject = state =>
  typeof state === 'string' ? { value: state } : state

const toEventObject = event =>
  typeof event === 'string' ? { type: event } : event

const toTransitionObject = transition =>
  typeof transition === 'string' ? { target: transition } : transition

const toActionObject = action => {
  switch (true) {
    case typeof action === 'string':
      return { type: action }

    case typeof action === 'function':
      return { type: action.name, exec: action }

    default:
      return action
  }
}

const ASSIGN_ACTION_TYPE = '__assign__'

const assign = assignment => ({
  type: ASSIGN_ACTION_TYPE,
  assignment,
})

function createMachine(config) {
  const { context, id, initial, states } = config

  return {
    initialState: {
      actions: toArray(states[initial].entry).map(toActionObject),
      context,
      value: initial,
    },
    transition(state, event) {
      const { value } = toStateObject(state)
      const stateConfig = states[value]

      if (!stateConfig) {
        throw new Error(
          `Machine '${id}' does not have a state named '${value}'`
        )
      }

      const transitionFailure = {
        actions: [],
        changed: false,
        context,
        value,
      }

      if (!stateConfig.on) {
        return transitionFailure
      }

      const eventObject = toEventObject(event)
      const transitions = toArray(stateConfig.on[eventObject.type])

      for (const transition of transitions) {
        if (!transition) {
          return transitionFailure
        }

        const {
          target = value,
          actions = [],
          cond = () => true,
        } = toTransitionObject(transition)

        if (cond(context, eventObject)) {
          let assigned = false
          let nextContext = context
          const nextStateConfig = states[target]

          const allActions = []
            .concat(stateConfig.exit, actions, nextStateConfig.entry)
            .filter(Boolean)
            .map(toActionObject)
            .filter(action => {
              const { assignment, type } = action

              if (type !== ASSIGN_ACTION_TYPE) {
                return true
              }

              assigned = true
              let tempContext = { ...nextContext }

              if (typeof assignment === 'function') {
                tempContext = assignment(nextContext, eventObject)
              } else {
                Object.keys(assignment).forEach(key => {
                  tempContext[key] =
                    typeof assignment[key] === 'function'
                      ? assignment[key](nextContext, eventObject)
                      : assignment[key]
                })
              }

              nextContext = tempContext
              return false
            })

          return {
            actions: allActions,
            changed: target !== value || allActions.length > 0 || assigned,
            context: nextContext,
            value: target,
          }
        }
      }

      // In the case where no conditions were met
      return transitionFailure
    },
  }
}

function interpret(machine) {
  let state = machine.initialState
  let isStarted = false
  const listeners = new Set()

  const service = {
    currentState: () => state,
    send: event => {
      if (!isStarted) {
        return
      }

      state = machine.transition(state, event)
      state.actions.forEach(({ exec }) => {
        exec && exec(state.context, toEventObject(event))
      })
      listeners.forEach(listener => listener(state))
    },
    start: () => {
      isStarted = true
      listeners.forEach(listener => listener(state))
      return service
    },
    stop: () => {
      isStarted = false
      listeners.forEach(listener => listeners.delete(listener))
      return service
    },
    subscribe: listener => {
      listeners.add(listener)

      return {
        unsubscribe: () => listeners.delete(listener),
      }
    },
  }

  return service
}

module.exports = {
  assign,
  createMachine,
  interpret,
}
