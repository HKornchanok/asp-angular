namespace Backend.DTOs;

public class GetItemsRequest
{
    public int Skip { get; set; } = 0;
    public int Take { get; set; } = 100;
    public string? SortField { get; set; }
    public string? SortOrder { get; set; }
    public int? FilterId { get; set; }
    public string? FilterIdType { get; set; }
    public string? FilterSerialNumber { get; set; }
    public string? FilterSerialNumberType { get; set; }
    public string? FilterBarcode { get; set; }
    public string? FilterBarcodeType { get; set; }
}
