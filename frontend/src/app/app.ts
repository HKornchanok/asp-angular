import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import {
  ColDef,
  GridReadyEvent,
  GridApi,
  ModuleRegistry,
  AllCommunityModule,
  themeQuartz,
  IDatasource,
  IGetRowsParams,
  SortModelItem,
} from 'ag-grid-community';
import { Subscription } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ItemService, GetItemsRequest } from './services/item.service';
import { NotificationService } from './services/notification.service';
import { getColumnDefs } from './columnDefs';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { ToastContainerComponent } from './components/toast-container/toast-container.component';
import { SpinnerComponent, SpinnerSize } from './components/spinner/spinner.component';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AgGridModule,
    TranslateModule,
    ConfirmDialogComponent,
    ToastContainerComponent,
    SpinnerComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit, OnDestroy {
  private itemService = inject(ItemService);
  private notificationService = inject(NotificationService);
  private translate = inject(TranslateService);
  private gridApi!: GridApi;
  private refreshSubscription?: Subscription;
  private langSubscription?: Subscription;

  public SpinnerSize = SpinnerSize;

  public serialNumberControl = new FormControl('', [
    Validators.required,
    Validators.maxLength(16),
    Validators.minLength(16),
    Validators.pattern(/^[A-Z0-9]+$/),
  ]);

  public isAddingItem = false;

  public deleteDialogVisible = false;
  public deleteDialogMessage = '';
  private pendingDeleteId: number | null = null;

  public columnDefs: ColDef[] = getColumnDefs(this.translate);

  public gridContext = {
    onDelete: (id: number, serialNumber: string) => this.showDeleteDialog(id, serialNumber),
  };

  public theme = themeQuartz;

  public rowModelType: 'infinite' = 'infinite';
  public cacheBlockSize = 50;
  public cacheOverflowSize = 2;
  public maxConcurrentDatasourceRequests = 1;
  public infiniteInitialRowCount = 1;
  public maxBlocksInCache = 100;

  public currentLang = 'th';

  ngOnInit(): void {
    this.translate.use(this.currentLang);

    this.serialNumberControl.valueChanges.subscribe((value) => {
      if (value) {
        const upperValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (value !== upperValue) {
          this.serialNumberControl.setValue(upperValue, { emitEvent: false });
        }
      }
    });

    this.refreshSubscription = this.itemService.refreshGrid$.subscribe(() => {
      if (this.gridApi) {
        this.gridApi.refreshInfiniteCache();
      }
    });

    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.columnDefs = getColumnDefs(this.translate);
    });
  }

  ngOnDestroy(): void {
    this.refreshSubscription?.unsubscribe();
    this.langSubscription?.unsubscribe();
  }

  public switchLang(lang: string): void {
    this.currentLang = lang;
    this.translate.use(lang);
  }

  public onGridReady(params: GridReadyEvent): void {
    this.gridApi = params.api;
    this.gridApi.setGridOption('datasource', this.createDatasource());
  }

  private createDatasource(): IDatasource {
    return {
      getRows: (params: IGetRowsParams) => {
        const sortModel: SortModelItem[] = params.sortModel || [];
        const request = this.buildRequest(params, sortModel);

        this.itemService.getItems(request).subscribe({
          next: (result) => {
            params.successCallback(result.items, result.totalCount);
          },
          error: () => {
            params.failCallback();
          },
        });
      },
    };
  }

  private buildRequest(params: IGetRowsParams, sortModel: SortModelItem[]): GetItemsRequest {
    const request = new GetItemsRequest();
    request.skip = params.startRow;
    request.take = params.endRow - params.startRow;

    if (sortModel.length > 0) {
      request.sortField = sortModel[0].colId;
      request.sortOrder = sortModel[0].sort;
    }

    const filterModel = params.filterModel;
    if (filterModel) {
      if (filterModel['id']) {
        const idFilter = filterModel['id'] as { filter?: number; type?: string };
        if (idFilter.filter !== undefined) {
          request.filterId = idFilter.filter;
          request.filterIdType = idFilter.type || 'equals';
        }
      }

      if (filterModel['serialNumber']) {
        const snFilter = filterModel['serialNumber'] as { filter?: string; type?: string };
        if (snFilter.filter) {
          request.filterSerialNumber = snFilter.filter;
          request.filterSerialNumberType = snFilter.type || 'contains';
        }
      }

      if (filterModel['barcode']) {
        const barcodeFilter = filterModel['barcode'] as { filter?: string; type?: string };
        if (barcodeFilter.filter) {
          request.filterBarcode = barcodeFilter.filter;
          request.filterBarcodeType = barcodeFilter.type || 'contains';
        }
      }
    }

    return request;
  }

  public addItem(): void {
    if (this.serialNumberControl.invalid || !this.serialNumberControl.value?.trim()) {
      this.serialNumberControl.markAsTouched();
      return;
    }

    this.isAddingItem = true;
    this.itemService.addItem(this.serialNumberControl.value.trim()).subscribe({
      next: () => {
        this.serialNumberControl.setValue('');
        this.serialNumberControl.markAsUntouched();
        this.notificationService.success(this.translate.instant('TOAST.ITEM_ADDED'));
        this.isAddingItem = false;
      },
      error: (err) => {
        let message = this.translate.instant('TOAST.ADD_FAILED');
        try {
          const parsed = JSON.parse(err?.response);
          message = parsed?.message || message;
        } catch {
          message = err?.message || message;
        }
        this.notificationService.error(message);
        this.isAddingItem = false;
      },
    });
  }

  public showDeleteDialog(id: number, serialNumber: string): void {
    this.pendingDeleteId = id;
    this.deleteDialogMessage = this.translate.instant('DIALOG.DELETE_MESSAGE', { serialNumber });
    this.deleteDialogVisible = true;
  }

  public onDeleteConfirmed(): void {
    if (this.pendingDeleteId !== null) {
      this.itemService.deleteItem(this.pendingDeleteId).subscribe({
        next: () => {
          this.notificationService.success(this.translate.instant('TOAST.ITEM_DELETED'));
        },
        error: () => {
          this.notificationService.error(this.translate.instant('TOAST.DELETE_FAILED'));
        },
      });
    }
    this.closeDeleteDialog();
  }

  public closeDeleteDialog(): void {
    this.deleteDialogVisible = false;
    this.pendingDeleteId = null;
    this.deleteDialogMessage = '';
  }
}
