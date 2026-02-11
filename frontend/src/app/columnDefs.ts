import { ColDef } from 'ag-grid-community';
import { TranslateService } from '@ngx-translate/core';
import { BarcodeCellComponent } from './components/barcode-cell/barcode-cell.component';
import { DeleteButtonComponent } from './components/delete-button/delete-button.component';

export function getColumnDefs(translate: TranslateService): ColDef[] {
  return [
    {
      headerName: translate.instant('COLUMN.ID'),
      field: 'id',
      width: 100,
      sortable: true,
      filter: 'agNumberColumnFilter',
    },
    {
      headerName: translate.instant('COLUMN.SERIAL_NUMBER'),
      field: 'serialNumber',
      flex: 1,
      sortable: true,
      filter: 'agTextColumnFilter',
    },
    {
      headerName: translate.instant('COLUMN.BARCODE'),
      field: 'barcode',
      flex: 1,
      sortable: true,
      filter: 'agTextColumnFilter',
      cellRenderer: BarcodeCellComponent,
    },
    {
      headerName: translate.instant('COLUMN.ACTION'),
      field: 'action',
      width: 120,
      cellRenderer: DeleteButtonComponent,
      sortable: false,
      filter: false,
    },
    {
      headerName: translate.instant('COLUMN.CREATED_AT'),
      field: 'createdAt',
      flex: 1,
      sortable: true,
      filter: 'agDateColumnFilter',
      hide: true,
    },
  ];
}
