import React, { useState } from "react";
import { useClearAllMutation, useGetMovementsQuery } from "../services/api";
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  TextField,
  Grid,
  MenuItem,
  Button,
  ListItemIcon,
  Box,
} from "@mui/material";
import { green, red } from "@mui/material/colors";
import ArrowUpward from "@mui/icons-material/ArrowUpward";
import ArrowDownward from "@mui/icons-material/ArrowDownward";
import dayjs from "dayjs";

export default function Movements() {
  const [filters, setFilters] = useState({
    type: "",
    category: "",
    startDate: "",
    endDate: "",
  });
  const { data: movements, isLoading } = useGetMovementsQuery(filters);

  const [clearAll, {isLoading:isLoadingDelete}] = useClearAllMutation();
  // In your component:
  const handleClearAll = async () => {
    try {
      await clearAll().unwrap();
      // Handle success (show toast, etc.)
    } catch (error) {
      // Handle error
    }
  };

  return (
    <div>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Movements
      </Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={3}>
          <TextField
            select
            label="Type"
            value={filters.type}
            onChange={(e) =>
              setFilters((s) => ({ ...s, type: e.target.value }))
            }
            fullWidth
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="ingress">Ingress</MenuItem>
            <MenuItem value="egress">Egress</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            label="Category"
            value={filters.category}
            onChange={(e) =>
              setFilters((s) => ({ ...s, category: e.target.value }))
            }
            fullWidth
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            label="Start date"
            type="date"
            value={filters.startDate}
            onChange={(e) =>
              setFilters((s) => ({ ...s, startDate: e.target.value }))
            }
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <TextField
            label="End date"
            type="date"
            value={filters.endDate}
            onChange={(e) =>
              setFilters((s) => ({ ...s, endDate: e.target.value }))
            }
            fullWidth
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>

      <Button variant="contained" color="warning" onClick={handleClearAll} disabled={isLoadingDelete} sx={{ mb: 2 }}>
        Clear all movements
      </Button>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <List>
          {movements?.map((m) => (
            <ListItem key={m.id} divider>
              <ListItemIcon>
                {m.type === 'egress' ? (
                  <ArrowDownward sx={{ color: red[500] }} />
                ) : (
                  <ArrowUpward sx={{ color: green[500] }} />
                )}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {m.name}
                    <Typography
                      component="span"
                      sx={{
                        color: m.type === 'egress' ? red[500] : green[500],
                        fontWeight: 'bold'
                      }}
                    >
                      ${m.value.toFixed(2)}
                    </Typography>
                  </Box>
                }
                secondary={`${m.category} • ${dayjs(m.date).format("DD MMM YYYY, hh:mm A")}`}
              />
            </ListItem>
          ))}
        </List>
      )}
    </div>
  );
}
