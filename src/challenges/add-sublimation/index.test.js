const { h2oMachine } = require('./index')

describe('h2oMachine', () => {
  it('should correctly respond to HEAT', () => {
    expect(h2oMachine.transition('ice', 'HEAT').value).toEqual('water')
    expect(h2oMachine.transition('water', 'HEAT').value).toEqual('vapor')
  })

  it('should correctly respond to COOL', () => {
    expect(h2oMachine.transition('vapor', 'COOL').value).toEqual('water')
    expect(h2oMachine.transition('water', 'COOL').value).toEqual('ice')
  })

  it('should correctly respond to SUBLIMATE', () => {
    expect(h2oMachine.transition('ice', 'SUBLIMATE').value).toEqual('vapor')
    expect(h2oMachine.transition('water', 'SUBLIMATE').value).toEqual('water')
    expect(h2oMachine.transition('vapor', 'SUBLIMATE').value).toEqual('vapor')
  })
})
