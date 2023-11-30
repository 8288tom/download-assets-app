import { useState, useEffect } from "react";
import DataTable from "../utilsComponents/DataTable";
import Button from '@mui/material/Button';
import  "../../css/DownloadAssets.css"
import  "../../css/Loader.css"
import DirectionSnackbar from "../utilsComponents/DirectionSnackbar";
import {Typography} from '@mui/material'
import DownloadSharpIcon from '@mui/icons-material/DownloadSharp';
import SubdirectoryArrowRightOutlinedIcon from '@mui/icons-material/SubdirectoryArrowRightOutlined';
import SubdirectoryArrowLeftOutlinedIcon from '@mui/icons-material/SubdirectoryArrowLeftOutlined';
import ViewAgendaOutlinedIcon from '@mui/icons-material/ViewAgendaOutlined';
import streamSaver from 'streamsaver';

export default function AssetsTable({responseData, handleNextStep, setResponseData}){
    const fontFamilia = ["Roboto", "Courier", "monospace"]
    const fontWeight = 200;
    const btnFontSize="1.25em"
    const {id, typeOfAsset, env} = responseData;
    const assetPath=`/idomoo-grid/public_assets/${id}/assets/` //`/Users/tom.shaked/Desktop/idomoo-grid/public_assets/${id}/assets/`
    const idmPath=  `/idomoo-grid/projects/${id}/` //`/Users/tom.shaked/Desktop/idomoo-grid/projects/${id}/`
    let apiDownloadPath ="";
    if (env==="US"){apiDownloadPath="/us/download"}else{apiDownloadPath="/eu/download"};

    // states:
    const [isLoading, setIsLoading] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState([]);
    const [deeperPath, setDeeperPath]= useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [errorTimestamp, setErrorTimestamp] = useState(null);
    
    
    const isDirectorySelected = () => {
      // Check if the selectedAsset's extension is 'directory' in the responseData.output
      if (selectedAsset.length === 1) { //checks if selectedAsset is no more than 1
        const selectedName = selectedAsset[0];
        const selectedItem = responseData.output.find(item => item.name === selectedName); // looks for the selected asset and if it's directory then returns true
        return selectedItem && selectedItem.extension === "directory";
      }
      return false;
    };

 

    const goBack = async () => {
        if (typeOfAsset === "Scene Library") {
            setDeeperPath(assetPath);
          } else {
            setDeeperPath(idmPath);
          }
        setIsLoading(true)
        let path ="";
        env === "US" ? path="/us/" : path="/eu/"
          try {
            const response = await fetch(path, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                typeOfAsset:typeOfAsset,  
                id: id,
                env: env,
              }),
            });
            const jsonResponse = await response.json();
            setIsLoading(false)
            setResponseData(jsonResponse);
          } catch (error) {
            console.error("Error submitting data:", error);
          }
        };


  useEffect(() => {
    if (typeOfAsset === "Scene Library") {
      setDeeperPath(assetPath);
    } else {
      setDeeperPath(idmPath);
    }
  }, []);



    const handleSelectionChange= (selection)=>{
        setSelectedAsset(
            selection.map((index)=>
                responseData.output[index].name
            )
        )
    }
