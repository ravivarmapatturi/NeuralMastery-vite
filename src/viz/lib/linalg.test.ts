import { describe, expect, it } from 'vitest'
import {
  cosineSimilarity,
  det2,
  dot,
  matMul,
  matVec2,
  norm,
  powerIteration,
  quadraticForm,
  quadraticFormGradient,
  rank2,
  svdReconstruct,
  svdReconstructionError,
  symmetricEigenvalues2,
  symmetricEigenvector2,
  type Mat2,
} from './linalg'

describe('dot / norm / cosineSimilarity', () => {
  it('dot computes the standard inner product', () => {
    expect(dot([1, 2, 3], [4, 5, 6])).toBe(32)
  })

  it('norm is the square root of the self dot product', () => {
    expect(norm([3, 4])).toBe(5)
  })

  it('cosineSimilarity is 1 for identical direction, 0 for orthogonal, -1 for opposite', () => {
    expect(cosineSimilarity([1, 0], [1, 0])).toBe(1)
    expect(cosineSimilarity([1, 0], [0, 1])).toBe(0)
    expect(cosineSimilarity([1, 0], [-1, 0])).toBe(-1)
  })

  it('cosineSimilarity is scale-invariant', () => {
    expect(cosineSimilarity([2, 3], [4, 6])).toBeCloseTo(cosineSimilarity([2, 3], [1, 1.5]), 10)
  })

  it('cosineSimilarity returns 0 rather than NaN for a zero vector', () => {
    expect(cosineSimilarity([0, 0], [1, 2])).toBe(0)
  })
})

describe('matVec2 / matMul', () => {
  it('matVec2 applies a 2x2 matrix to a 2-vector', () => {
    const A: Mat2 = [
      [2, 0],
      [0, 3],
    ]
    expect(matVec2(A, [5, 7])).toEqual([10, 21])
  })

  it('matMul agrees with matVec2 for a 2x2 * 2x1 case', () => {
    const A: Mat2 = [
      [1, 2],
      [3, 4],
    ]
    const v: [number, number] = [5, 6]
    const viaMatVec = matVec2(A, v)
    const viaMatMul = matMul(A, [[v[0]], [v[1]]])
    expect(viaMatMul).toEqual([[viaMatVec[0]], [viaMatVec[1]]])
  })

  it('matMul computes real matrix multiplication for non-square shapes', () => {
    const A = [
      [1, 2, 3],
      [4, 5, 6],
    ]
    const B = [
      [7, 8],
      [9, 10],
      [11, 12],
    ]
    // Hand-computed: row0.col0 = 1*7+2*9+3*11 = 58, row0.col1 = 1*8+2*10+3*12 = 64
    // row1.col0 = 4*7+5*9+6*11 = 139, row1.col1 = 4*8+5*10+6*12 = 154
    expect(matMul(A, B)).toEqual([
      [58, 64],
      [139, 154],
    ])
  })
})

describe('det2 / rank2', () => {
  it('det2 is the standard 2x2 determinant', () => {
    const A: Mat2 = [
      [1, 2],
      [3, 4],
    ]
    expect(det2(A)).toBe(1 * 4 - 2 * 3)
  })

  it('rank2 is 2 for linearly independent vectors', () => {
    expect(rank2([1, 0], [0, 1])).toBe(2)
  })

  it('rank2 is 1 for parallel (linearly dependent) nonzero vectors', () => {
    expect(rank2([2, 4], [1, 2])).toBe(1)
  })

  it('rank2 is 0 only when both vectors are zero', () => {
    expect(rank2([0, 0], [0, 0])).toBe(0)
    expect(rank2([0, 0], [1, 1])).toBe(1)
  })
})

describe('powerIteration', () => {
  it('converges to the dominant eigenvector direction, matching the closed-form eigenvalue solver', () => {
    // Symmetric A with distinct eigenvalues so the dominant one is unambiguous.
    const A: Mat2 = [
      [2, 1],
      [1, 2],
    ]
    const [lambda1] = symmetricEigenvalues2(A) // larger eigenvalue, by construction below
    const expectedVec = symmetricEigenvector2(A, lambda1)

    const path = powerIteration(A, [1, 0], 50)
    const converged = path[path.length - 1]

    // Power iteration only recovers the eigenvector up to sign.
    const sameSign = Math.abs(converged[0] - expectedVec[0]) < 1e-6
    const flipped = Math.abs(converged[0] + expectedVec[0]) < 1e-6
    expect(sameSign || flipped).toBe(true)
  })

  it('every returned vector after the first is unit norm (renormalized each step)', () => {
    const A: Mat2 = [
      [3, 1],
      [0, 2],
    ]
    const path = powerIteration(A, [1, 1], 10)
    for (const v of path.slice(1)) {
      expect(norm(v)).toBeCloseTo(1, 10)
    }
  })

  it('includes the starting vector unchanged as path[0]', () => {
    const A: Mat2 = [
      [1, 0],
      [0, 1],
    ]
    const path = powerIteration(A, [3, 4], 5)
    expect(path[0]).toEqual([3, 4])
  })
})

