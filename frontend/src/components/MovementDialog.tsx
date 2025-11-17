import React, { useState } from 'react'
import { Dialog, DialogTitle, DialogContent, TextField, DialogActions, Button, MenuItem, Grid } from '@mui/material'
import { useCreateMovementMutation } from '../services/api'

type Props = {
  open: boolean
  onClose: () => void
}

export default function MovementDialog({ open, onClose }: Props) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [value, setValue] = useState<number | ''>('')
  const [type, setType] = useState<'ingress' | 'egress'>('egress')
  const [create, { isLoading }] = useCreateMovementMutation()

  const onSubmit = async () => {
    if (!name || !category || value === '') return
    try {
      await create({ name, category, value: Number(value), type }).unwrap()
      setName('')
      setCategory('')
      setValue('')
      setType('egress')
      onClose()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>New Movement</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Category" value={category} onChange={(e) => setCategory(e.target.value)} fullWidth />
          </Grid>
          <Grid item xs={12}>
            <TextField label="Value" value={value} onChange={(e) => setValue(e.target.value === '' ? '' : Number(e.target.value))} fullWidth type="number" />
          </Grid>
          <Grid item xs={12}>
            <TextField select label="Type" value={type} onChange={(e) => setType(e.target.value as any)} fullWidth>
              <MenuItem value="ingress">Ingress (income)</MenuItem>
              <MenuItem value="egress">Egress (expense)</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSubmit} variant="contained" disabled={isLoading}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  )
}
