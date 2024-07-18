import { renderHook, act } from '@testing-library/react-hooks';
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

    const { result, waitForNextUpdate } = renderHook(() => useTests());

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.tests).toEqual(mockTests);
    expect(result.current.error).toBe(null);
    expect(result.current.searchTerm).toBe('');
    expect(result.current.selectedCompetition).toBe('All');
  });

  it('should handle fetch error', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Fetch failed'));

    const { result, waitForNextUpdate } = renderHook(() => useTests());

    expect(result.current.loading).toBe(true);

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Failed to load tests. Please try refreshing the page.');
    expect(result.current.tests).toEqual([]);
  });

  it('should update searchTerm', () => {
    const { result } = renderHook(() => useTests());

    act(() => {
      result.current.setSearchTerm('Math');
    });

    expect(result.current.searchTerm).toBe('Math');
  });

  it('should update selectedCompetition', () => {
    const { result } = renderHook(() => useTests());

    act(() => {
      result.current.setSelectedCompetition('Physics');
    });

    expect(result.current.selectedCompetition).toBe('Physics');
  });

  it('should filter tests based on searchTerm and selectedCompetition', async () => {
    const mockTests = [
      { competition: 'Math', year: '2023', exam: 'Spring' },
      { competition: 'Physics', year: '2023', exam: 'Fall' },
      { competition: 'Math', year: '2022', exam: 'Fall' },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ tests: mockTests }),
    });

    const { result, waitForNextUpdate } = renderHook(() => useTests());

    await waitForNextUpdate();

    act(() => {
      result.current.setSearchTerm('fall');
      result.current.setSelectedCompetition('Math');
    });

    expect(result.current.filteredTests).toEqual([
      { competition: 'Math', year: '2022', exam: 'Fall' },
    ]);
  });
});
