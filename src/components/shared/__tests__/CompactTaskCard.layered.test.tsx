     1|import { describe, it, expect, vi, beforeEach } from 'vitest';
     2|import React from 'react';
     3|import { render, screen, fireEvent } from '@testing-library/react';
     4|
     5|vi.mock('../../../context/AppContext', () => ({
     6|  useApp: vi.fn(),
     7|}));
     8|
     9|const { CompactTaskCard } = await import('../CompactTaskCard');
    10|const { useApp } = await import('../../../context/AppContext');
    11|
    12|const mockUpdateTask = vi.fn();
    13|const mockDeleteTask = vi.fn();
    14|
    15|const baseTask = {
    16|  id: 'task-1',
    17|  title: 'Pay bills',
    18|  status: 'todo',
    19|  blocked: false,
    20|  labels: [],
    21|  flag: false,
    22|  createdAt: Date.now(),
    23|};
    24|
    25|describe('CompactTaskCard compact layout (GroceryCard style)', () => {
    26|  beforeEach(() => {
    27|    vi.clearAllMocks();
    28|    (useApp as any).mockReturnValue({
    29|      updateTask: mockUpdateTask,
    30|      deleteTask: mockDeleteTask,
    31|      addLabel: vi.fn(() => ({ id: 'new-label', name: 'new', color: '#3b82f6' })),
    32|      convertTaskToItem: vi.fn(),
    33|      labels: [{ id: 'l1', name: 'home', color: '#3b82f6' }],
    34|      users: [{ id: 'u1', firstName: 'Chalid', role: 'admin' }],
    35|      toggleChipFilter: vi.fn(),
    36|      isChipFilterActive: vi.fn(() => false),
    37|      clearChipFilters: vi.fn(),
    38|      activeChipFilters: [],
    39|    });
    40|  });
    41|
    42|  it('shows single-line layout with title visible before hamburger tap', () => {
    43|    render(<CompactTaskCard task={baseTask as any} />);
    44|
    45|    expect(screen.getByText('Pay bills')).toBeTruthy();
    46|    expect(screen.getByLabelText('common.openEditor')).toBeTruthy();
    47|    expect(screen.getByLabelText('Mark as done')).toBeTruthy();
    48|    // Chips hidden until hamburger tap (render behind showMenu conditional)
    49|    expect(screen.queryByText('home')).toBeNull();
    50|    expect(screen.queryByText('Chalid')).toBeNull();
    51|  });
    52|
    53|  it('opens all attribute buttons when hamburger is tapped', () => {
    54|    render(<CompactTaskCard task={baseTask as any} />);
    55|    fireEvent.click(screen.getByLabelText('common.openEditor'));
    56|
    57|    expect(screen.getByLabelText('tasks.editLabels')).toBeTruthy();
    58|    expect(screen.getByLabelText('tasks.editAssignee')).toBeTruthy();
    59|    expect(screen.getByLabelText('tasks.editSchedule')).toBeTruthy();
    60|    expect(screen.getByLabelText('tasks.toggleFlag')).toBeTruthy();
    61|    expect(screen.getByLabelText('tasks.deleteTask')).toBeTruthy();
    62|  });
    63|
    64|  it('shows label input when label icon is tapped in menu', () => {
    65|    render(<CompactTaskCard task={baseTask as any} />);
    66|    fireEvent.click(screen.getByLabelText('common.openEditor'));
    67|    fireEvent.click(screen.getByLabelText('tasks.editLabels'));
    68|
    69|    expect(screen.getByLabelText('tasks.labelInputAria')).toBeTruthy();
    70|  });
    71|
    72|  it('toggles flag and blocked state on flag click', () => {
    73|    render(<CompactTaskCard task={baseTask as any} />);
    74|    fireEvent.click(screen.getByLabelText('common.openEditor'));
    75|    fireEvent.click(screen.getByLabelText('tasks.toggleFlag'));
    76|
    77|    expect(mockUpdateTask).toHaveBeenCalledWith('task-1', { flag: true, blocked: true });
    78|  });
    79|
    80|  it('renders light red tinted card when task is flagged/blocked', () => {
    81|    const { container } = render(
    82|      <CompactTaskCard task={{ ...baseTask, flag: true, blocked: true } as any} />
    83|    );
    84|    const root = container.firstChild as HTMLElement;
    85|    expect(root.className.includes('!bg-red-50')).toBeTruthy();
    86|    expect(root.className.includes('border-red-300')).toBeTruthy();
    87|  });
    88|
    89|  it('shows due date chip when task has dueDate (hamburger open)', () => {
    90|    const withDate = { ...baseTask, dueDate: new Date('2026-06-01').getTime() };
    91|    render(<CompactTaskCard task={withDate as any} />);
    92|
    93|    // Open hamburger to reveal chips
    94|    fireEvent.click(screen.getByLabelText('common.openEditor'));
    95|    expect(screen.getByText(/jun/i)).toBeTruthy();
    96|  });
    97|
    98|  it('does not show flag chip (chip removed, attribute button has color)', () => {
    99|    const flagged = { ...baseTask, flag: true, blocked: true };
   100|    const { container } = render(<CompactTaskCard task={flagged as any} />);
   101|
   102|    // No flag chip in line 2
   103|    expect(screen.queryByText('Flagged')).toBeNull();
   104|    // Card gets red tint from flag
   105|    const root = container.firstChild as HTMLElement;
   106|    expect(root.className.includes('!bg-red-50')).toBeTruthy();
   107|    // Flag attribute button shows when hamburger opens
   108|    fireEvent.click(screen.getByLabelText('common.openEditor'));
   109|    expect(screen.getByLabelText('tasks.toggleFlag')).toBeTruthy();
   110|  });
   111|
   112|  it('removes label when label chip is clicked in edit mode', () => {
   113|    const withLabels = { ...baseTask, labels: ['l1'] };
   114|    render(<CompactTaskCard task={withLabels as any} />);
   115|
   116|    // Open hamburger to reveal chips, clicking chip removes the label
   117|    fireEvent.click(screen.getByLabelText('common.openEditor'));
   118|    fireEvent.click(screen.getByText('home'));
   119|    expect(mockUpdateTask).toHaveBeenCalledWith('task-1', { labels: [] });
   120|  });
   121|
   122|  it('clears assignee when assignee chip is clicked in edit mode', () => {
   123|    const withAssignee = { ...baseTask, assignedTo: 'u1' };
   124|    render(<CompactTaskCard task={withAssignee as any} />);
   125|
   126|    // Open hamburger to reveal chips, clicking chip clears assignee
   127|    fireEvent.click(screen.getByLabelText('common.openEditor'));
   128|    fireEvent.click(screen.getByText('Chalid'));
   129|    expect(mockUpdateTask).toHaveBeenCalledWith('task-1', { assignedTo: null });
   130|  });
   131|
   132|  it('clears schedule when date chip is clicked in edit mode', () => {
   133|    const withDate = { ...baseTask, dueDate: new Date('2026-06-01').getTime() };
   134|    render(<CompactTaskCard task={withDate as any} />);
   135|
   136|    // Open hamburger to reveal chips, clicking date chip clears schedule
   137|    fireEvent.click(screen.getByLabelText('common.openEditor'));
   138|    fireEvent.click(screen.getByText(/jun/i));
   139|    expect(mockUpdateTask).toHaveBeenCalledWith('task-1', { dueDate: null, repeatInterval: null });
   140|  });
   141|
   142|  it('clears schedule when repeat chip is clicked in edit mode', () => {
   143|    const withRepeat = { ...baseTask, repeatInterval: 'week' as const, dueDate: Date.now() };
   144|    render(<CompactTaskCard task={withRepeat as any} />);
   145|
   146|    // Open hamburger to reveal chips, clicking repeat chip clears schedule
   147|    fireEvent.click(screen.getByLabelText('common.openEditor'));
   148|    fireEvent.click(screen.getByText('Weekly'));
   149|    expect(mockUpdateTask).toHaveBeenCalledWith('task-1', { dueDate: null, repeatInterval: null });
   150|  });
   151|
   152|  it('shows clear labels button when labels exist', () => {
   153|    const withLabels = { ...baseTask, labels: ['l1'] };
   154|    render(<CompactTaskCard task={withLabels as any} />);
   155|    fireEvent.click(screen.getByLabelText('common.openEditor'));
   156|    fireEvent.click(screen.getByLabelText('tasks.editLabels'));
   157|
   158|    expect(screen.getByLabelText('tasks.clearAllLabels')).toBeTruthy();
   159|  });
   160|
   161|  // --- Inline title editing tests ---
   162|
   163|  it('shows editable title input when hamburger is opened (Edit Mode)', () => {
   164|    render(<CompactTaskCard task={baseTask as any} />);
   165|    expect(screen.queryByLabelText('tasks.editTaskTitle')).toBeNull();
   166|
   167|    fireEvent.click(screen.getByLabelText('common.openEditor'));
   168|
   169|    const input = screen.getByLabelText('tasks.editTaskTitle') as HTMLInputElement;
   170|    expect(input).toBeTruthy();
   171|    expect(input.value).toBe('Pay bills');
   172|  });
   173|
   174|  it('saves edited title on blur', () => {
   175|    render(<CompactTaskCard task={baseTask as any} />);
   176|    fireEvent.click(screen.getByLabelText('common.openEditor'));
   177|
   178|    const input = screen.getByLabelText('tasks.editTaskTitle') as HTMLInputElement;
   179|    fireEvent.change(input, { target: { value: 'Pay all bills' } });
   180|    fireEvent.blur(input);
   181|
   182|    expect(mockUpdateTask).toHaveBeenCalledWith('task-1', { title: 'Pay all bills' });
   183|  });
   184|
   185|  it('saves edited title on Enter key', () => {
   186|    render(<CompactTaskCard task={baseTask as any} />);
   187|    fireEvent.click(screen.getByLabelText('common.openEditor'));
   188|
   189|    const input = screen.getByLabelText('tasks.editTaskTitle') as HTMLInputElement;
   190|    fireEvent.change(input, { target: { value: 'Pay all bills' } });
   191|    fireEvent.keyDown(input, { key: 'Enter' });
   192|
   193|    expect(mockUpdateTask).toHaveBeenCalledWith('task-1', { title: 'Pay all bills' });
   194|  });
   195|
   196|  it('reverts title on Escape key', () => {
   197|    render(<CompactTaskCard task={baseTask as any} />);
   198|    fireEvent.click(screen.getByLabelText('common.openEditor'));
   199|
   200|    const input = screen.getByLabelText('tasks.editTaskTitle') as HTMLInputElement;
   201|    fireEvent.change(input, { target: { value: 'Pay all bills' } });
   202|    fireEvent.keyDown(input, { key: 'Escape' });
   203|
   204|    expect(mockUpdateTask).not.toHaveBeenCalled();
   205|    expect(input.value).toBe('Pay bills');
   206|  });
   207|
   208|  it('restores original title when input is cleared and blurred', () => {
   209|    render(<CompactTaskCard task={baseTask as any} />);
   210|    fireEvent.click(screen.getByLabelText('common.openEditor'));
   211|
   212|    const input = screen.getByLabelText('tasks.editTaskTitle') as HTMLInputElement;
   213|    fireEvent.change(input, { target: { value: '' } });
   214|    fireEvent.blur(input);
   215|
   216|    expect(mockUpdateTask).not.toHaveBeenCalled();
   217|    expect(input.value).toBe('Pay bills');
   218|  });
   219|
   220|  it('renders light orange background when task is overdue', () => {
   221|    const overdue = { ...baseTask, dueDate: Date.now() - 86400000 }; // 1 day ago
   222|    const { container } = render(<CompactTaskCard task={overdue as any} />);
   223|    const root = container.firstChild as HTMLElement;
   224|    expect(root.className.includes('!bg-orange-50')).toBeTruthy();
   225|  });
   226|
   227|  it('does NOT show orange background for completed overdue task', () => {
   228|    const completedOverdue = { ...baseTask, status: 'done', dueDate: Date.now() - 86400000 };
   229|    const { container } = render(<CompactTaskCard task={completedOverdue as any} />);
   230|    const root = container.firstChild as HTMLElement;
   231|    expect(root.className.includes('!bg-orange-50')).toBeFalsy();
   232|  });
   233|
   234|  it('shows red (flagged) background instead of orange when task is both flagged and overdue', () => {
   235|    const flaggedAndOverdue = { ...baseTask, flag: true, blocked: true, dueDate: Date.now() - 86400000 };
   236|    const { container } = render(<CompactTaskCard task={flaggedAndOverdue as any} />);
   237|    const root = container.firstChild as HTMLElement;
   238|    expect(root.className.includes('!bg-red-50')).toBeTruthy();
   239|    expect(root.className.includes('!bg-orange-50')).toBeFalsy();
   240|  });
   241|
   242|  it('shows white background for non-overdue, non-flagged task', () => {
   243|    const { container } = render(<CompactTaskCard task={baseTask as any} />);
   244|    const root = container.firstChild as HTMLElement;
   245|    expect(root.className.includes('!bg-orange-50')).toBeFalsy();
   246|    expect(root.className.includes('!bg-red-50')).toBeFalsy();
   247|    expect(root.className.includes('bg-white')).toBeTruthy();
   248|  });
   249|});
   250|