const downloadFiles = async () => {
    setIsLoading(true);
    try {
        const response = await fetch(apiDownloadPath, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                typeOfAsset: typeOfAsset,
                id: id,
                env: env,
                assets: selectedAsset,
                deeperPath: deeperPath,
            }),
        });

        if (response.ok) {
            const fileStream = streamSaver.createWriteStream('Assets.zip');
            const readableStream = response.body;

            // Progress calculation
            const contentLength = +response.headers.get('Content-Length') || 0; // total length of content
            let loaded = 0;
            const writer = fileStream.getWriter();

            // Use the pump() function to keep reading until there's no more data
            const pump = async (reader) => {
                const { done, value } = await reader.read();
                if (done) {
                    writer.close();
                    setIsLoading(false);
                } else {
                    loaded += value.length;
                    const progress = Math.floor((loaded / contentLength) * 100);
                    console.log(`Downloaded: ${progress}%`); // You can replace this with a progress bar or any visual indicator

                    await writer.write(value);
                    return pump(reader);
                }
            };

            pump(readableStream.getReader());
        } else {
            let errorMessage;
            if (response.status === 500) {
                errorMessage = "Internal Server Error. Please try again later.";
            } else {
                errorMessage = await response.text();
            }

            console.error(`Error: ${errorMessage}`);
            setErrorMessage(errorMessage);
            setErrorTimestamp(Date.now());
        }
    } catch (error) {
        console.error("Error submitting data:", error);
        setErrorMessage("Error while downloading files.");
        setErrorTimestamp(Date.now());
    }
    
};


    const changeDirectory = async () => {
        setIsLoading(true)
        env === "US" ? apiDownloadPath="/us/" : apiDownloadPath="/eu/"
        const updatedDeeperPath = `${deeperPath}${selectedAsset.join("/") + "/"}`;
    
        setDeeperPath(updatedDeeperPath);
          try {
            const response = await fetch(apiDownloadPath, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                typeOfAsset:typeOfAsset,  
                id: id,
                env: env,
                requestedFolder: encodeURIComponent(selectedAsset.join("/")),
                pathOnFs: encodeURIComponent(updatedDeeperPath) // URL encode path
              }),
            });
            if (response.status === 500) {
              // Handle 500 error specifically
              console.error("Server returned a 500 error");
              setErrorMessage("Internal Server Error. Please try again later.")
              setErrorTimestamp(Date.now());
          } else if (response.ok) {
              const jsonResponse = await response.json();
              setResponseData(jsonResponse);
              setSelectedAsset([]);
          } else {
              console.error("Unexpected server response:", response.status);
              setErrorMessage("Error while changing directory")
              setErrorTimestamp(Date.now())
          }
          } catch (error) {
            console.error("Error submitting data:", error);
            setErrorMessage("Error while changing directory")
            setErrorTimestamp(Date.now)
          }
          setIsLoading(false)
        };


        
    return(
        <div>
            <Typography variant="h4" mb={2} mt={2} align="center">Selecting {typeOfAsset==="Scene Library"? "assets" : "IDMs"} from {typeOfAsset==="Scene Library"? "Scene Library" : "Scene"}: {id}</Typography>
            <DataTable key={deeperPath} data={responseData} onSelectionChange={handleSelectionChange}/>
            <div className="buttons-container">
            <div className="back-buttons">
            <Button variant="contained" color="secondary" size="large"
            startIcon={<SubdirectoryArrowLeftOutlinedIcon/>}
             onClick={goBack}
              sx={{pl:1.5,pr:1.5, ml:2, mr:2, fontSize:btnFontSize,fontFamily:fontFamilia, fontWeight:fontWeight}}>
                Back</Button>
            <Button variant="contained" color="secondary" size="large"
            startIcon={<ViewAgendaOutlinedIcon/>}
             onClick={()=>handleNextStep("SelectionForm")}
              sx={{pl:1.5,pr:1.5, ml:2, mr:2, fontSize:btnFontSize, fontFamily:fontFamilia, fontWeight:fontWeight}}>
                Back to Selection</Button>
            </div>
            <div className="action-buttons">
            <Button className="button" variant="contained" color="third" size="large" 
              startIcon={<DownloadSharpIcon/>}
             onClick={downloadFiles}
              disabled={isLoading || (selectedAsset.length<1)} sx={{pl:1.5,pr:1.5, ml:2, mr:2, fontSize:btnFontSize, fontFamily:fontFamilia, fontWeight:fontWeight}}>
                Download</Button>
            <Button variant="contained" color="third" size="large"
              startIcon={<SubdirectoryArrowRightOutlinedIcon/>}
             disabled={!isDirectorySelected() || isLoading}
              onClick={changeDirectory}
               sx={{pl:1.5,pr:1.5, ml:2, mr:2,fontSize:btnFontSize,fontFamily:fontFamilia, fontWeight:fontWeight}}>
                Change Directory</Button>
            </div>
            </div>
            {isLoading ? <div className="loader" style={{top:"86%", left:"91%", width:"52px"}}></div>:null}
            <DirectionSnackbar message={errorMessage} show={!!errorMessage} errorTimestamp={errorTimestamp} setIsLoading={setIsLoading} />

        </div>
    )

}