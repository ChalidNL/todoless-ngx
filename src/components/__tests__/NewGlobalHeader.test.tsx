import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { NewGlobalHeader } from '../shared/NewGlobalHeader';

// Mock the AppContext
const mockUseApp = vi.fn();
vi.mock('../../context/AppContext', () => ({
  useApp: () => mockUseApp(),
}));

const defaultMockContext = {
  users: [],
  labels: [],
  filters: [],
  items: [],
  shops: [],
  appSettings: {},
  activeChipFilters: [],
  toggleChipFilter: vi.fn(),
  clearChipFilters: vi.fn(),
  addFilter: vi.fn(),
  showCompletionMessage: vi.fn(),
};

describe('NewGlobalHeader', () => {
  beforeEach(() => {
    mockUseApp.mockReturnValue(defaultMockContext);
    vi.clearAllMocks();
  });

  describe('Search functionality', () => {
    it('renders search input by default', () => {
      render(<NewGlobalHeader />);
      const searchInput = screen.getByPlaceholderText('Search...');
      expect(searchInput).toBeInTheDocument();
    });

    it('calls onSearch when input changes', () => {
      const onSearch = vi.fn();
      render(<NewGlobalHeader onSearch={onSearch} />);
      const searchInput = screen.getByPlaceholderText('Search...');
      
      fireEvent.change(searchInput, { target: { value: 'test query' } });
      
      expect(onSearch).toHaveBeenCalledWith('test query');
    });

    it('uses custom placeholder when provided', () => {
      render(<NewGlobalHeader searchPlaceholder="Search tasks..." />);
      const searchInput = screen.getByPlaceholderText('Search tasks...');
      expect(searchInput).toBeInTheDocument();
    });

    it('hides search when showSearch is false', () => {
      render(<NewGlobalHeader showSearch={false} />);
      const searchInput = screen.queryByPlaceholderText('Search...');
      expect(searchInput).not.toBeInTheDocument();
    });
  });

  describe('Add button functionality', () => {
    it('renders add button by default', () => {
      render(<NewGlobalHeader />);
      const buttons = screen.getAllByRole('button');
      // Add button is the second button (after filter button)
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });

    it('calls onAdd with input value when add button is clicked', () => {
      const onAdd = vi.fn();
      render(<NewGlobalHeader onAdd={onAdd} />);
      const searchInput = screen.getByPlaceholderText('Search...');
      const buttons = screen.getAllByRole('button');
      const addButton = buttons[1]; // Second button is add
      
      fireEvent.change(searchInput, { target: { value: 'New task' } });
      fireEvent.click(addButton);
      
      // onAdd now called with single argument (metadata parsing moved to parent)
      expect(onAdd).toHaveBeenCalledWith('New task');
    });

    it('calls onAdd when Enter key is pressed', () => {
      const onAdd = vi.fn();
      render(<NewGlobalHeader onAdd={onAdd} />);
      const searchInput = screen.getByPlaceholderText('Search...');
      
      fireEvent.change(searchInput, { target: { value: 'New task' } });
      fireEvent.keyDown(searchInput, { key: 'Enter' });
      
      expect(onAdd).toHaveBeenCalledWith('New task');
    });

    it('does not call onAdd when input is empty', () => {
      const onAdd = vi.fn();
      render(<NewGlobalHeader onAdd={onAdd} />);
      const buttons = screen.getAllByRole('button');
      const addButton = buttons[1];
      
      fireEvent.click(addButton);
      
      expect(onAdd).not.toHaveBeenCalled();
    });

    it('clears input after adding', () => {
      const onAdd = vi.fn();
      render(<NewGlobalHeader onAdd={onAdd} />);
      const searchInput = screen.getByPlaceholderText('Search...');
      const buttons = screen.getAllByRole('button');
      const addButton = buttons[1];
      
      fireEvent.change(searchInput, { target: { value: 'New task' } });
      fireEvent.click(addButton);
      
      expect(searchInput).toHaveValue('');
    });

    it('hides add button when showAdd is false', () => {
      render(<NewGlobalHeader showAdd={false} />);
      const buttons = screen.getAllByRole('button');
      // Should only have filter button, no add button
      expect(buttons.length).toBe(1);
    });

    it('clears search after adding when onSearch is provided', () => {
      const onSearch = vi.fn();
      const onAdd = vi.fn();
      render(<NewGlobalHeader onSearch={onSearch} onAdd={onAdd} />);
      const searchInput = screen.getByPlaceholderText('Search...');
      const buttons = screen.getAllByRole('button');
      const addButton = buttons[1];
      
      fireEvent.change(searchInput, { target: { value: 'New task' } });
      fireEvent.click(addButton);
      
      expect(onSearch).toHaveBeenLastCalledWith('');
    });
  });

  describe('Filter functionality', () => {
    it('renders filter button by default', () => {
      render(<NewGlobalHeader />);
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThanOrEqual(2); // filter + add
    });

    it('shows filter panel when filter button is clicked', () => {
      render(<NewGlobalHeader />);
      const buttons = screen.getAllByRole('button');
      const filterButton = buttons[0]; // First button is filter
      
      fireEvent.click(filterButton);
      
      // Filter panel shows with title 'Filters'
      expect(screen.getByText('Filters')).toBeInTheDocument();
    });

    it('hides filter panel when filter button is clicked again', () => {
      render(<NewGlobalHeader />);
      const buttons = screen.getAllByRole('button');
      const filterButton = buttons[0];
      
      fireEvent.click(filterButton); // Open
      fireEvent.click(filterButton); // Close
      
      expect(screen.queryByText('Filters')).not.toBeInTheDocument();
    });

    it('hides filters when showFilters is false', () => {
      render(<NewGlobalHeader showFilters={false} />);
      const buttons = screen.getAllByRole('button');
      // Should only have add button, no filter button
      expect(buttons.length).toBe(1);
    });
  });

  describe('Filter dropdown with saved filters', () => {
    it('shows saved filters when present', () => {
      mockUseApp.mockReturnValue({
        ...defaultMockContext,
        filters: [
          { id: 'f1', name: 'Work tasks', type: 'task', chipFilters: [{ type: 'label', id: 'l1', label: 'work' }] },
        ],
      });
      render(<NewGlobalHeader type="task" />);
      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[0]); // Open filter panel
      
      expect(screen.getByText('Work tasks')).toBeInTheDocument();
    });

    it('shows empty state when no saved filters', () => {
      render(<NewGlobalHeader type="task" />);
      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[0]);
      
      expect(screen.getByText(/No saved filters/i)).toBeInTheDocument();
    });

    it('clears active chip filters when Clear all is clicked', () => {
      const clearChipFilters = vi.fn();
      mockUseApp.mockReturnValue({
        ...defaultMockContext,
        clearChipFilters,
        activeChipFilters: [{ type: 'status', id: 'todo', label: 'To Do' }],
      });
      render(<NewGlobalHeader type="task" />);
      const buttons = screen.getAllByRole('button');
      fireEvent.click(buttons[0]); // Open

      const clearButton = screen.getByText('Clear all');
      fireEvent.click(clearButton);
      
      expect(clearChipFilters).toHaveBeenCalled();
    });
  });

  describe('Metadata parsing (delegated to parent)', () => {
    it('passes raw input value to onAdd without parsing', () => {
      const onAdd = vi.fn();
      render(<NewGlobalHeader onAdd={onAdd} />);
      const searchInput = screen.getByPlaceholderText('Search...');
      const buttons = screen.getAllByRole('button');
      const addButton = buttons[1];
      
      // Metadata parsing is now done by parent (InboxBacklog),
      // NewGlobalHeader just passes the raw string
      fireEvent.change(searchInput, { target: { value: 'Task @me #urgent //2025-12-31' } });
      fireEvent.click(addButton);
      
      expect(onAdd).toHaveBeenCalledWith('Task @me #urgent //2025-12-31');
    });
  });
});
