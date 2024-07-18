import { renderHook, act } from '@testing-library/react';
import useTests from './useTests';

// Mock fetch globally
global.fetch = jest.fn();

describe('useTests', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should fetch tests and set initial state', async () => {
    const mockTests = [
      { competition: 'Math', year: '2023', exam: 'Spring' },
      { competition: 'Physics', year: '2023', exam: 'Fall' },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ tests: mockTests }),
    });

    const { result } = renderHook(() => useTests());

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);

    await act(async () => {
      // Wait for the effect to run
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.tests).toEqual(mockTests);
    expect(result.current.error).toBe(null);
    expect(result.current.searchTerm).toBe('');
    expect(result.current.selectedCompetition).toBe('All');
  });

  it('should handle fetch error', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Fetch failed')
    );

    const { result } = renderHook(() => useTests());

    await act(async () => {
      // Wait for the effect to run
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(
      'Failed to load tests. Please try again later.'
    );
    expect(result.current.tests).toEqual([]);
  });

});

