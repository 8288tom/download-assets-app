import DownloadAssets from './components/DownloadAssets';
import { ThemeProvider } from '@mui/material/styles';
import theme from "./theme";
import { Helmet } from 'react-helmet';


function App() {

  return (<>
    <Helmet>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap"/>
      </Helmet>
    <ThemeProvider theme={theme}>
    <DownloadAssets/>
    </ThemeProvider>
   

    </>
  );
}

export default App;
