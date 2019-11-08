# Intro to State Machines and XState Workshop

Welcome to my workshop on State Machines and the XState library. I'm really excited to have the opportunity to share this topic with you and help you learn it.

## Things You Need Before Starting

In order to maximize your experience of the workshop, please do the following before the workshop starts:

- Install and setup [Zoom](https://zoom.us) on the computer you will be using
- If you are unfamiliar with Zoom, watch Kent C. Dodds's free lesson [Use Zoom for KCD Workshops](https://egghead.io/lessons/egghead-use-zoom-for-kcd-workshops)

You will also need either a:

- A text editor - such as [VSCode](https://code.visualstudio.com/)
- Git - so you can clone this repository
- Node & `npm` or `yarn` - so you can install the packages and run the code in this repository

Or:

- Use [Codesandbox](https://codesandbox.io)
- You can fork [this template](https://codesandbox.io/s/xstate-template-9cerx) to do the exercises contained in this repo

If you would like to have local access to the code and to follow along, I recommend forking this repo. If you do fork this repo, be sure to run `npm install` or `yarn install` from the root directory. This will enable you to run any tests to verify your work.

If you are working on a section or a challenge, you can easily run the tests for that section alone by changing to the correct directory and either running `npm run test` or `yarn run test`. You may also run the tests in `watch` mode by running `npm run test:watch` or `yarn run test:watch`

## Workshop Outline

- Section 1
  - Understanding "state" in the context of state machines
  - A stateless light bulb
  - A working light bulb
  - A more accurate, but problematic, light bulb
    - Boolean complexity
    - Impossible states
  - A better light bulb
    - Enumerate possible states
    - Enumerate possible transitions
    - Learning to think in Directed Graphs
- Section 2
  - Define Finite State Machines (FSMs)
  - Building a simple FSM
    - Creating our `config`
    - Creating `createMachine`
      - `transition(state, event)`
    - Creating an `interpret`er
      - `currentState()`
      - `start`, `stop`, and `send`
      - `subscribe(listener)`
    - Improving state objects
      - Normalize state objects with `toStateObject(state)`
      - `state.changed`
    - Adding Actions
      - Actions on Transition
        - `toTransitionObject(transition)`
        - Destructure our `actions = []` and return it in our state objects
        - Add `event` as an argument to our actions
        - Normalize event objects with `toEventObject(event)`
        - Call our `actions` in `send`
      - Actions on state entry
        - `concat` entry with `actions`
      - Actions on state exit
        - `concat` exit with `actions` and `entry`
      - Order of actions
      - Updating initialState to have `entry` actions
        - `toArray` helper
      - Normalize actions with `toActionObject`
        - Update `send` to use `exec`
    - Adding Context, Extended State
      - What are infinite states?
      - A new example, a smart light bulb
      - Adding `context` to our config
      - Adding `CHANGE_COLOR` event
      - Adding the `assign(context, event)` action object factory
        - The two signatures of `assign`
        - Filtering `assign` actions
        - `assign` gotchas and unexpected results
        - Updating `changed` if `assigned`
        - Passing in `context` to our `actions`
    - Adding Guards
      - Destructure `cond` from transition object
      - Use `cond(context, event)`
      - Enable multiple potential transitions
- Section 3
  - Xstate Viz
  - Hierarchical States
  - Parallel States
  - History States
  - Activities
  - More on Transitions
    - Internal vs External Transitions
  - Null Events & Transient Transitions
  - Delayed Events and Transitions
  - Invoking Services
    - Promises
    - Callbacks
    - Observables
    - Machines
