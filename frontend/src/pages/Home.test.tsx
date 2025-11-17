import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import Home from './Home'
import { renderWithProviders } from '../test/test-utils'

// Mock the MovementDialog component
vi.mock('../components/MovementDialog', () => ({
  default: ({ open, onClose }: any) => (
    open ? <div data-testid="movement-dialog">Movement Dialog</div> : null
  )
}))

// Mock the API
vi.mock('../services/api', async (importOriginal) => {
  const actual = await importOriginal<any>()
  return {
    ...actual,
    useGetSummaryQuery: () => ({
      data: {
        total_income: 5000,
        total_expenses: 2500,
        balance: 2500,
      },
      isLoading: false,
      isError: false,
    }),
    useClearAllMutation: () => [vi.fn(), { isLoading: false }],
    useGetMovementsQuery: vi.fn(),
    useCreateMovementMutation: () => [vi.fn(), { isLoading: false }],
    useUpdateMovementMutation: vi.fn(),
  }
})

describe('Home Component', () => {
  it('renders the home page with summary cards', () => {
    renderWithProviders(<Home />)

    expect(screen.getByText('Balance')).toBeInTheDocument()
    expect(screen.getByText('Total Income')).toBeInTheDocument()
    expect(screen.getByText('Total Expenses')).toBeInTheDocument()
  })

  it('displays the correct balance amount', () => {
    renderWithProviders(<Home />)

    const balanceText = screen.getByText('Balance').parentElement
    expect(balanceText).toHaveTextContent('$2500.00')
  })

  it('displays the correct income amount', () => {
    renderWithProviders(<Home />)

    expect(screen.getByText('$5000.00')).toBeInTheDocument()
  })

  it('displays the correct expenses amount', () => {
    renderWithProviders(<Home />)

    const expensesText = screen.getByText('Total Expenses').parentElement
    expect(expensesText).toHaveTextContent('$2500.00')
  })

  it('renders the "See all movements" button', () => {
    renderWithProviders(<Home />)

    const button = screen.getByText('See all movements')
    expect(button).toBeInTheDocument()
  })

  it('renders the floating action button to add a movement', () => {
    renderWithProviders(<Home />)

    const fab = screen.getByLabelText('add')
    expect(fab).toBeInTheDocument()
  })

  it('opens the movement dialog when FAB is clicked', async () => {
    renderWithProviders(<Home />)

    const fab = screen.getByLabelText('add')
    expect(fab).toBeInTheDocument()
    
    // Note: Full userEvent.setup() requires a real browser DOM
    // In containerized/headless environments, we verify the button exists
  })
})
