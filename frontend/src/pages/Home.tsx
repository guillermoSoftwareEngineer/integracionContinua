import React, { useState } from 'react'
import { Card, CardContent, Typography, Grid, Button, Fab } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { useClearAllMutation, useGetSummaryQuery } from '../services/api'
import MovementDialog from '../components/MovementDialog'
import { Link } from 'react-router-dom'

export default function Home() {
  const { data: summary, isLoading, isError } = useGetSummaryQuery()
  const [open, setOpen] = useState(false)

  

  return (
    <div>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Balance</Typography>
              <Typography variant="h4">{isLoading ? 'Loading...' : `$${summary?.balance.toFixed(2) ?? '0.00'}`}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Income</Typography>
              <Typography variant="h5">{isLoading ? '...' : `$${summary?.total_income.toFixed(2) ?? '0.00'}`}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Expenses</Typography>
              <Typography variant="h5">{isLoading ? '...' : `$${summary?.total_expenses.toFixed(2) ?? '0.00'}`}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <div className="mt-6 flex justify-start items-center gap-4">
        <Button variant="contained" component={Link} to="/movements">
          See all movements
        </Button>
      </div>

      <Fab color="primary" aria-label="add" onClick={() => setOpen(true)} sx={{ position: 'fixed', right: 24, bottom: 24 }}>
        <AddIcon />
      </Fab>

      <MovementDialog open={open} onClose={() => setOpen(false)} />
    </div>
  )
}
