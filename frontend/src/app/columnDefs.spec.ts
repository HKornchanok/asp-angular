import { getColumnDefs } from './columnDefs';
import { TranslateService } from '@ngx-translate/core';
import { BarcodeCellComponent } from './components/barcode-cell/barcode-cell.component';
import { DeleteButtonComponent } from './components/delete-button/delete-button.component';

describe('columnDefs', () => {
  let translateService: jasmine.SpyObj<TranslateService>;
  let columnDefs: ReturnType<typeof getColumnDefs>;

  beforeEach(() => {
    translateService = jasmine.createSpyObj('TranslateService', ['instant']);
    translateService.instant.and.callFake((key: string) => key);
    columnDefs = getColumnDefs(translateService);
  });

  it('should have 5 columns defined', () => {
    expect(columnDefs.length).toBe(5);
  });

  it('should have ID column', () => {
    const idCol = columnDefs.find((c) => c.field === 'id');
    expect(idCol).toBeTruthy();
    expect(idCol?.headerName).toBe('COLUMN.ID');
    expect(idCol?.sortable).toBeTrue();
    expect(idCol?.filter).toBe('agNumberColumnFilter');
  });

  it('should have Serial Number column', () => {
    const snCol = columnDefs.find((c) => c.field === 'serialNumber');
    expect(snCol).toBeTruthy();
    expect(snCol?.headerName).toBe('COLUMN.SERIAL_NUMBER');
    expect(snCol?.sortable).toBeTrue();
    expect(snCol?.filter).toBe('agTextColumnFilter');
  });

  it('should have Barcode column with BarcodeCellComponent renderer', () => {
    const barcodeCol = columnDefs.find((c) => c.field === 'barcode');
    expect(barcodeCol).toBeTruthy();
    expect(barcodeCol?.headerName).toBe('COLUMN.BARCODE');
    expect(barcodeCol?.cellRenderer).toBe(BarcodeCellComponent);
  });

  it('should have Action column with DeleteButtonComponent renderer', () => {
    const actionCol = columnDefs.find((c) => c.field === 'action');
    expect(actionCol).toBeTruthy();
    expect(actionCol?.headerName).toBe('COLUMN.ACTION');
    expect(actionCol?.cellRenderer).toBe(DeleteButtonComponent);
    expect(actionCol?.sortable).toBeFalse();
    expect(actionCol?.filter).toBeFalse();
  });

  it('should have Created At column hidden by default', () => {
    const createdAtCol = columnDefs.find((c) => c.field === 'createdAt');
    expect(createdAtCol).toBeTruthy();
    expect(createdAtCol?.headerName).toBe('COLUMN.CREATED_AT');
    expect(createdAtCol?.hide).toBeTrue();
    expect(createdAtCol?.filter).toBe('agDateColumnFilter');
  });
});
