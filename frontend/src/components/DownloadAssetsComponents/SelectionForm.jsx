import "../../css/DownloadAssets.css"
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import TextField from "@mui/material/TextField"
import BasicSelect from "../utilsComponents/BasicSelect";
import { Box } from "@mui/material";
import { useState, useEffect } from "react"
import { Card, CardContent, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import DirectionSnackbar from "../utilsComponents/DirectionSnackbar"; 
import RandomSvg from "../utilsComponents/RandomSvg";
import Arrow from "../utilsComponents/Arrow";


export default function SelectionForm({handleNextStep}){
    
    const [checkedEnv, setCheckedEnv] = useState(null);
    const [selectedOption, setSelectedOption] = useState('');
    const [idValue, setIdValue] = useState("");
    const [responseData, setResponseData] = useState(null);
    const [isLoading, setIsLoading] = useState(false)
    const [randomNum, setRandomNum] = useState(null);
    const [formErrors, setFormErrors] = useState({});
    const [isVisible, setIsVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [errorTimestamp, setErrorTimestamp] = useState(null);

    
    const RegionCheckboxes = ({checkedEnv, handleCheck})=>{
      const theme= useTheme();
      return(
        <>
        <Typography 
        variant="body1" 
        sx={{
            display:"flex",
            justifyContent:"center",
            fontSize:"1.7em" 
        }}
        >Region 
        </Typography>
              <FormGroup className="env-checkboxes" 
            sx={{display:"flex",  flexDirection: "row", justifyContent:"center", mt:1.5,mb:5, ml:2.5}}>
              <FormControlLabel
                className="env-checkbox"
                control={<Checkbox sx={{
                  '&.Mui-checked': {
                    color: theme.palette.dark.main,
                  },
                }} size="large" checked={checkedEnv === "US"} onChange={handleCheck("US")} 
                />}
                label="US"
              />
          <FormControlLabel
            className="env-checkbox"
            control={<Checkbox sx={{
              '&.Mui-checked': {
                color: theme.palette.dark.main,
              },
            }} size="large" checked={checkedEnv === "EU"} onChange={handleCheck("EU")}
            />}
            label="EU"
          />
        </FormGroup>
        </>
      )
    }



    // handling form
    const onSubmit = async(data)=>{
      setIsLoading(true)
      let path ="";
      checkedEnv === "US" ? path="/us" : path="/eu"
      if (!validateForm()) {
        setIsLoading(false);
        setIsVisible(true)
        return;
    }
        try {
          const response = await fetch(path, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              typeOfAsset:selectedOption,  
              id: idValue,
              env: checkedEnv,
            }),
          });
          if (!response.ok) { // Check if the response status is not OK (e.g. 404, 500)
            const errorData = await response.json();
            throw new Error(errorData.message || "Error fetching data");
        }
        const jsonResponse = await response.json();
        setResponseData(jsonResponse);
        handleNextStep(jsonResponse);
    } catch (error) {
        console.error("Error submitting data:", error);
        // Set the error message to be displayed in the Snackbar
        setErrorMessage(error.message);
    } finally {
        setIsLoading(false);
    }
}
    // Removing number input func
    useEffect(() => {
      const num = Math.floor(Math.random() * 8) + 1;
      setRandomNum(num)
      const input = document.getElementById("outlined-basic");
      if (input) {
        const handleWheel = (e) => {
            e.preventDefault();
        };

        const handleKeyDown = (e) => {
            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                e.preventDefault();
            }
        };


        input.addEventListener("wheel", handleWheel, { passive: false });
        input.addEventListener("keydown", handleKeyDown);

        return () => {
            input.removeEventListener("wheel", handleWheel);
            input.removeEventListener("keydown", handleKeyDown);
        };
    }
}, []);

const validateForm = () => {
  let errors = {};
  if (!checkedEnv) {
      errors.checkedEnv = "Please select a region.";
  }
  
  if (!selectedOption) {
      errors.selectedOption = "Please select an option.";
  }
  if ((!idValue || isNaN(idValue)) || Number(idValue) <= 0) {
      errors.idValue = "Please provide a valid ID.";
  }

  setFormErrors(errors);

  return Object.keys(errors).length === 0;
};
    const handleCheck = (value) => () => {
        if (value === checkedEnv) {
          setCheckedEnv(null);
        } else {
          setCheckedEnv(value);
        }
      };
    const handleSelectChange = (value)=>{
        setSelectedOption(value);
      }

      const handleIdInput = (event) => {
        const inputValue = event.target.value;
        if (!/[eE]/.test(inputValue)) {
            setIdValue(inputValue);
        }
    }


    return(<>
    <Box sx={{position:"relative", height: "5vh"}}>
    <Typography 
        variant="h5" 
        align="center" 
        sx={{
            position: "absolute",
            top: "170%", // Adjusted from 50% to 60% to move it down by 10%
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: "3.5em" // Responsive font size based on viewport width
        }}
    >Download Assets 
    </Typography>
</Box>
      <Box
      sx={{display:"flex",
      justifyContent:"center",
      alignItems:"center",
      minHeight:"95vh"}}
      >
      <form>
      <Card raised={true} sx={{height:600, width:450, borderRadius:"5%"}}  className="gradient">
      {randomNum && <RandomSvg randomNum={randomNum}/>}
      <CardContent sx={{pt:0}}>
        <Box sx={{position:"relative", bottom:"10px"}}>
      <RegionCheckboxes checkedEnv={checkedEnv} handleCheck={handleCheck} />
      <div className={isVisible ? "error-text fade-in visible" : "error-text fade-in"}>{formErrors.checkedEnv}</div>
      </Box>
      <Box sx={{display:"block", ml:10, pb:3, pt:3}}>
      <BasicSelect onSelect={handleSelectChange} sx={{width:200, borderColor:"red"}} />
      </Box>
      <div className={isVisible ? "error-text fade-in visible" : "error-text fade-in"}>{formErrors.selectedOption}</div>
      <Box sx={{ml:"40%"}}>
      { isLoading ? <div className="loader-container"><div className="loader"></div></div> : null}
      </Box>
    
      <TextField 
      className="center-textfield" 
      id="outlined-basic" 
      label="ID" 
      variant="outlined" 
      type="number" 
      sx={{width:200,
          mt:12,
          ml:12.5,
          '& .MuiOutlinedInput-root': {'&.Mui-focused fieldset': 
          {borderColor: 'rgba(0,0,0,0.5)'}}, '& .MuiInputLabel-root': {
            '&.Mui-focused': {
              color: 'rgba(0,0,0,0.5)', 
            },
          }}} 
      value={idValue} 
      onInput={handleIdInput}
      placeholder="211544"
      helperText={formErrors.idValue || " "}
      error={Boolean(formErrors.idValue)}
      />
  
      <Arrow onClick={onSubmit}/>
      </CardContent>
      </Card>
      </form>
      </Box>
      <DirectionSnackbar message={errorMessage} show={!!errorMessage} errorTimestamp={errorTimestamp} setIsLoading={setIsLoading} />
      </>
    )
}