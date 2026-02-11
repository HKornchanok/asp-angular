import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError, Subject, EMPTY } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { App } from './app';
import { ItemService, Item, GetItemsRequest } from './services/item.service';
import { NotificationService } from './services/notification.service';
import { GridReadyEvent, GridApi } from 'ag-grid-community';

describe('App', () => {
  let component: App;
  let fixture: ComponentFixture<App>;
  let itemServiceSpy: jasmine.SpyObj<ItemService>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;
  let refreshGridSubject: Subject<void>;

  beforeEach(async () => {
    refreshGridSubject = new Subject<void>();

    const itemSpy = jasmine.createSpyObj('ItemService', ['getItems', 'addItem', 'deleteItem'], {
      refreshGrid$: refreshGridSubject.asObservable(),
    });

    const notifSpy = jasmine.createSpyObj(
      'NotificationService',
      ['success', 'error', 'show', 'dismiss'],
      {
        notification$: EMPTY,
        remove$: EMPTY,
      },
    );

    await TestBed.configureTestingModule({
      imports: [App, ReactiveFormsModule, TranslateModule.forRoot()],
      providers: [
        { provide: ItemService, useValue: itemSpy },
        { provide: NotificationService, useValue: notifSpy },
      ],
    }).compileComponents();

    itemServiceSpy = TestBed.inject(ItemService) as jasmine.SpyObj<ItemService>;
    notificationServiceSpy = TestBed.inject(
      NotificationService,
    ) as jasmine.SpyObj<NotificationService>;

    itemServiceSpy.getItems.and.returnValue(of({ items: [], totalCount: 0 }));

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
  });

  it('should create with default values', () => {
    expect(component).toBeTruthy();
    expect(component.isAddingItem).toBeFalse();
    expect(component.deleteDialogVisible).toBeFalse();
    expect(component.rowModelType).toBe('infinite');
    expect(component.columnDefs.length).toBeGreaterThan(0);
  });

  it('should validate serial number input', fakeAsync(() => {
    fixture.detectChanges();

    expect(component.serialNumberControl.hasError('required')).toBeTrue();

    component.serialNumberControl.setValue('abcd-12!@#');
    tick();
    expect(component.serialNumberControl.value).toBe('ABCD12');

    component.serialNumberControl.setValue('ABCD1234567890EF');
    expect(component.serialNumberControl.valid).toBeTrue();
  }));

  it('should not add item when invalid', () => {
    fixture.detectChanges();
    component.serialNumberControl.setValue('');
    component.addItem();
    expect(itemServiceSpy.addItem).not.toHaveBeenCalled();
  });

  it('should add item successfully', fakeAsync(() => {
    fixture.detectChanges();
    const mockItem: Item = { id: 1, serialNumber: 'ABCD1234567890EF' } as Item;
    itemServiceSpy.addItem.and.returnValue(of(mockItem));

    component.serialNumberControl.setValue('ABCD1234567890EF');
    component.addItem();
    tick();

    expect(itemServiceSpy.addItem).toHaveBeenCalledWith('ABCD1234567890EF');
    expect(notificationServiceSpy.success).toHaveBeenCalled();
  }));

  it('should handle add item error', fakeAsync(() => {
    fixture.detectChanges();
    itemServiceSpy.addItem.and.returnValue(throwError(() => ({ response: '{"message":"Error"}' })));

    component.serialNumberControl.setValue('ABCD1234567890EF');
    component.addItem();
    tick();

    expect(notificationServiceSpy.error).toHaveBeenCalledWith('Error');
  }));

  it('should show and close delete dialog', () => {
    component.showDeleteDialog(123, 'SERIAL');
    expect(component.deleteDialogVisible).toBeTrue();
    expect(component.deleteDialogMessage).toBeTruthy();

    component.closeDeleteDialog();
    expect(component.deleteDialogVisible).toBeFalse();
  });

  it('should delete item on confirm', fakeAsync(() => {
    itemServiceSpy.deleteItem.and.returnValue(of(void 0));
    component.showDeleteDialog(123, 'SERIAL');
    component.onDeleteConfirmed();
    tick();

    expect(itemServiceSpy.deleteItem).toHaveBeenCalledWith(123);
    expect(notificationServiceSpy.success).toHaveBeenCalled();
  }));

  it('should handle delete error', fakeAsync(() => {
    itemServiceSpy.deleteItem.and.returnValue(throwError(() => new Error()));
    component.showDeleteDialog(123, 'SERIAL');
    component.onDeleteConfirmed();
    tick();

    expect(notificationServiceSpy.error).toHaveBeenCalled();
  }));

  it('should setup grid and datasource', fakeAsync(() => {
    const mockApi = jasmine.createSpyObj('GridApi', ['setGridOption', 'refreshInfiniteCache']);
    itemServiceSpy.getItems.and.returnValue(of({ items: [], totalCount: 0 }));

    component.onGridReady({ api: mockApi } as unknown as GridReadyEvent);
    expect(mockApi.setGridOption).toHaveBeenCalledWith('datasource', jasmine.any(Object));

    const datasource = mockApi.setGridOption.calls.mostRecent().args[1];
    const successCallback = jasmine.createSpy();
    datasource.getRows({
      startRow: 0,
      endRow: 50,
      sortModel: [{ colId: 'id', sort: 'asc' }],
      filterModel: { id: { filter: 1 }, serialNumber: { filter: 'SN' }, barcode: { filter: 'BC' } },
      successCallback,
      failCallback: jasmine.createSpy(),
      api: mockApi,
    } as any);
    tick();

    expect(successCallback).toHaveBeenCalled();
  }));

  it('should handle datasource error', fakeAsync(() => {
    const mockApi = jasmine.createSpyObj('GridApi', ['setGridOption']);
    itemServiceSpy.getItems.and.returnValue(throwError(() => new Error()));

    component.onGridReady({ api: mockApi } as unknown as GridReadyEvent);
    const datasource = mockApi.setGridOption.calls.mostRecent().args[1];
    const failCallback = jasmine.createSpy();
    datasource.getRows({
      startRow: 0,
      endRow: 50,
      sortModel: [],
      filterModel: {},
      successCallback: jasmine.createSpy(),
      failCallback,
      api: mockApi,
    } as any);
    tick();

    expect(failCallback).toHaveBeenCalled();
  }));

  it('should have gridContext with onDelete', () => {
    spyOn(component, 'showDeleteDialog');
    component.gridContext.onDelete(1, 'SN');
    expect(component.showDeleteDialog).toHaveBeenCalledWith(1, 'SN');
  });

  it('should cleanup on destroy', () => {
    fixture.detectChanges();
    expect(() => component.ngOnDestroy()).not.toThrow();
  });
});
