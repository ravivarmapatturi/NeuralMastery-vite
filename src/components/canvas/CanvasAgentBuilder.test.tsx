import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CanvasAgentBuilder from './CanvasAgentBuilder';
import { GamificationProvider } from '../../contexts/GamificationContext';
import { AuthProvider } from '../../contexts/AuthContext';
import { ThemeProvider } from '../../theme/ThemeProvider';
import { getPracticeProblem } from '../../lib/practiceProblem';

// Mock ResizeObserver for happy-dom
window.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('CanvasAgentBuilder Component', () => {
  const problem = getPracticeProblem('react-agent-loop')!;
  const canvasSpec = problem.canvasSpec!;

  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  function renderBuilder(modeToggle?: React.ReactNode) {
    return render(
      <ThemeProvider>
        <AuthProvider>
          <GamificationProvider>
            <CanvasAgentBuilder
              canvasSpec={canvasSpec}
              problemId="react-agent-loop"
              permalink="/practice/react-agent-loop"
              modeToggle={modeToggle}
            />
          </GamificationProvider>
        </AuthProvider>
      </ThemeProvider>,
    );
  }

  it('renders initial toolbar, palette and initial components', () => {
    renderBuilder(<div data-testid="mock-toggle">Toggle</div>);

    expect(screen.getByTestId('mock-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('verify-architecture-btn')).toBeInTheDocument();
    expect(screen.getByText('Clear Wires')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();

    // Check component palette buttons
    expect(screen.getByText('+ LLM Reasoner')).toBeInTheDocument();
    expect(screen.getByText('+ Tool Router')).toBeInTheDocument();
    expect(screen.getByText('+ Memory / Context Store')).toBeInTheDocument();
    expect(screen.getByText('+ Database')).toBeInTheDocument();
    expect(screen.getByText('+ Final Answer')).toBeInTheDocument();
  });

  it('evaluates incomplete topology when Verify Architecture is clicked initially', async () => {
    renderBuilder();
    const user = userEvent.setup();

    const verifyBtn = screen.getByTestId('verify-architecture-btn');
    await user.click(verifyBtn);

    // Verification results panel should appear
    expect(screen.getByTestId('verification-results-panel')).toBeInTheDocument();
    expect(screen.getByText(/Verification Failed/)).toBeInTheDocument();
    expect(screen.getByText('Bidirectional Tool Loop')).toBeInTheDocument();
    expect(screen.getAllByText('Memory / Context Store').length).toBeGreaterThanOrEqual(2);
  });

  it('adds a new component node when clicking a palette button', async () => {
    renderBuilder();
    const user = userEvent.setup();

    const addToolBtn = screen.getByText('+ Tool Router');
    await user.click(addToolBtn);

    // Initial spec had 1 Tool Router; now there should be multiple elements or labels
    const toolHeadings = screen.getAllByText('Tool Router');
    expect(toolHeadings.length).toBeGreaterThanOrEqual(2);
  });
});
