import { useState } from "react"
import AssetsTable from "./DownloadAssetsComponents/AssetsTable"
import "../css/DownloadAssets.css"
import SelectionForm from "./DownloadAssetsComponents/SelectionForm";
import "../css/App.css"
export default function DownloadAssets(){
  const [currentStep, setCurrentStep] = useState("SelectionForm"); // Initial step
  const [responseData, setResponseData] = useState(null); // Data received from server

  const handleNextStep = (response) => {
    setResponseData(response);
    if (response.typeOfAsset === "Scene Library" || response.typeOfAsset === "IDM" ){
      setCurrentStep("AssetsTable")
    }
    else{
      setCurrentStep("SelectionForm")
    }
  };
  // Render components based on the current step
  let currentComponent;

  switch (currentStep) {
    case "SelectionForm":
      currentComponent = <SelectionForm handleNextStep={handleNextStep} />;
      break;
    case "AssetsTable":
      currentComponent = <AssetsTable  responseData={responseData} handleNextStep={handleNextStep} setResponseData={setResponseData}/>;
      break;
    default:
      currentComponent = <SelectionForm handleNextStep={handleNextStep} />;
  }

// render current component:
  return (
    <div>
      {currentComponent}
    </div>
  );

}
