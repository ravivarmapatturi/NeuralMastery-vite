import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import ProblemPanel from './ProblemPanel';
import type { PracticeProblem } from '../../lib/practiceProblem';
import type { DocPage } from '../../lib/contentTree';

const mockProblem: PracticeProblem = {
  id: 'test-dot-product',
  title: 'Test Dot Product',
  difficulty: 'easy',
  topic: 'mathematics-for-ai',
  estimatedTime: '15 mins',
  functionName: 'dot_product',
  functionSignature: 'def dot_product(a: list[float], b: list[float]) -> float:',
  starterCode: 'def dot_product(a, b):\n    pass\n',
  mission: 'Compute the scalar dot product of two vectors.',
  taskDescription: 'Multiply pairwise elements and accumulate.',
  constraints: ['len(a) == len(b)', 'len(a) >= 1'],
  testCases: [
    {
      id: 'tc1',
      label: 'Simple 2D',
      input: { a: [1, 2], b: [3, 4] },
      expectedOutput: 11,
      description: '1*3 + 2*4 = 11',
    },
  ],
  hints: {
    small: 'Consider looping over zip(a, b).',
    strong: 'Multiply a[i] * b[i] and accumulate to total.',
    concept: 'Inner products reflect geometric alignment.',
  },
  runtime: { language: 'python', capabilities: ['python'] },
};

const mockLesson: DocPage = {
  slug: 'mathematics-for-ai/overview',
  route: '/docs/mathematics-for-ai/overview',
  title: 'Mathematics for AI Overview',
  sidebarPosition: 1,
  section: 'mathematics-for-ai',
  Component: () => null,
};

describe('ProblemPanel', () => {
  it('renders checkmark Solved badge without gold or bronze distinction', () => {
    render(
      <MemoryRouter>
        <ProblemPanel problem={mockProblem} solved={true} masteryTier="gold" />
      </MemoryRouter>,
    );
    expect(screen.getByText('✓ Solved')).toBeInTheDocument();
    expect(screen.queryByText(/Solved independently/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Solved with hints/i)).not.toBeInTheDocument();
  });

  it('renders "Study this concept first →" link when relatedLesson is provided', () => {
    render(
      <MemoryRouter>
        <ProblemPanel problem={mockProblem} relatedLesson={mockLesson} />
      </MemoryRouter>,
    );
    const link = screen.getByRole('link', { name: /Study this concept first →/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/docs/mathematics-for-ai/overview');
  });

  it('renders the mechanically-generated step-by-step walkthrough in the Worked Intuition tab', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ProblemPanel problem={mockProblem} />
      </MemoryRouter>,
    );

    const intuitionTab = screen.getByRole('button', { name: /Worked Intuition/i });
    await user.click(intuitionTab);

    expect(screen.getByText(/How to Solve This, Step by Step/i)).toBeInTheDocument();
    expect(screen.getByText(/Step 1: Frame the Goal & Invariants/i)).toBeInTheDocument();
    expect(screen.getByText('Consider looping over zip(a, b).')).toBeInTheDocument();
    expect(screen.getByText(/Step 2: Implementation Walkthrough/i)).toBeInTheDocument();
    expect(screen.getByText('Multiply a[i] * b[i] and accumulate to total.')).toBeInTheDocument();
    expect(screen.getByText(/Step 3: Core Concept & Numerical Properties/i)).toBeInTheDocument();
    expect(screen.getByText('Inner products reflect geometric alignment.')).toBeInTheDocument();
  });
});
