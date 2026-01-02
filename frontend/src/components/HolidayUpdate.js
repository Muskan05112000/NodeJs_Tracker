import React, { useState, useEffect, useContext } from "react";
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  Checkbox,
  ListItemText,
  Autocomplete
} from "@mui/material";
import { getNames as getCountryNames } from 'country-list';
import { City } from 'country-state-city';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

import AlertDialog from "./AlertDialog";
import { AppContext } from "../context/AppContext";
const API_BASE = process.env.REACT_APP_API_URL || '/api';

const HolidayUpdate = () => {
  const [selectedHoliday, setSelectedHoliday] = useState(null);
  const [open, setOpen] = useState(false);
  const [country, setCountry] = useState("");
  // Always store cities as array of objects with label, value, state, raw
  const [cities, setCities] = useState([]);
  const [date, setDate] = useState("");
  const [occasion, setOccasion] = useState("");
  const [isNational, setIsNational] = useState(false);
  const [countryCities, setCountryCities] = useState([]);
  const { holidays, setHolidays } = useContext(AppContext);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (country) {
      try {
        const countryCode = require('country-list').getCode(country);
        if (countryCode) {
          let cityObjs = City.getCitiesOfCountry(countryCode);
          // Remove ' Urban' and ' Rural' suffixes and deduplicate
          const seen = new Set();
          const formattedCities = [];
          cityObjs.forEach(city => {
            let baseName = city.name.replace(/\s+(Urban|Rural)$/i, '');
            if (!seen.has(baseName)) {
              seen.add(baseName);
              formattedCities.push({
                label: city.stateCode ? `${baseName} (${city.stateCode})` : baseName,
                value: baseName,
                state: city.stateCode || '',
                raw: city
              });
            }
          });
          // Ensure specific requested cities are present for India
          if (country === 'India') {
            const extraCities = ['Kochi', 'Mangalore', 'Visakhapatnam'];
            extraCities.forEach(c => {
              if (!seen.has(c)) {
                seen.add(c);
                formattedCities.push({ label: c, value: c, state: '', raw: { name: c } });
              }
            });
          }
          setCountryCities(formattedCities);
        } else {
          setCountryCities([]);
        }
      } catch (err) {
        setCountryCities([]);
      }
    } else {
      setCountryCities([]);
    }
  }, [country]);

  const handleCountryChange = (e) => {
    setCountry(e.target.value);
    setCities([]);
  };

  const handleCitiesChange = (e) => {
    setCities(e.target.value);
  };

  const countryList = getCountryNames();

  const handleSubmit = async () => {
    // Add new holiday to backend and context
    if (!date || !occasion || cities.length === 0) {
      setAlertMsg("Please fill all fields and select at least one city.");
      setAlertOpen(true);
      return;
    }
    const newHoliday = {
      occasion: occasion,
      date: date,
      locations: cities.map(c => c.value),
      country: country,
      national: isNational,
      // You can add more fields if needed
    };
    setIsSubmitting(true);
    try {
      const token = sessionStorage.getItem('token');
      const res = await fetch(`${API_BASE}/holidays`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(newHoliday)
      });
      if (!res.ok) throw new Error((await res.json()).error || "Failed to add holiday");
      const savedHoliday = await res.json();
      setHolidays(prev => [...prev, savedHoliday]);
      setOpen(false);
      setCountry("");
      setCities([]);
      setDate("");
      setOccasion("");
      setIsNational(false);
      setAlertMsg("Holiday added successfully!");
      setAlertOpen(true);
    } catch (err) {
      setAlertMsg("Failed to add holiday: " + err.message);
      setAlertOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 4, fontFamily: 'Inter, Segoe UI, Roboto, Arial, sans-serif', bgcolor: '#f6f8fa', minHeight: '100vh' }}>
      <Typography variant="h4" fontWeight={700} mb={4} color="#222">
        Holiday Update
      </Typography>

      <Button
        variant="contained"
        color="secondary"
        startIcon={<CalendarTodayIcon />}
        sx={{ borderRadius: 2, fontWeight: 700, px: 4, py: 1.5, fontSize: 18, mb: 2 }}
        onClick={() => {
          setCountry("");
          setCities([]);
          setDate("");
          setOccasion("");
          setIsNational(false);
          setSelectedHoliday(null);
          setOpen(true);
        }}
      >
        Update Regional/National Holiday
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth
        PaperProps={{
          sx: {
            borderRadius: 6,
            boxShadow: '0 10px 40px 0 rgba(124,77,255,0.15)',
            background: 'linear-gradient(135deg, #fff 80%, #ede7f6 100%)',
            px: 2,
            py: 1.5,
            fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
          }
        }}
      >
        <DialogTitle sx={{
          fontWeight: 900,
          fontSize: 28,
          color: '#4e2a84',
          letterSpacing: 0.3,
          fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
          textShadow: '0 2px 8px #b388ff22',
          mb: 1,
          textAlign: 'center',
          background: 'linear-gradient(90deg, #ede7f6 0%, #fff 100%)',
          borderRadius: '18px 18px 0 0',
          pb: 2,
        }}>
          Update Regional/National Holiday
        </DialogTitle>
        <DialogContent dividers sx={{
          background: 'linear-gradient(135deg, #fafaff 90%, #ede7f6 100%)',
          borderRadius: 4,
          fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
          px: 3,
          py: 2,
        }}>
          {/* Dropdown for existing holidays - now only inside the dialog */}
          <Autocomplete
            fullWidth
            options={holidays}
            getOptionLabel={h => `${h.occasion} (${h.date}${h.national ? ', National' : ''}${h.locations && h.locations.length ? ', ' + h.locations.join(', ') : ''})`}
            renderInput={params => (
              <TextField {...params} label="Revoke Existing Holiday" variant="outlined" sx={{ mb: 3, fontWeight: 600, fontSize: 16, color: '#4e2a84' }} />
            )}
            onChange={(e, selected) => {
              if (!selected) {
                setSelectedHoliday(null);
                return;
              }
              setCountry(selected.country || "");
              setDate(selected.date);
              setOccasion(selected.occasion);
              setIsNational(!!selected.national);
              setCities((selected.locations || []).map(loc => ({ value: loc, label: loc })));
              setSelectedHoliday(selected);
            }}
            isOptionEqualToValue={(o, v) => o._id === v._id}
            value={selectedHoliday || null}
          />
          <Autocomplete
            fullWidth
            options={countryList}
            value={country}
            onChange={(e, val) => {
              setCountry(val || "");
              setCities([]);
            }}
            renderInput={(params) => (
              <TextField {...params} label="Country" variant="outlined" sx={{ mb: 3 }} />
            )}
            filterSelectedOptions
            autoHighlight
            autoSelect
            isOptionEqualToValue={(option, value) => option === value}
            getOptionLabel={(option) => option || ""}
          />
          <Autocomplete
            multiple
            fullWidth
            options={countryCities}
            value={cities}
            onChange={(e, val) => {
              // If any value is a string, convert it to the correct city object
              const fixed = val.map(v => {
                if (!v) return null;
                if (typeof v === 'string') {
                  // Find in countryCities
                  const match = countryCities.find(c => c.label === v || c.value === v);
                  return match || { label: v, value: v };
                }
                return v;
              }).filter(Boolean);
              setCities(fixed);
            }}
            renderInput={(params) => (
              <TextField {...params} label="Cities" variant="outlined" sx={{ mb: 3 }} />
            )}
            filterSelectedOptions
            autoHighlight
            autoSelect
            isOptionEqualToValue={(option, value) => {
              if (!option || !value) return false;
              return (option.label || option) === (value.label || value);
            }}
            getOptionLabel={(option) => (option && option.label) || (typeof option === 'string' ? option : '')}
            disabled={!country || countryCities.length === 0}
            noOptionsText={country ? "No cities found for this country" : "Select a country first"}
            filterOptions={(options, state) => {
              const input = state.inputValue.trim().toLowerCase();
              if (!input) return options;
              return options.filter(option => (option.label || option).toLowerCase().includes(input));
            }}
            renderTags={(value, getTagProps) =>
              value.filter(Boolean).map((option, index) => (
                <span {...getTagProps({ index })} key={(option && option.value) || option} style={{
                  background: '#ede7f6',
                  color: '#4e2a84',
                  borderRadius: 8,
                  padding: '2px 8px',
                  marginRight: 4,
                  fontWeight: 600,
                  fontSize: 15
                }}>
                  {(option && option.value) || option}
                </span>
              ))
            }
          />
          <TextField
            label="Holiday Date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            fullWidth
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 3 }}
          />
          <TextField
            label="Occasion"
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            fullWidth
            multiline
            rows={2}
            sx={{ mb: 1 }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 1 }}>
            <Typography sx={{ mr: 2, fontWeight: 700 }}>Type:</Typography>
            <FormControl>
              <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                <label style={{ display: 'flex', alignItems: 'center', marginRight: 16 }}>
                  <input
                    type="radio"
                    checked={!isNational}
                    onChange={() => setIsNational(false)}
                    style={{ marginRight: 6 }}
                  />
                  Regional Holiday
                </label>
                <label style={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="radio"
                    checked={isNational}
                    onChange={() => setIsNational(true)}
                    style={{ marginRight: 6 }}
                  />
                  National Holiday
                </label>
              </Box>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'flex-end', px: 3, py: 2 }}>
          <Button
            onClick={() => setOpen(false)}
            variant="outlined"
            disabled={isSubmitting}
            sx={{
              borderRadius: 2,
              fontWeight: 700,
              mr: 2,
              px: 4,
              py: 1.2,
              fontSize: 17,
              boxShadow: 2,
              background: 'linear-gradient(90deg, #fff 0%, #ede7f6 100%)',
              border: '2px solid #b39ddb',
              color: '#7c4dff',
              fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
              transition: 'background 0.18s, border-color 0.18s, color 0.18s',
              '&:hover': { background: '#ede7f6', borderColor: '#7c4dff', color: '#222' },
              '&:active': { background: '#ede7f6', borderColor: '#4e2a84', color: '#4e2a84' },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="secondary"
            disabled={isSubmitting}
            sx={{
              borderRadius: 2,
              fontWeight: 700,
              mx: 1,
              px: 4,
              py: 1.2,
              fontSize: 17,
              background: 'linear-gradient(90deg, #7c4dff 0%, #b388ff 100%)',
              boxShadow: 2,
              color: '#fff',
              fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
              transition: 'background 0.18s, box-shadow 0.18s, color 0.18s',
              '&:hover': { background: 'linear-gradient(90deg, #b388ff 0%, #7c4dff 100%)', color: '#fff' },
              '&:active': { background: 'linear-gradient(90deg, #7c4dff 0%, #b388ff 100%)', color: '#fff' },
            }}
          >
            Submit
          </Button>
          {selectedHoliday && (
            <Button
              disabled={isSubmitting}
              onClick={async () => {
                setIsSubmitting(true);
                try {
                  const token = sessionStorage.getItem('token');
                  const res = await fetch(`${API_BASE}/holidays/${selectedHoliday._id}`, {
                    method: 'DELETE',
                    headers: token ? { 'Authorization': `Bearer ${token}` } : {}
                  });
                  if (!res.ok) throw new Error((await res.json()).error || 'Failed to revoke holiday');
                  setHolidays(prev => prev.filter(h => h._id !== selectedHoliday._id));
                  setOpen(false);
                  setCountry("");
                  setCities([]);
                  setDate("");
                  setOccasion("");
                  setIsNational(false);
                  setSelectedHoliday(null);
                } catch (err) {
                  setAlertMsg('Failed to revoke holiday: ' + err.message);
                  setAlertOpen(true);
                } finally {
                  setIsSubmitting(false);
                }
              }}
              variant="contained"
              color="error"
              sx={{
                borderRadius: 2,
                fontWeight: 700,
                ml: 2,
                px: 4,
                py: 1.2,
                fontSize: 17,
                background: 'linear-gradient(90deg, #ff1744 0%, #ff8a80 100%)',
                boxShadow: 2,
                color: '#fff',
                fontFamily: 'Poppins, Inter, Segoe UI, Arial, sans-serif',
                transition: 'background 0.18s, box-shadow 0.18s, color 0.18s',
                '&:hover': { background: 'linear-gradient(90deg, #ff8a80 0%, #ff1744 100%)', color: '#fff' },
                '&:active': { background: 'linear-gradient(90deg, #ff1744 0%, #ff8a80 100%)', color: '#fff' },
              }}
            >
              Revoke
            </Button>
          )}
        </DialogActions>
      </Dialog>
      <AlertDialog
        open={alertOpen}
        message={alertMsg}
        onClose={() => setAlertOpen(false)}
      />
    </Box>
  );
};

export default HolidayUpdate;
