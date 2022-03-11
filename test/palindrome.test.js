const { palindrome } = require('../utils/for_testing')

test.skip('palindrome de Óscar', () => {
  const result = palindrome('Óscar')

  expect(result).toBe('racsÓ')
})

test.skip('palindrome of empty string', () => {
  const result = palindrome('')

  expect(result).toBe('')
})

test.skip('palindrome of undefined string', () => {
  const result = palindrome()

  expect(result).toBeUndefined()
})
