import { Injectable, inject } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject, Observable, map } from 'rxjs';
import {
  ApiClient,
  PagedResultDtoOfItem,
  Item,
  CreateItemDto,
  GetItemsRequest,
} from './api-client.generated';
import { environment } from '../../environments/environment';

export { Item, GetItemsRequest } from './api-client.generated';

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  private apiClient = inject(ApiClient);
  private hubUrl = environment.hubUrl;
  private hubConnection!: signalR.HubConnection;
  private refreshGrid = new Subject<void>();
  public refreshGrid$ = this.refreshGrid.asObservable();

  constructor() {
    this.startConnection();
    this.addListeners();
  }

  private startConnection(): void {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl)
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start().catch((err) => console.error('SignalR Connection Error:', err));
  }

  private addListeners(): void {
    this.hubConnection.on('ItemAdded', () => {
      this.refreshGrid.next();
    });

    this.hubConnection.on('ItemDeleted', () => {
      this.refreshGrid.next();
    });

    this.hubConnection.on('ItemsRefreshed', () => {
      this.refreshGrid.next();
    });
  }

  getItems(request: GetItemsRequest): Observable<PagedResult<Item>> {
    return this.apiClient.searchItems(request).pipe(
      map((result: PagedResultDtoOfItem) => ({
        items: result.items || [],
        totalCount: result.totalCount || 0,
      })),
    );
  }

  addItem(serialNumber: string): Observable<Item> {
    const dto = new CreateItemDto();
    dto.serialNumber = serialNumber;
    return this.apiClient.createItem(dto);
  }

  deleteItem(id: number): Observable<void> {
    return this.apiClient.deleteItem(id).pipe(map(() => void 0));
  }
}