describe('symmetricEigenvalues2 / symmetricEigenvector2', () => {
  it('matches the textbook closed form for a diagonal matrix', () => {
    const A: Mat2 = [
      [5, 0],
      [0, 2],
    ]
    const [big, small] = symmetricEigenvalues2(A)
    expect(big).toBe(5)
    expect(small).toBe(2)
  })

  it('eigenvalues satisfy A v = lambda v for the returned eigenvector', () => {
    const A: Mat2 = [
      [2, 1],
      [1, 2],
    ]
    const [lambda1, lambda2] = symmetricEigenvalues2(A)
    for (const lambda of [lambda1, lambda2]) {
      const v = symmetricEigenvector2(A, lambda)
      const Av = matVec2(A, v)
      expect(Av[0]).toBeCloseTo(lambda * v[0], 8)
      expect(Av[1]).toBeCloseTo(lambda * v[1], 8)
    }
  })

  it('eigenvalues sum to the trace and multiply to the determinant', () => {
    const A: Mat2 = [
      [4, 1],
      [1, 3],
    ]
    const [l1, l2] = symmetricEigenvalues2(A)
    expect(l1 + l2).toBeCloseTo(A[0][0] + A[1][1], 10)
    expect(l1 * l2).toBeCloseTo(det2(A), 10)
  })
})

describe('svdReconstruct / svdReconstructionError (Eckart-Young)', () => {
  it('rank-3 (full) reconstruction has zero error', () => {
    expect(svdReconstructionError(3)).toBe(0)
  })

  it('reconstruction error equals sqrt of the sum of squared dropped singular values', () => {
    // SVD_SINGULAR_VALUES = [6, 2, 0.5]
    expect(svdReconstructionError(0)).toBeCloseTo(Math.sqrt(6 ** 2 + 2 ** 2 + 0.5 ** 2), 10)
    expect(svdReconstructionError(1)).toBeCloseTo(Math.sqrt(2 ** 2 + 0.5 ** 2), 10)
    expect(svdReconstructionError(2)).toBeCloseTo(Math.sqrt(0.5 ** 2), 10)
  })

  it('reconstruction error is monotonically non-increasing as k grows (Eckart-Young optimality)', () => {
    const errors = [0, 1, 2, 3].map(svdReconstructionError)
    for (let i = 1; i < errors.length; i++) {
      expect(errors[i]).toBeLessThanOrEqual(errors[i - 1])
    }
  })

  it('svdReconstruct(0) is the zero matrix', () => {
    expect(svdReconstruct(0)).toEqual([
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ])
  })
})

describe('quadraticForm / quadraticFormGradient', () => {
  it('quadraticForm computes x^T A x', () => {
    const A: Mat2 = [
      [2, 0],
      [0, 3],
    ]
    // x^T A x for x=[1,2]: 2*1^2 + 3*2^2 = 2 + 12 = 14
    expect(quadraticForm(A, [1, 2])).toBe(14)
  })

  it('gradient of x^T A x for symmetric A is 2Ax', () => {
    const A: Mat2 = [
      [2, 1],
      [1, 2],
    ]
    const x: [number, number] = [1, 1]
    const grad = quadraticFormGradient(A, x)
    const Ax = matVec2(A, x)
    expect(grad).toEqual([2 * Ax[0], 2 * Ax[1]])
  })

  it('gradient matches a numerical finite-difference approximation', () => {
    const A: Mat2 = [
      [3, 1],
      [1, 2],
    ]
    const x0: [number, number] = [0.7, -0.4]
    const h = 1e-6
    const f = (v: [number, number]) => quadraticForm(A, v)
    const numGrad = [
      (f([x0[0] + h, x0[1]]) - f([x0[0] - h, x0[1]])) / (2 * h),
      (f([x0[0], x0[1] + h]) - f([x0[0], x0[1] - h])) / (2 * h),
    ]
    const analytic = quadraticFormGradient(A, x0)
    expect(analytic[0]).toBeCloseTo(numGrad[0], 4)
    expect(analytic[1]).toBeCloseTo(numGrad[1], 4)
  })
})
