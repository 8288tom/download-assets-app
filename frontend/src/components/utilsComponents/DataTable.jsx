import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Icon from '@mdi/react';
import { mdiFolderArrowDownOutline,mdiVhs,mdiFormatSize,mdiAlphaC,mdiTextBoxOutline,mdiImageOutline, mdiVideo,mdiCodeJson, mdiHeadphones, mdiFilePdfBox } from '@mdi/js';
import "../../css/DataTable.css"



export default function DataTable({data, onSelectionChange}) {

  const columns = [
    { field: 'fileName',
     headerName: 'File Name',
     sortable: true,
      width: 15.2 * window.innerWidth / 100 
    },
  
    { field: 'fileSize',
     headerName: 'File Size',
     sortable: true,
    width: 10 * window.innerWidth / 100
    },
    {
      field: 'userOwner',
      headerName: 'User Owner',
      description: 'This column is the User owner of the file.',
      sortable: true,
      width: 12 * window.innerWidth / 100,
    },
    {
      field: 'groupOwner',
      headerName: 'Group Owner',
      description: 'This column is the Group owner of the file.',
      sortable: true,
      width: 12 * window.innerWidth / 100,
    },
    {
      field: 'fileType',
      headerName: 'File Type',
      sortable: true,
      width:25 * window.innerWidth / 100,
      _renderCell: (params) => {
        const icon = fileTypeIcons[params.value.toLowerCase()] || null;
        return (
          <div className="fileTypeContainer">
            {icon && <Icon path={icon} size={1.3} />}
            <span className="fileTypeText">{params.value}</span>
          </div>
        );
      },
      get renderCell() {
        return this._renderCell;
      },
      set renderCell(value) {
        this._renderCell = value;
      },
    }
    
  ];
  const rawData = data.output;
  const rows = rawData.map((row,idx)=>({
    id: idx,
    fileName: row.name,
    fileSize: row.size,
    userOwner: row.owner,
    groupOwner: row.group,
    fileType: row.extension || "directory"
  }));

  const handleSelectionChange= (selectedRows)=>{
    onSelectionChange(selectedRows);
  };
  const fileTypeIcons = {
    txt: mdiTextBoxOutline,
    jpg: mdiImageOutline,
    png: mdiImageOutline,
    jpeg: mdiImageOutline,
    mp4: mdiVideo,
    mp3: mdiHeadphones,
    mov: mdiVideo,
    wav:mdiHeadphones,
    pdf: mdiFilePdfBox,
    properties:mdiTextBoxOutline,
    json:mdiCodeJson,
    idm:mdiVhs,
    otf:mdiFormatSize,
    ttf:mdiFormatSize,
    idv:mdiAlphaC,
    jet:mdiAlphaC,
    directory: mdiFolderArrowDownOutline,
    // Add more mappings as needed
  };
  
  
  return <>
    <div className="data-table-container">
    <div className="data-grid-header"></div>
    <div className="data-table">
      <DataGrid 
        density='comfortable'
        disableColumnSelector
        rows={rows}
        columns={columns}
        initialState={{
          pagination: {
            paginationModel: { page: 0, pageSize: 50 },
          },
        }}
        pageSizeOptions={[50,100]}
        checkboxSelection
        filterDebounceMs={200}
        columnHeaderHeight={60}
        onRowSelectionModelChange={handleSelectionChange}
        sx={{fontFamily: 'Roboto, sans-serif',fontWeight:400,overflow: 'hidden', fontSize: "1.3em", color:'#040D12',
        '& .MuiCheckbox-root': {
          color: '#000', // default color (unchecked state)
          '&.Mui-checked': {
              color: '#fff', // color when checked
          },
      },
        '& .MuiDataGrid-root': {
          borderColor: '#fff',  
        },
        '& .MuiDataGrid-cell': {
          borderColor: '#fff', 
        },
        '& .MuiDataGrid-columnHeader': {
          borderColor: '#fff', 
          backgroundColor: '#205295', 
          color: '#D8D8D8'
        },
        '& .MuiDataGrid-row': {
          borderBottomColor: '#fff',
        },
        '& .MuiDataGrid-row.Mui-selected': {
          backgroundColor: '#749BC2', 
          '&:hover': {
              backgroundColor: '#A0BFE0', 
          }
        }}}
      />
      </div>
    </div>
  
  
  
  </>;
}
