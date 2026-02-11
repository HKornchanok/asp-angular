import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of } from 'rxjs';
import { ItemService } from './item.service';
import { ApiClient, Item, GetItemsRequest } from './api-client.generated';

describe('ItemService', () => {
  let service: ItemService;
  let apiClientSpy: jasmine.SpyObj<ApiClient>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('ApiClient', ['searchItems', 'createItem', 'deleteItem']);

    TestBed.configureTestingModule({
      providers: [ItemService, { provide: ApiClient, useValue: spy }],
    });

    apiClientSpy = TestBed.inject(ApiClient) as jasmine.SpyObj<ApiClient>;
    service = TestBed.inject(ItemService);
  });

  it('should be created with refreshGrid$ observable', () => {
    expect(service).toBeTruthy();
    expect(service.refreshGrid$).toBeTruthy();
  });

  it('should get items and handle empty results', fakeAsync(() => {
    apiClientSpy.searchItems.and.returnValue(
      of({ items: undefined, totalCount: undefined } as any),
    );

    let result: any;
    service.getItems(new GetItemsRequest()).subscribe((r) => (result = r));
    tick();

    expect(result.items).toEqual([]);
    expect(result.totalCount).toBe(0);
  }));

  it('should add item', fakeAsync(() => {
    const mockItem = { id: 1, serialNumber: 'SN' } as Item;
    apiClientSpy.createItem.and.returnValue(of(mockItem));

    let result: Item | undefined;
    service.addItem('SN').subscribe((r) => (result = r));
    tick();

    expect(result).toEqual(mockItem);
  }));

  it('should delete item', fakeAsync(() => {
    apiClientSpy.deleteItem.and.returnValue(of(undefined as any));

    let completed = false;
    service.deleteItem(1).subscribe(() => (completed = true));
    tick();

    expect(completed).toBeTrue();
    expect(apiClientSpy.deleteItem).toHaveBeenCalledWith(1);
  }));
});
