import { getAllFlagValues, hasFlag } from "./enum-functions"

enum TestFlagEnum{
  none = 0,
  option1 = 1 << 0,
  option2 = 1 << 1,
  all = option1 | option2
}

describe('enum-functions', () => {
  describe('hasFlag', () => {
    it('should not have flag', () => {
      const value = TestFlagEnum.option1

      const result = hasFlag(value, TestFlagEnum.option2)

      expect(result).toBeFalse()
    })

    it('should have flag', () => {
      const value = TestFlagEnum.all

      const result = hasFlag(value, TestFlagEnum.option2)

      expect(result).toBeTrue()
    })
  })

  describe('getAllFlagValues', () => {
    it('should be empty', () => {
      const value = TestFlagEnum.none

      const result = getAllFlagValues(value, (n) => TestFlagEnum[n])

      expect(result).toBeDefined()
      expect(result.length).toBe(0)
    })

    it('should contain only first flag value', () => {
      const value = TestFlagEnum.option1

      const result = getAllFlagValues(value, (n) => TestFlagEnum[n])

      expect(result).toBeDefined()
      expect(result.length).toBe(1)
      expect(result).toContain(TestFlagEnum[value])
    })

    it('should contain only second flag value', () => {
      const value = TestFlagEnum.option2

      const result = getAllFlagValues(value, (n) => TestFlagEnum[n])

      expect(result).toBeDefined()
      expect(result.length).toBe(1)
      expect(result).toContain(TestFlagEnum[value])
    })

    it('should contain all flag values', () => {
      const value = TestFlagEnum.all

      const result = getAllFlagValues(value, (n) => TestFlagEnum[n])

      expect(result).toBeDefined()
      expect(result).toContain(TestFlagEnum[TestFlagEnum.option1])
      expect(result).toContain(TestFlagEnum[TestFlagEnum.option2])
    })
  })
})
