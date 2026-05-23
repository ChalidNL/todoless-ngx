     1|     1|// @vitest-environment jsdom
     2|     2|import React from 'react';
     3|     3|import { describe, it, expect, vi, beforeEach } from 'vitest';
     4|     4|import { render, screen, fireEvent, waitFor } from '@testing-library/react';
     5|     5|import { Onboarding } from '../Onboarding';
     6|     6|
     7|     7|const {
     8|     8|  updateAppSettingsMock,
     9|     9|  registerAdminMock,
    10|    10|  createFamilyMock,
    11|    11|  updateUserFamilyMock,
    12|    12|  markOnboardingSeenMock,
    13|    13|} = vi.hoisted(() => ({
    14|    14|  updateAppSettingsMock: vi.fn(),
    15|    15|  registerAdminMock: vi.fn(),
    16|    16|  createFamilyMock: vi.fn(),
    17|    17|  updateUserFamilyMock: vi.fn(),
    18|    18|  markOnboardingSeenMock: vi.fn(),
    19|    19|}));
    20|    20|
    21|    21|vi.mock('../../context/AppContext', () => ({
    22|    22|  useApp: () => ({ updateAppSettings: updateAppSettingsMock }),
    23|    23|}));
    24|    24|
    25|    25|vi.mock('../../lib/pocketbase-client', () => ({
    26|    26|  api: {
    27|    27|    registerAdmin: registerAdminMock,
    28|    28|    createFamily: createFamilyMock,
    29|    29|    updateUserFamily: updateUserFamilyMock,
    30|    30|    markOnboardingSeen: markOnboardingSeenMock,
    31|    31|  },
    32|    32|}));
    33|
    34|vi.mock('../../context/LanguageContext', () => ({
    35|  useLanguage: () => ({
    36|    language: 'en',
    37|    setLanguage: () => {},
    38|    t: (key) => key,  // fallback: return key as is
    39|  }),
    40|  LanguageProvider: ({ children }) => children,
    41|}));
    42|
    43|    33|
    44|    34|describe('Onboarding admin flow', () => {
    45|    35|  beforeEach(() => {
    46|    36|    vi.clearAllMocks();
    47|    37|  });
    48|    38|
    49|    39|  it('shows field-level validation errors with clear messages', async () => {
    50|    40|    const onComplete = vi.fn();
    51|    41|    render(<Onboarding mode="admin" onComplete={onComplete} />);
    52|    42|
    53|    43|    // Navigate to workspace step (step 2 of admin flow — 2 info slides, then workspace)
    54|    44|    for (let i = 0; i < 2; i++) {
    55|    45|      fireEvent.click(screen.getByText('onboarding.next'));
    56|    46|    }
    57|    47|
    58|    48|    // Workspace step
    59|    49|    fireEvent.change(screen.getByPlaceholderText('onboarding.prefilledWithWorkspace'), {
    60|    50|      target: { value: 'My Family' },
    61|    51|    });
    62|    52|    fireEvent.click(screen.getByText('onboarding.next'));
    63|    53|
    64|    54|    // Try to submit with empty fields
    65|    55|    fireEvent.click(screen.getByText('onboarding.createAccount'));
    66|    56|
    67|    57|    // Should show "Please enter your first name" first (name is checked first)
    68|    58|    await waitFor(() => {
    69|    59|      expect(screen.getByText('onboarding.pleaseEnterFirstName')).toBeTruthy();
    70|    60|    });
    71|    61|    expect(registerAdminMock).not.toHaveBeenCalled();
    72|    62|    expect(onComplete).not.toHaveBeenCalled();
    73|    63|  });
    74|    64|
    75|    65|  it('shows email required error when name is filled but email is empty', async () => {
    76|    66|    const onComplete = vi.fn();
    77|    67|    render(<Onboarding mode="admin" onComplete={onComplete} />);
    78|    68|
    79|    69|    for (let i = 0; i < 2; i++) {
    80|    70|      fireEvent.click(screen.getByText('onboarding.next'));
    81|    71|    }
    82|    72|
    83|    73|    fireEvent.change(screen.getByPlaceholderText('onboarding.prefilledWithWorkspace'), {
    84|    74|      target: { value: 'My Family' },
    85|    75|    });
    86|    76|    fireEvent.click(screen.getByText('onboarding.next'));
    87|    77|
    88|    78|    // Fill only name
    89|    79|    fireEvent.change(screen.getByPlaceholderText('onboarding.firstName'), {
    90|    80|      target: { value: 'Admin' },
    91|    81|    });
    92|    82|    fireEvent.change(screen.getByPlaceholderText('onboarding.lastName'), {
    93|    83|      target: { value: 'User' },
    94|    84|    });
    95|    85|    fireEvent.click(screen.getByText('onboarding.createAccount'));
    96|    86|
    97|    87|    await waitFor(() => {
    98|    88|      expect(screen.getByText('onboarding.pleaseEnterEmail')).toBeTruthy();
    99|    89|    });
   100|    90|  });
   101|    91|
   102|    92|  it('shows password mismatch error when passwords differ', async () => {
   103|    93|    const onComplete = vi.fn();
   104|    94|    render(<Onboarding mode="admin" onComplete={onComplete} />);
   105|    95|
   106|    96|    for (let i = 0; i < 2; i++) {
   107|    97|      fireEvent.click(screen.getByText('onboarding.next'));
   108|    98|    }
   109|    99|
   110|   100|    fireEvent.change(screen.getByPlaceholderText('onboarding.prefilledWithWorkspace'), {
   111|   101|      target: { value: 'My Family' },
   112|   102|    });
   113|   103|    fireEvent.click(screen.getByText('onboarding.next'));
   114|   104|
   115|   105|    fireEvent.change(screen.getByPlaceholderText('onboarding.firstName'), {
   116|   106|      target: { value: 'Admin' },
   117|   107|    });
   118|   108|    fireEvent.change(screen.getByPlaceholderText('onboarding.lastName'), {
   119|   109|      target: { value: 'User' },
   120|   110|    });
   121|   111|    fireEvent.change(screen.getByPlaceholderText('onboarding.email'), {
   122|   112|      target: { value: 'admin@example.com' },
   123|   113|    });
   124|   114|
   125|   115|    const passwordInputs = screen.getAllByPlaceholderText('onboarding.password');
   126|   116|    fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
   127|   117|    fireEvent.change(passwordInputs[1], { target: { value: 'differentpass' } });
   128|   118|
   129|   119|    fireEvent.click(screen.getByText('onboarding.createAccount'));
   130|   120|
   131|   121|    await waitFor(() => {
   132|   122|      expect(screen.getByText('onboarding.passwordsDoNotMatch')).toBeTruthy();
   133|   123|    });
   134|   124|  });
   135|   125|
   136|   126|  it('does not mark setup complete when registration fails', async () => {
   137|   127|    registerAdminMock.mockRejectedValueOnce(new Error('Registration failed'));
   138|   128|
   139|   129|    const onComplete = vi.fn();
   140|   130|    render(<Onboarding mode="admin" onComplete={onComplete} />);
   141|   131|
   142|   132|    // Navigate through info slides
   143|   133|    for (let i = 0; i < 2; i++) {
   144|   134|      fireEvent.click(screen.getByText('onboarding.next'));
   145|   135|    }
   146|   136|
   147|   137|    // Workspace step
   148|   138|    fireEvent.change(screen.getByPlaceholderText('onboarding.prefilledWithWorkspace'), {
   149|   139|      target: { value: 'My Family' },
   150|   140|    });
   151|   141|    fireEvent.click(screen.getByText('onboarding.next'));
   152|   142|
   153|   143|    // Admin account step
   154|   144|    fireEvent.change(screen.getByPlaceholderText('onboarding.firstName'), {
   155|   145|      target: { value: 'Admin' },
   156|   146|    });
   157|   147|    fireEvent.change(screen.getByPlaceholderText('onboarding.lastName'), {
   158|   148|      target: { value: 'User' },
   159|   149|    });
   160|   150|    fireEvent.change(screen.getByPlaceholderText('onboarding.email'), {
   161|   151|      target: { value: 'admin@example.com' },
   162|   152|    });
   163|   153|
   164|   154|    const passwordInputs = screen.getAllByPlaceholderText('onboarding.password');
   165|   155|    fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
   166|   156|    fireEvent.change(passwordInputs[1], { target: { value: 'password123' } });
   167|   157|
   168|   158|    fireEvent.click(screen.getByText('onboarding.createAccount'));
   169|   159|
   170|   160|    await waitFor(
   171|   161|      () => {
   172|   162|        expect(screen.getByText('onboarding.accountCreationFailed')).toBeTruthy();
   173|   163|      },
   174|   164|      { timeout: 3000 }
   175|   165|    );
   176|   166|
   177|   167|    expect(markOnboardingSeenMock).not.toHaveBeenCalled();
   178|   168|    expect(updateAppSettingsMock).not.toHaveBeenCalled();
   179|   169|    expect(onComplete).not.toHaveBeenCalled();
   180|   170|  });
   181|   171|
   182|   172|  it('shows email already in use message on email conflict', async () => {
   183|   173|    registerAdminMock.mockRejectedValueOnce(new Error('This email is already in use'));
   184|   174|
   185|   175|    const onComplete = vi.fn();
   186|   176|    render(<Onboarding mode="admin" onComplete={onComplete} />);
   187|   177|
   188|   178|    for (let i = 0; i < 2; i++) {
   189|   179|      fireEvent.click(screen.getByText('onboarding.next'));
   190|   180|    }
   191|   181|
   192|   182|    fireEvent.change(screen.getByPlaceholderText('onboarding.prefilledWithWorkspace'), {
   193|   183|      target: { value: 'My Family' },
   194|   184|    });
   195|   185|    fireEvent.click(screen.getByText('onboarding.next'));
   196|   186|
   197|   187|    fireEvent.change(screen.getByPlaceholderText('onboarding.firstName'), {
   198|   188|      target: { value: 'Admin' },
   199|   189|    });
   200|   190|    fireEvent.change(screen.getByPlaceholderText('onboarding.lastName'), {
   201|   191|      target: { value: 'User' },
   202|   192|    });
   203|   193|    fireEvent.change(screen.getByPlaceholderText('onboarding.email'), {
   204|   194|      target: { value: 'admin@example.com' },
   205|   195|    });
   206|   196|
   207|   197|    const passwordInputs = screen.getAllByPlaceholderText('onboarding.password');
   208|   198|    fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
   209|   199|    fireEvent.change(passwordInputs[1], { target: { value: 'password123' } });
   210|   200|
   211|   201|    fireEvent.click(screen.getByText('onboarding.createAccount'));
   212|   202|
   213|   203|    await waitFor(() => {
   214|   204|      expect(screen.getByText('onboarding.emailAlreadyInUse')).toBeTruthy();
   215|   205|    });
   216|   206|
   217|   207|    expect(markOnboardingSeenMock).not.toHaveBeenCalled();
   218|   208|    expect(onComplete).not.toHaveBeenCalled();
   219|   209|  });
   220|   210|
   221|   211|  it('disables button and shows loading text while submitting', async () => {
   222|   212|    registerAdminMock.mockImplementation(
   223|   213|      () => new Promise((resolve) => setTimeout(() => resolve({ user: { id: 'u1' } }), 500))
   224|   214|    );
   225|   215|
   226|   216|    const onComplete = vi.fn();
   227|   217|    render(<Onboarding mode="admin" onComplete={onComplete} />);
   228|   218|
   229|   219|    for (let i = 0; i < 2; i++) {
   230|   220|      fireEvent.click(screen.getByText('onboarding.next'));
   231|   221|    }
   232|   222|
   233|   223|    fireEvent.change(screen.getByPlaceholderText('onboarding.prefilledWithWorkspace'), {
   234|   224|      target: { value: 'My Family' },
   235|   225|    });
   236|   226|    fireEvent.click(screen.getByText('onboarding.next'));
   237|   227|
   238|   228|    fireEvent.change(screen.getByPlaceholderText('onboarding.firstName'), {
   239|   229|      target: { value: 'Admin' },
   240|   230|    });
   241|   231|    fireEvent.change(screen.getByPlaceholderText('onboarding.lastName'), {
   242|   232|      target: { value: 'User' },
   243|   233|    });
   244|   234|    fireEvent.change(screen.getByPlaceholderText('onboarding.email'), {
   245|   235|      target: { value: 'admin@example.com' },
   246|   236|    });
   247|   237|
   248|   238|    const passwordInputs = screen.getAllByPlaceholderText('onboarding.password');
   249|   239|    fireEvent.change(passwordInputs[0], { target: { value: 'password123' } });
   250|   240|    fireEvent.change(passwordInputs[1], { target: { value: 'password123' } });
   251|   241|
   252|   242|    fireEvent.click(screen.getByText('onboarding.createAccount'));
   253|   243|
   254|   244|    // Button should be disabled immediately after click
   255|   245|    await waitFor(() => {
   256|   246|      const btn = screen.getByRole('button', { name: /onboarding.creatingAccount/ });
   257|   247|      expect(btn).toBeTruthy();
   258|   248|    });
   259|   249|  });
   260|   250|});
   261|   251|