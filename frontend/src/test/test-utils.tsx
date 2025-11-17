import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { Provider } from 'react-redux'
import { store } from '../store'
import { BrowserRouter } from 'react-router-dom'

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: any
  store?: any
}

export function renderWithProviders(
  ui: React.ReactElement,
  { preloadedState = {}, store: customStore = store, ...renderOptions }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={customStore}>
        <BrowserRouter>{children}</BrowserRouter>
      </Provider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

export * from '@testing-library/react'
export { default as userEvent } from '@testing-library/user-event'
