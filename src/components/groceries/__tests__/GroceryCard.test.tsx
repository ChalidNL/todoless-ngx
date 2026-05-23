import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('../../../context/AppContext', () => ({

vi.mock('../../../context/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    setLanguage: () => {},
    t: (key) => key,
  }),
  LanguageProvider: ({ children }) => children,
}));
  useApp: vi.fn(),
}));

const { UnifiedCard } = await import('../../shared/UnifiedCard');
const { useApp } = await import('../../../context/AppContext');

const mockUpdateItem = vi.fn();
const mockDeleteItem = vi.fn();
const mockAddShop = vi.fn();

const createItem = (overrides = {}) => ({
  id: 'item-1',
  title: 'Milk',
  completed: false,
  quantity: 2,
  shopId: undefined as string | undefined,
  assignedTo: undefined as string | undefined,
  labels: [],
  isPrivate: false,
  linkedType: undefined as string | undefined,
  linkedTo: undefined as string | undefined,
  createdAt: Date.now(),
  ...overrides,
});

describe('UnifiedCard (grocery item)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useApp as any).mockReturnValue({
      updateItem: mockUpdateItem,
      deleteItem: mockDeleteItem,
      addShop: mockAddShop,
      addLabel: vi.fn(),
      shops: [
        { id: 'shop-1', name: 'AH', color: '#3b82f6' },
        { id: 'shop-2', name: 'Jumbo', color: '#10b981' },
      ],
      labels: [],
      users: [],
      isChipFilterActive: vi.fn(() => false),
    });
  });

  it('renders layer 1 with checkbox + title + hamburger', () => {
    render(<UnifiedCard entity={createItem()} type="item" />);
    expect(screen.getByText('Milk')).toBeTruthy();
    expect(screen.getByLabelText('common.markAsDone')).toBeTruthy();
    expect(screen.getByLabelText('common.openEditor')).toBeTruthy();
  });

  it('shows quantity [+][-] controls on top row for items', () => {
    render(<UnifiedCard entity={createItem({ quantity: 2 })} type="item" />);
    expect(screen.getByLabelText('items.decreaseQuantity')).toBeTruthy();
    expect(screen.getByLabelText('items.increaseQuantity')).toBeTruthy();
    expect(screen.getByText('2')).toBeTruthy();
  });

  it('updates quantity from the top row +/- controls', () => {
    render(<UnifiedCard entity={createItem({ quantity: 2 })} type="item" />);
    fireEvent.click(screen.getByLabelText('items.increaseQuantity'));
    expect(mockUpdateItem).toHaveBeenCalledWith('item-1', { quantity: 3 });
  });

  it('shows only shop attribute + delete in attribute row', () => {
    render(<UnifiedCard entity={createItem()} type="item" />);
    fireEvent.click(screen.getByLabelText('common.openEditor'));

    expect(screen.getByLabelText('items.selectShopTooltip')).toBeTruthy();
    expect(screen.getByLabelText('common.delete')).toBeTruthy();

    expect(screen.queryByLabelText('tasks.toggleFlag')).toBeNull();
  });

  it('opens shop editor and selects shop', () => {
    render(<UnifiedCard entity={createItem()} type="item" />);
    fireEvent.click(screen.getByLabelText('common.openEditor'));
    fireEvent.click(screen.getByLabelText('items.selectShopTooltip'));

    expect(screen.getByLabelText('items.shopInputAria')).toBeTruthy();
    fireEvent.click(screen.getByText('AH'));
    expect(mockUpdateItem).toHaveBeenCalledWith('item-1', { shopId: 'shop-1' });
  });

  it('creates shop from input like label flow', () => {
    render(<UnifiedCard entity={createItem()} type="item" />);
    fireEvent.click(screen.getByLabelText('common.openEditor'));
    fireEvent.click(screen.getByLabelText('items.selectShopTooltip'));

    const input = screen.getByLabelText('items.shopInputAria');
    fireEvent.change(input, { target: { value: 'Lidl' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockAddShop).toHaveBeenCalledWith({ name: 'Lidl', color: '#10b981' });
  });

  it('deletes from attribute delete button', () => {
    render(<UnifiedCard entity={createItem()} type="item" />);
    fireEvent.click(screen.getByLabelText('common.openEditor'));
    fireEvent.click(screen.getByLabelText('common.delete'));
    expect(mockDeleteItem).toHaveBeenCalledWith('item-1');
  });

  it('shows shop chip when item has a shop', () => {
    render(<UnifiedCard entity={createItem({ shopId: 'shop-1' })} type="item" />);
    expect(screen.getByText('AH')).toBeTruthy();
  });

  // --- Inline title editing tests ---

  it('shows editable title input when hamburger is opened (Edit Mode)', () => {
    render(<UnifiedCard entity={createItem()} type="item" />);
    expect(screen.queryByLabelText('common.editTitle')).toBeNull();

    fireEvent.click(screen.getByLabelText('common.openEditor'));

    const input = screen.getByLabelText('common.editTitle') as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(input.value).toBe('Milk');
  });

  it('saves edited title on Enter', () => {
    render(<UnifiedCard entity={createItem()} type="item" />);
    fireEvent.click(screen.getByLabelText('common.openEditor'));

    const input = screen.getByLabelText('common.editTitle') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Soy Milk' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    expect(mockUpdateItem).toHaveBeenCalledWith('item-1', { title: 'Soy Milk' });
  });

  it('reverts title on Escape', () => {
    render(<UnifiedCard entity={createItem()} type="item" />);
    fireEvent.click(screen.getByLabelText('common.openEditor'));

    const input = screen.getByLabelText('common.editTitle') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'Soy Milk' } });
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(mockUpdateItem).not.toHaveBeenCalled();
    expect(input.value).toBe('Milk');
  });
});
