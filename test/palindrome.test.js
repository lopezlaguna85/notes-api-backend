const { palindrome } = require('../utils/for_testing')

test('palindrome de Óscar', () => {
  const result = palindrome('midudev')

  expect(result).toBe('vedudim')
})
