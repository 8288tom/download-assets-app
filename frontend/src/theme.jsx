import { createTheme } from '@mui/material/styles';


const theme = createTheme({
  palette: {
    primary: {
      main: '#D8D8D8',
    },
    secondary: {
      main: '#C2DEDC',
    },
    third:{
        main:'#A3C7D6'
    },
    dark:{
        main:"#3F2E3E"
    },
    error: {
      main: '#f44336',
    },
    background: {
      default: '#FFD9B7',
    },
  },
});

export default theme;
