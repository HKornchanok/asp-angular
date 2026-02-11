import { columnDefs } from './columnDefs';
import { BarcodeCellComponent } from './components/barcode-cell/barcode-cell.component';
import { DeleteButtonComponent } from './components/delete-button/delete-button.component';

describe('columnDefs', () => {
  it('should have 5 columns defined', () => {
    expect(columnDefs.length).toBe(5);
  });

  it('should have ID column', () => {
    const idCol = columnDefs.find((c) => c.field === 'id');
    expect(idCol).toBeTruthy();
    expect(idCol?.headerName).toBe('ID');
    expect(idCol?.sortable).toBeTrue();
    expect(idCol?.filter).toBe('agNumberColumnFilter');
  });

  it('should have Serial Number column', () => {
    const snCol = columnDefs.find((c) => c.field === 'serialNumber');
    expect(snCol).toBeTruthy();
    expect(snCol?.headerName).toBe('Serial Number');
    expect(snCol?.sortable).toBeTrue();
    expect(snCol?.filter).toBe('agTextColumnFilter');
  });

  it('should have Barcode column with BarcodeCellComponent renderer', () => {
    const barcodeCol = columnDefs.find((c) => c.field === 'barcode');
    expect(barcodeCol).toBeTruthy();
    expect(barcodeCol?.headerName).toBe('Barcode (Code39)');
    expect(barcodeCol?.cellRenderer).toBe(BarcodeCellComponent);
  });

  it('should have Action column with DeleteButtonComponent renderer', () => {
    const actionCol = columnDefs.find((c) => c.field === 'action');
    expect(actionCol).toBeTruthy();
    expect(actionCol?.headerName).toBe('Action');
    expect(actionCol?.cellRenderer).toBe(DeleteButtonComponent);
    expect(actionCol?.sortable).toBeFalse();
    expect(actionCol?.filter).toBeFalse();
  });

  it('should have Created At column hidden by default', () => {
    const createdAtCol = columnDefs.find((c) => c.field === 'createdAt');
    expect(createdAtCol).toBeTruthy();
    expect(createdAtCol?.headerName).toBe('Created At');
    expect(createdAtCol?.hide).toBeTrue();
    expect(createdAtCol?.filter).toBe('agDateColumnFilter');
  });
});
