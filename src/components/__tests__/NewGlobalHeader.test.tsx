     1|import { describe, it, expect, vi, beforeEach } from 'vitest';
     2|import React from 'react';
     3|import { render, screen, fireEvent } from '@testing-library/react';
     4|import { NewGlobalHeader } from '../shared/NewGlobalHeader';
     5|
     6|// Mock the AppContext
     7|const mockUseApp = vi.fn();
     8|vi.mock('../../context/AppContext', () => ({
     9|  useApp: () => mockUseApp(),
    10|}));
    11|
    12|const defaultMockContext = {
    13|  users: [],
    14|  labels: [],
    15|  filters: [],
    16|  items: [],
    17|  shops: [],
    18|  appSettings: {},
    19|};
    20|
    21|describe('NewGlobalHeader', () => {
    22|  beforeEach(() => {
    23|    mockUseApp.mockReturnValue(defaultMockContext);
    24|    vi.clearAllMocks();
    25|  });
    26|
    27|  describe('Search functionality', () => {
    28|    it('renders search input by default', () => {
    29|      render(<NewGlobalHeader />);
    30|      const searchInput = screen.getByPlaceholderText('Search...');
    31|      expect(searchInput).toBeInTheDocument();
    32|    });
    33|
    34|    it('calls onSearch when input changes', () => {
    35|      const onSearch = vi.fn();
    36|      render(<NewGlobalHeader onSearch={onSearch} />);
    37|      const searchInput = screen.getByPlaceholderText('Search...');
    38|      
    39|      fireEvent.change(searchInput, { target: { value: 'test query' } });
    40|      
    41|      expect(onSearch).toHaveBeenCalledWith('test query');
    42|    });
    43|
    44|    it('uses custom placeholder when provided', () => {
    45|      render(<NewGlobalHeader searchPlaceholder="Search tasks..." />);
    46|      const searchInput = screen.getByPlaceholderText('Search tasks...');
    47|      expect(searchInput).toBeInTheDocument();
    48|    });
    49|
    50|    it('hides search when showSearch is false', () => {
    51|      render(<NewGlobalHeader showSearch={false} />);
    52|      const searchInput = screen.queryByPlaceholderText('Search...');
    53|      expect(searchInput).not.toBeInTheDocument();
    54|    });
    55|  });
    56|
    57|  describe('Add button functionality', () => {
    58|    it('renders add button by default', () => {
    59|      render(<NewGlobalHeader />);
    60|      const buttons = screen.getAllByRole('button');
    61|      // Add button is the second button (after filter button)
    62|      expect(buttons.length).toBeGreaterThanOrEqual(2);
    63|    });
    64|
    65|    it('calls onAdd with input value when add button is clicked', () => {
    66|      const onAdd = vi.fn();
    67|      render(<NewGlobalHeader onAdd={onAdd} />);
    68|      const searchInput = screen.getByPlaceholderText('Search...');
    69|      const buttons = screen.getAllByRole('button');
    70|      const addButton = buttons[1]; // Second button is add
    71|      
    72|      fireEvent.change(searchInput, { target: { value: 'New task' } });
    73|      fireEvent.click(addButton);
    74|      
    75|      expect(onAdd).toHaveBeenCalledWith('New task', {});
    76|    });
    77|
    78|    it('calls onAdd when Enter key is pressed', () => {
    79|      const onAdd = vi.fn();
    80|      render(<NewGlobalHeader onAdd={onAdd} />);
    81|      const searchInput = screen.getByPlaceholderText('Search...');
    82|      
    83|      fireEvent.change(searchInput, { target: { value: 'New task' } });
    84|      fireEvent.keyDown(searchInput, { key: 'Enter' });
    85|      
    86|      expect(onAdd).toHaveBeenCalledWith('New task', {});
    87|    });
    88|
    89|    it('does not call onAdd when input is empty', () => {
    90|      const onAdd = vi.fn();
    91|      render(<NewGlobalHeader onAdd={onAdd} />);
    92|      const buttons = screen.getAllByRole('button');
    93|      const addButton = buttons[1];
    94|      
    95|      fireEvent.click(addButton);
    96|      
    97|      expect(onAdd).not.toHaveBeenCalled();
    98|    });
    99|
   100|    it('clears input after adding', () => {
   101|      const onAdd = vi.fn();
   102|      render(<NewGlobalHeader onAdd={onAdd} />);
   103|      const searchInput = screen.getByPlaceholderText('Search...');
   104|      const buttons = screen.getAllByRole('button');
   105|      const addButton = buttons[1];
   106|      
   107|      fireEvent.change(searchInput, { target: { value: 'New task' } });
   108|      fireEvent.click(addButton);
   109|      
   110|      expect(searchInput).toHaveValue('');
   111|    });
   112|
   113|    it('hides add button when showAdd is false', () => {
   114|      render(<NewGlobalHeader showAdd={false} />);
   115|      const buttons = screen.getAllByRole('button');
   116|      // Should only have filter button, no add button
   117|      expect(buttons.length).toBe(1);
   118|    });
   119|
   120|    it('clears search after adding when onSearch is provided', () => {
   121|      const onSearch = vi.fn();
   122|      const onAdd = vi.fn();
   123|      render(<NewGlobalHeader onSearch={onSearch} onAdd={onAdd} />);
   124|      const searchInput = screen.getByPlaceholderText('Search...');
   125|      const buttons = screen.getAllByRole('button');
   126|      const addButton = buttons[1];
   127|      
   128|      fireEvent.change(searchInput, { target: { value: 'New task' } });
   129|      fireEvent.click(addButton);
   130|      
   131|      expect(onSearch).toHaveBeenLastCalledWith('');
   132|    });
   133|  });
   134|
   135|  describe('Filter functionality', () => {
   136|    it('renders filter button by default', () => {
   137|      render(<NewGlobalHeader />);
   138|      const buttons = screen.getAllByRole('button');
   139|      expect(buttons.length).toBeGreaterThanOrEqual(2); // filter + add
   140|    });
   141|
   142|    it('shows filter panel when filter button is clicked', () => {
   143|      mockUseApp.mockReturnValue({
   144|        ...defaultMockContext,
   145|        labels: [{ id: 'label1', name: 'urgent', color: '#ff0000' }],
   146|      });
   147|      render(<NewGlobalHeader />);
   148|      const buttons = screen.getAllByRole('button');
   149|      const filterButton = buttons[0]; // First button is filter
   150|      
   151|      fireEvent.click(filterButton);
   152|      
   153|      // Filter panel should appear
   154|      expect(screen.getByText('Labels')).toBeInTheDocument();
   155|    });
   156|
   157|    it('hides filter panel when filter button is clicked again', () => {
   158|      render(<NewGlobalHeader />);
   159|      const buttons = screen.getAllByRole('button');
   160|      const filterButton = buttons[0];
   161|      
   162|      fireEvent.click(filterButton); // Open
   163|      fireEvent.click(filterButton); // Close
   164|      
   165|      expect(screen.queryByText('Labels')).not.toBeInTheDocument();
   166|    });
   167|
   168|    it('hides filters when showFilters is false', () => {
   169|      render(<NewGlobalHeader showFilters={false} />);
   170|      const buttons = screen.getAllByRole('button');
   171|      // Should only have add button, no filter button
   172|      expect(buttons.length).toBe(1);
   173|    });
   174|
   175|    it('calls onFilter with active filters when filters change', () => {
   176|      const onFilter = vi.fn();
   177|      render(<NewGlobalHeader onFilter={onFilter} type="task" />);
   178|      
   179|      // Open filter panel
   180|      const buttons = screen.getAllByRole('button');
   181|      const filterButton = buttons[0];
   182|      fireEvent.click(filterButton);
   183|      
   184|      // onFilter should be called on mount with default filters
   185|      expect(onFilter).toHaveBeenCalled();
   186|    });
   187|
   188|    it('does not show Private quick filter button in filter panel', () => {
   189|      render(<NewGlobalHeader onFilter={vi.fn()} type="task" />);
   190|
   191|      const buttons = screen.getAllByRole('button');
   192|      const filterButton = buttons[0];
   193|      fireEvent.click(filterButton);
   194|
   195|      expect(screen.queryByRole('button', { name: /^private$/i })).not.toBeInTheDocument();
   196|      expect(screen.getByRole('button', { name: /completed/i })).toBeInTheDocument();
   197|    });
   198|  });
   199|
   200|  describe('Type-specific functionality', () => {
   201|    it('shows task-specific filters when type is task', () => {
   202|      render(<NewGlobalHeader type="task" />);
   203|      const buttons = screen.getAllByRole('button');
   204|      const filterButton = buttons[0];
   205|      fireEvent.click(filterButton);
   206|      
   207|      expect(screen.getByText('Status')).toBeInTheDocument();
   208|      expect(screen.getByText('Priority')).toBeInTheDocument();
   209|    });
   210|
   211|    it('shows item-specific filters when type is item', () => {
   212|      mockUseApp.mockReturnValue({
   213|        ...defaultMockContext,
   214|        items: [{ id: 'item1', name: 'Milk', category: 'Dairy', location: 'Fridge', completed: false, createdAt: Date.now() }],
   215|      });
   216|      render(<NewGlobalHeader type="item" />);
   217|      const buttons = screen.getAllByRole('button');
   218|      const filterButton = buttons[0];
   219|      fireEvent.click(filterButton);
   220|      
   221|      expect(screen.getByText('items.locationFilterHeader')).toBeInTheDocument();
   222|    });
   223|
   224|    it('shows calendar-specific filters when type is calendar', () => {
   225|      mockUseApp.mockReturnValue({
   226|        ...defaultMockContext,
   227|        users: [{ id: 'user1', name: 'John', email: 'john@example.com' }],
   228|      });
   229|      render(<NewGlobalHeader type="calendar" />);
   230|      const buttons = screen.getAllByRole('button');
   231|      const filterButton = buttons[0];
   232|      fireEvent.click(filterButton);
   233|      
   234|      expect(screen.getByText('calendar.assignedFilterHeader')).toBeInTheDocument();
   235|      expect(screen.getByText('calendar.recurringFilter')).toBeInTheDocument();
   236|    });
   237|  });
   238|
   239|  describe('Metadata parsing', () => {
   240|    it('parses @me assignee when appSettings.currentUserId is set', () => {
   241|      const onAdd = vi.fn();
   242|      mockUseApp.mockReturnValue({
   243|        ...defaultMockContext,
   244|        appSettings: { currentUserId: 'user123' },
   245|      });
   246|      
   247|      render(<NewGlobalHeader onAdd={onAdd} />);
   248|      const searchInput = screen.getByPlaceholderText('Search...');
   249|      const buttons = screen.getAllByRole('button');
   250|      const addButton = buttons[1];
   251|      
   252|      fireEvent.change(searchInput, { target: { value: 'Task @me' } });
   253|      fireEvent.click(addButton);
   254|      
   255|      expect(onAdd).toHaveBeenCalledWith('Task', { assignee: 'user123' });
   256|    });
   257|
   258|    it('parses @user assignee when user exists', () => {
   259|      const onAdd = vi.fn();
   260|      mockUseApp.mockReturnValue({
   261|        ...defaultMockContext,
   262|        users: [{ id: 'user456', name: 'John', email: 'john@example.com' }],
   263|      });
   264|      
   265|      render(<NewGlobalHeader onAdd={onAdd} />);
   266|      const searchInput = screen.getByPlaceholderText('Search...');
   267|      const buttons = screen.getAllByRole('button');
   268|      const addButton = buttons[1];
   269|      
   270|      fireEvent.change(searchInput, { target: { value: 'Task @John' } });
   271|      fireEvent.click(addButton);
   272|      
   273|      expect(onAdd).toHaveBeenCalledWith('Task', { assignee: 'user456' });
   274|    });
   275|
   276|    it('parses #label when label exists', () => {
   277|      const onAdd = vi.fn();
   278|      mockUseApp.mockReturnValue({
   279|        ...defaultMockContext,
   280|        labels: [{ id: 'label1', name: 'urgent', color: '#ff0000' }],
   281|      });
   282|      
   283|      render(<NewGlobalHeader onAdd={onAdd} />);
   284|      const searchInput = screen.getByPlaceholderText('Search...');
   285|      const buttons = screen.getAllByRole('button');
   286|      const addButton = buttons[1];
   287|      
   288|      fireEvent.change(searchInput, { target: { value: 'Task #urgent' } });
   289|      fireEvent.click(addButton);
   290|      
   291|      expect(onAdd).toHaveBeenCalledWith('Task', { labels: ['label1'] });
   292|    });
   293|
   294|    it('parses //date for due date', () => {
   295|      const onAdd = vi.fn();
   296|      render(<NewGlobalHeader onAdd={onAdd} />);
   297|      const searchInput = screen.getByPlaceholderText('Search...');
   298|      const buttons = screen.getAllByRole('button');
   299|      const addButton = buttons[1];
   300|      
   301|      fireEvent.change(searchInput, { target: { value: 'Task //2025-12-31' } });
   302|      fireEvent.click(addButton);
   303|      
   304|      const expectedDate = new Date('2025-12-31').getTime();
   305|      expect(onAdd).toHaveBeenCalledWith('Task', { dueDate: expectedDate });
   306|    });
   307|
   308|    it('parses multiple metadata tokens together', () => {
   309|      const onAdd = vi.fn();
   310|      mockUseApp.mockReturnValue({
   311|        ...defaultMockContext,
   312|        appSettings: { currentUserId: 'user123' },
   313|        labels: [{ id: 'label1', name: 'urgent', color: '#ff0000' }],
   314|      });
   315|      
   316|      render(<NewGlobalHeader onAdd={onAdd} />);
   317|      const searchInput = screen.getByPlaceholderText('Search...');
   318|      const buttons = screen.getAllByRole('button');
   319|      const addButton = buttons[1];
   320|      
   321|      fireEvent.change(searchInput, { target: { value: 'Buy groceries @me #urgent //2025-12-31' } });
   322|      fireEvent.click(addButton);
   323|      
   324|      const expectedDate = new Date('2025-12-31').getTime();
   325|      expect(onAdd).toHaveBeenCalledWith('Buy groceries', { 
   326|        assignee: 'user123', 
   327|        labels: ['label1'], 
   328|        dueDate: expectedDate 
   329|      });
   330|    });
   331|  });
   332|
   333|  describe('Filter panel interactions', () => {
   334|    it('toggles label filters in filter panel', () => {
   335|      const onFilter = vi.fn();
   336|      mockUseApp.mockReturnValue({
   337|        ...defaultMockContext,
   338|        labels: [
   339|          { id: 'label1', name: 'urgent', color: '#ff0000' },
   340|          { id: 'label2', name: 'bug', color: '#00ff00' },
   341|        ],
   342|      });
   343|      
   344|      render(<NewGlobalHeader onFilter={onFilter} type="task" />);
   345|      const buttons = screen.getAllByRole('button');
   346|      const filterButton = buttons[0];
   347|      fireEvent.click(filterButton);
   348|      
   349|      // Click on first label
   350|      const labelButtons = screen.getAllByText('urgent');
   351|      fireEvent.click(labelButtons[0]);
   352|      
   353|      expect(onFilter).toHaveBeenCalled();
   354|    });
   355|
   356|    it('toggles status filters for tasks', () => {
   357|      const onFilter = vi.fn();
   358|      render(<NewGlobalHeader onFilter={onFilter} type="task" />);
   359|      const buttons = screen.getAllByRole('button');
   360|      const filterButton = buttons[0];
   361|      fireEvent.click(filterButton);
   362|      
   363|      const statusButton = screen.getByText('tasks.statusTodo');
   364|      fireEvent.click(statusButton);
   365|      
   366|      expect(onFilter).toHaveBeenCalled();
   367|    });
   368|
   369|    it('toggles priority filters for tasks', () => {
   370|      const onFilter = vi.fn();
   371|      render(<NewGlobalHeader onFilter={onFilter} type="task" />);
   372|      const buttons = screen.getAllByRole('button');
   373|      const filterButton = buttons[0];
   374|      fireEvent.click(filterButton);
   375|      
   376|      const priorityButton = screen.getByText('tasks.priorityUrgent');
   377|      fireEvent.click(priorityButton);
   378|      
   379|      expect(onFilter).toHaveBeenCalled();
   380|    });
   381|
   382|    it('clears all filters when Clear All button is clicked', () => {
   383|      const onFilter = vi.fn();
   384|      render(<NewGlobalHeader onFilter={onFilter} type="task" />);
   385|      const buttons = screen.getAllByRole('button');
   386|      const filterButton = buttons[0];
   387|      fireEvent.click(filterButton);
   388|      
   389|      // Set some filters
   390|      const statusButton = screen.getByText('tasks.statusTodo');
   391|      fireEvent.click(statusButton);
   392|      
   393|      // Clear all
   394|      const clearButton = screen.getByText('common.clearAllTooltip');
   395|      fireEvent.click(clearButton);
   396|      
   397|      expect(onFilter).toHaveBeenCalled();
   398|    });
   399|
   400|    it('toggles completed filter', () => {
   401|      const onFilter = vi.fn();
   402|      render(<NewGlobalHeader onFilter={onFilter} type="task" />);
   403|      const buttons = screen.getAllByRole('button');
   404|      const filterButton = buttons[0];
   405|      fireEvent.click(filterButton);
   406|      
   407|      const completedButton = screen.getByText('Completed');
   408|      fireEvent.click(completedButton);
   409|      
   410|      expect(onFilter).toHaveBeenCalled();
   411|    });
   412|  });
   413|});
   414|