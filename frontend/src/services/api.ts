import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export type Movement = {
  id: number
  name: string
  category: string
  value: number
  type: 'ingress' | 'egress'
  date: number
  createdAt: number
}

type Summary = {
  total_income: number
  total_expenses: number
  balance: number
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3000/api' }),
  tagTypes: ['Movements', 'Summary'],
  endpoints: (builder) => ({
    clearAll: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: '/movements/clear-all',
        method: 'DELETE',
        headers: {
          "secret-key": import.meta.env.VITE_SECRET_KEY,
        },
      }),
      invalidatesTags: ['Movements', 'Summary'],
    }),
    getSummary: builder.query<Summary, void>({
      query: () => '/movements/summary',
      providesTags: ['Summary'],
    }),
    getMovements: builder.query<Movement[], Record<string, any>>({
      query: (params) => ({ url: '/movements', params }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Movements' as const, id })), { type: 'Movements', id: 'LIST' }]
          : [{ type: 'Movements', id: 'LIST' }],
    }),
    createMovement: builder.mutation<{ id: number }, Partial<Movement>>({
      query: (body) => ({ url: '/movements', method: 'POST', body }),
      invalidatesTags: [{ type: 'Movements', id: 'LIST' }, 'Summary'],
    }),
    updateMovement: builder.mutation<{ message: string }, { id: number; body: Partial<Movement> }>({
      query: ({ id, body }) => ({ url: `/movements/${id}`, method: 'PATCH', body }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Movements', id }, 'Summary'],
    }),
  }),
})

export const { 
  useGetSummaryQuery, 
  useGetMovementsQuery, 
  useCreateMovementMutation, 
  useUpdateMovementMutation,
  useClearAllMutation
} = api
