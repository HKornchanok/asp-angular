import { ColDef } from 'ag-grid-community';
import { BarcodeCellComponent } from './components/barcode-cell/barcode-cell.component';
import { DeleteButtonComponent } from './components/delete-button/delete-button.component';

export const columnDefs: ColDef[] = [
  {
    headerName: 'ID',
    field: 'id',
    width: 100,
    sortable: true,
    filter: 'agNumberColumnFilter',
  },
  {
    headerName: 'Serial Number',
    field: 'serialNumber',
    flex: 1,
    sortable: true,
    filter: 'agTextColumnFilter',
  },
  {
    headerName: 'Barcode (Code39)',
    field: 'barcode',
    flex: 1,
    sortable: true,
    filter: 'agTextColumnFilter',
    cellRenderer: BarcodeCellComponent,
  },
  {
    headerName: 'Action',
    field: 'action',
    width: 120,
    cellRenderer: DeleteButtonComponent,
    sortable: false,
    filter: false,
  },
  {
    headerName: 'Created At',
    field: 'createdAt',
    flex: 1,
    sortable: true,
    filter: 'agDateColumnFilter',
    hide: true,
  },
];
