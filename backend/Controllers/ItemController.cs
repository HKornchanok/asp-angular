using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Backend.Data;
using Backend.DTOs;
using Backend.Hubs;
using Backend.Models;

namespace Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ItemController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IHubContext<ItemHub> _hubContext;

    public ItemController(AppDbContext context, IHubContext<ItemHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    [HttpPost("search")]
    public async Task<ActionResult<PagedResultDto<Item>>> SearchItems([FromBody] GetItemsRequest request)
    {
        var query = _context.Items.AsQueryable();

        if (request.FilterId.HasValue)
        {
            query = (request.FilterIdType?.ToLower()) switch
            {
                "notequal" => query.Where(i => i.Id != request.FilterId.Value),
                "lessthan" => query.Where(i => i.Id < request.FilterId.Value),
                "lessthanorequal" => query.Where(i => i.Id <= request.FilterId.Value),
                "greaterthan" => query.Where(i => i.Id > request.FilterId.Value),
                "greaterthanorequal" => query.Where(i => i.Id >= request.FilterId.Value),
                _ => query.Where(i => i.Id == request.FilterId.Value)
            };
        }

        if (!string.IsNullOrEmpty(request.FilterSerialNumber))
        {
            var snLower = request.FilterSerialNumber.ToLower();
            query = (request.FilterSerialNumberType?.ToLower()) switch
            {
                "equals" => query.Where(i => i.SerialNumber.ToLower() == snLower),
                "notequal" => query.Where(i => i.SerialNumber.ToLower() != snLower),
                "notcontains" => query.Where(i => !i.SerialNumber.ToLower().Contains(snLower)),
                "startswith" => query.Where(i => i.SerialNumber.ToLower().StartsWith(snLower)),
                "endswith" => query.Where(i => i.SerialNumber.ToLower().EndsWith(snLower)),
                _ => query.Where(i => i.SerialNumber.ToLower().Contains(snLower))
            };
        }

        if (!string.IsNullOrEmpty(request.FilterBarcode))
        {
            var barcodeLower = request.FilterBarcode.ToLower();
            query = (request.FilterBarcodeType?.ToLower()) switch
            {
                "equals" => query.Where(i => i.Barcode.ToLower() == barcodeLower),
                "notequal" => query.Where(i => i.Barcode.ToLower() != barcodeLower),
                "notcontains" => query.Where(i => !i.Barcode.ToLower().Contains(barcodeLower)),
                "startswith" => query.Where(i => i.Barcode.ToLower().StartsWith(barcodeLower)),
                "endswith" => query.Where(i => i.Barcode.ToLower().EndsWith(barcodeLower)),
                _ => query.Where(i => i.Barcode.ToLower().Contains(barcodeLower))
            };
        }

        var totalCount = await query.CountAsync();

        if (!string.IsNullOrEmpty(request.SortField))
        {
            query = request.SortField.ToLower() switch
            {
                "id" => request.SortOrder == "desc" ? query.OrderByDescending(i => i.Id) : query.OrderBy(i => i.Id),
                "serialnumber" => request.SortOrder == "desc" ? query.OrderByDescending(i => i.SerialNumber) : query.OrderBy(i => i.SerialNumber),
                "barcode" => request.SortOrder == "desc" ? query.OrderByDescending(i => i.Barcode) : query.OrderBy(i => i.Barcode),
                "createdat" => request.SortOrder == "desc" ? query.OrderByDescending(i => i.CreatedAt) : query.OrderBy(i => i.CreatedAt),
                _ => query.OrderByDescending(i => i.CreatedAt)
            };
        }
        else
        {
            query = query.OrderByDescending(i => i.CreatedAt);
        }

        var items = await query.Skip(request.Skip).Take(request.Take).ToListAsync();

        return new PagedResultDto<Item>
        {
            Items = items,
            TotalCount = totalCount
        };
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Item>> GetItem(int id)
    {
        var item = await _context.Items.FindAsync(id);

        if (item == null)
        {
            return NotFound();
        }

        return item;
    }

    [HttpPost]
    [EnableRateLimiting("strict")]
    public async Task<ActionResult<Item>> CreateItem(CreateItemDto dto)
    {
        if (string.IsNullOrEmpty(dto.SerialNumber))
        {
            return BadRequest(new { message = "Serial number is required" });
        }

        if (dto.SerialNumber.Length != 18)
        {
            return BadRequest(new { message = "Serial number must be exactly 18 characters" });
        }

        if (!System.Text.RegularExpressions.Regex.IsMatch(dto.SerialNumber, @"^[A-Z0-9]+$"))
        {
            return BadRequest(new { message = "Serial number must contain only uppercase letters (A-Z) and numbers (0-9)" });
        }

        var exists = await _context.Items.AnyAsync(i => i.SerialNumber == dto.SerialNumber);
        if (exists)
        {
            return Conflict(new { message = "Serial number already exists" });
        }

        var item = new Item
        {
            SerialNumber = dto.SerialNumber,
            Barcode = dto.SerialNumber,
            CreatedAt = DateTime.UtcNow
        };

        _context.Items.Add(item);
        await _context.SaveChangesAsync();

        await _hubContext.Clients.All.SendAsync("ItemAdded", item);

        return Ok(item);
    }

    [HttpDelete("{id}")]
    [EnableRateLimiting("strict")]
    public async Task<IActionResult> DeleteItem(int id)
    {
        var item = await _context.Items.FindAsync(id);
        if (item == null)
        {
            return NotFound();
        }

        _context.Items.Remove(item);
        await _context.SaveChangesAsync();

        await _hubContext.Clients.All.SendAsync("ItemDeleted", id);

        return NoContent();
    }
}
