import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import FrameworkModePane from './FrameworkModePane';
import { getPracticeProblem } from '../../lib/practiceProblem';
import { ThemeProvider } from '../../theme/ThemeProvider';

// Mock ResizeObserver
window.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

describe('FrameworkModePane Component', () => {
  const problem = getPracticeProblem('react-agent-loop')!;
  const frameworkSpec = problem.frameworkSpec!;

  const defaultProps = {
    problemId: 'react-agent-loop',
    frameworkSpec,
    code: frameworkSpec.starterCode,
    onChangeCode: vi.fn(),
    onRun: vi.fn(),
    onSubmit: vi.fn(),
    onReset: vi.fn(),
    onStop: vi.fn(),
    isBusy: false,
    status: 'idle' as const,
    saveStatus: 'saved' as const,
    modeToggle: <div data-testid="mock-toggle">Toggle</div>,
  };

  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  function renderFrameworkPane(props = {}) {
    return render(
      <ThemeProvider>
        <FrameworkModePane {...defaultProps} {...props} />
      </ThemeProvider>,
    );
  }

  it('renders toolbar, educational disclaimer, and gap checklist', () => {
    renderFrameworkPane();

    expect(screen.getByTestId('mock-toggle')).toBeInTheDocument();
    expect(screen.getByTestId('framework-disclaimer-banner')).toBeInTheDocument();
    expect(screen.getByTestId('framework-disclaimer-banner')).toHaveTextContent(/LangGraph API Educational Teaching Model/i);
    expect(screen.getByTestId('framework-disclaimer-banner')).toHaveTextContent(/pure-Python teaching shim/i);

    expect(screen.getByTestId('framework-gaps-card')).toBeInTheDocument();
    expect(screen.getByTestId('gap-card-gap-1-agent')).toBeInTheDocument();
    expect(screen.getByTestId('gap-card-gap-2-tools-condition')).toBeInTheDocument();
    expect(screen.getByTestId('gap-card-gap-3-graph-wiring')).toBeInTheDocument();

    expect(screen.getByTestId('framework-run-btn')).toBeInTheDocument();
    expect(screen.getByTestId('framework-submit-btn')).toBeInTheDocument();
    expect(screen.getByTestId('framework-fill-solution-btn')).toBeInTheDocument();
    expect(screen.getByTestId('framework-reset-btn')).toBeInTheDocument();
  });

  it('fills solution when "Fill Solution" button is clicked', async () => {
    const user = userEvent.setup();
    const onChangeCode = vi.fn();
    renderFrameworkPane({ onChangeCode });

    const fillBtn = screen.getByTestId('framework-fill-solution-btn');
    await user.click(fillBtn);

    expect(onChangeCode).toHaveBeenCalledWith(frameworkSpec.solutionCode);
  });

  it('triggers onRun and onSubmit callbacks', async () => {
    const user = userEvent.setup();
    const onRun = vi.fn();
    const onSubmit = vi.fn();
    renderFrameworkPane({ onRun, onSubmit });

    await user.click(screen.getByTestId('framework-run-btn'));
    expect(onRun).toHaveBeenCalledTimes(1);

    await user.click(screen.getByTestId('framework-submit-btn'));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
