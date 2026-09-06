import { describe, expect, it } from 'vitest'
import { isSyntaxError, statusFor } from './pyodideExecutor'
import type { CaseExecutionResult } from './types'

const passed = (id: string): CaseExecutionResult => ({ testCaseId: id, passed: true, actualOutput: null, error: null })
const failedWrong = (id: string): CaseExecutionResult => ({ testCaseId: id, passed: false, actualOutput: 0, error: null })
const failedError = (id: string): CaseExecutionResult => ({ testCaseId: id, passed: false, actualOutput: null, error: 'Traceback...\nZeroDivisionError: division by zero' })

describe('isSyntaxError', () => {
  it('recognizes a real Python SyntaxError traceback', () => {
    expect(isSyntaxError('  File "<exec>", line 2\nSyntaxError: invalid syntax')).toBe(true)
  })

  it('recognizes IndentationError too -- a real, distinct Python exception that also means the code never ran', () => {
    expect(isSyntaxError('IndentationError: expected an indented block')).toBe(true)
  })

  it('is false for a genuine runtime exception, not just "any traceback"', () => {
    expect(isSyntaxError('ZeroDivisionError: division by zero')).toBe(false)
  })

  it('is false for null/undefined (no error at all)', () => {
    expect(isSyntaxError(null)).toBe(false)
    expect(isSyntaxError(undefined)).toBe(false)
  })
})

describe('statusFor', () => {
  it('is "syntax_error" when the setup itself failed to parse, not "runtime_error"', () => {
    expect(statusFor([], 'SyntaxError: invalid syntax')).toBe('syntax_error')
  })

  it('is "runtime_error" when setup failed for a real (non-syntax) reason', () => {
    expect(statusFor([], 'NameError: name \'x\' is not defined')).toBe('runtime_error')
  })

  it('is "success" when every real case passed', () => {
    expect(statusFor([passed('a'), passed('b')], null)).toBe('success')
  })

  it('is "wrong_answer" when a case ran cleanly but returned the wrong value -- not "runtime_error"', () => {
    expect(statusFor([passed('a'), failedWrong('b')], null)).toBe('wrong_answer')
  })

  it('is "runtime_error" when a case raised a real exception during the call, distinct from a wrong answer', () => {
    expect(statusFor([passed('a'), failedError('b')], null)).toBe('runtime_error')
  })

  it('is "runtime_error" for zero case results with no setup error either -- a real, if unexpected, empty-run state', () => {
    expect(statusFor([], null)).toBe('runtime_error')
  })
})
