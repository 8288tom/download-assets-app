import * as React from 'react';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';


export default function BasicSelect({onSelect}) {


  const [value, setValue] = React.useState('');

  const handleChange = (event) => {
    const selectedValue = event.target.value;
    setValue(event.target.value);
    onSelect(selectedValue);
  };

  return (
    <Box sx={{ minWidth: 200, width:60, mr:5, ml:2.5}}>
<FormControl 
    fullWidth 
    sx={{
      '& .MuiOutlinedInput-root': {
        '&.Mui-focused fieldset': {
          borderColor: 'rgba(0,0,0,0.5)',
        },
      },
      '& .MuiInputLabel-root': {
        '&.Mui-focused': {
          color: 'rgba(0,0,0,0.5)', // Example color
        },
      },
    }}
  >
        <InputLabel id="demo-simple-select-label">Type</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={value}
          label="Type"
          onChange={handleChange}
        >
          <MenuItem value={"Scene Library"}>Scene Library</MenuItem>
          <MenuItem value={"IDM"}>IDM</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}