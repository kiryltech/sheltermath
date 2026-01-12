import { renderHook, act } from '@testing-library/react';
import { useSimulationStore, DEFAULT_INPUTS } from './useSimulationStore';

describe('useSimulationStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useSimulationStore());
    act(() => {
        result.current.setInputs(DEFAULT_INPUTS);
    });
  });

  it('should initialize with default inputs', () => {
    const { result } = renderHook(() => useSimulationStore());
    expect(result.current.inputs.homePrice).toBe(850000);
    expect(result.current.results).toBeDefined();
  });

  it('should update inputs and recalculate results', () => {
    const { result } = renderHook(() => useSimulationStore());

    // Initial calculation check
    const initialNetWorth = result.current.results.summary.finalOwnerNetWorth;

    // Update Home Price
    act(() => {
      result.current.setInputs({ homePrice: 1000000 });
    });

    expect(result.current.inputs.homePrice).toBe(1000000);

    // Results should change (likely drastically)
    const newNetWorth = result.current.results.summary.finalOwnerNetWorth;
    expect(newNetWorth).not.toBe(initialNetWorth);
  });

  it('should handle partial updates', () => {
    const { result } = renderHook(() => useSimulationStore());

    act(() => {
      result.current.setInputs({ mortgageRate: 3.0 });
    });

    expect(result.current.inputs.mortgageRate).toBe(3.0);
    expect(result.current.inputs.homePrice).toBe(850000); // Should remain same
  });
});
