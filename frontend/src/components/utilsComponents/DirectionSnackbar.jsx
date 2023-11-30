import * as React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Slide from '@mui/material/Slide';
import { useEffect } from 'react';


function TransitionLeft(props) {
  return <Slide {...props} direction="left" />;
}

function TransitionUp(props) {
  return <Slide {...props} direction="up" />;
}

function TransitionRight(props) {
  return <Slide {...props} direction="right" />;
}

function TransitionDown(props) {
  return <Slide {...props} direction="down" />;
}

export default function DirectionSnackbar({message, show, errorTimestamp, setIsLoading}) {
  const [open, setOpen] = React.useState(false);
  const [transition, setTransition] = React.useState(undefined);

  useEffect(() => {
    if (errorTimestamp) {
      setOpen(false);
      setTransition(() => TransitionUp)
      setTimeout(() => {
        setOpen(show); 
      }, 50); 
    }
  }, [show, errorTimestamp]);


  const handleClose = () => {
    setOpen(false);
  };


  return (
      <Snackbar
        className='snackbar'
        anchorOrigin={{vertical:'bottom', horizontal:'center'}}
        open={open}
        onClose={handleClose}
        TransitionComponent={transition}
        autoHideDuration={5000}
        message={message}
        key={message + errorTimestamp}
      />
  
  );
}
