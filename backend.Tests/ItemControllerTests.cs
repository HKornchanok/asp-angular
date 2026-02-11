using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Moq;
using Backend.Controllers;
using Backend.Data;
using Backend.DTOs;
using Backend.Hubs;
using Backend.Models;

namespace Backend.Tests;

public class ItemControllerTests
{
    private AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    private Mock<IHubContext<ItemHub>> CreateMockHubContext()
    {
        var mockClients = new Mock<IHubClients>();
        var mockClientProxy = new Mock<IClientProxy>();
        mockClients.Setup(c => c.All).Returns(mockClientProxy.Object);

        var mockHubContext = new Mock<IHubContext<ItemHub>>();
        mockHubContext.Setup(h => h.Clients).Returns(mockClients.Object);

        return mockHubContext;
    }

    [Fact]
    public async Task CreateItem_ValidSerialNumber_ReturnsOk()
    {
        var context = CreateContext();
        var mockHub = CreateMockHubContext();
        var controller = new ItemController(context, mockHub.Object);

        var dto = new CreateItemDto { SerialNumber = "ABCD1234567890EF12" };
        var result = await controller.CreateItem(dto);

        var okResult = Assert.IsType<OkObjectResult>(result.Result);
        var item = Assert.IsType<Item>(okResult.Value);
        Assert.Equal("ABCD1234567890EF12", item.SerialNumber);
    }

    [Fact]
    public async Task CreateItem_EmptySerialNumber_ReturnsBadRequest()
    {
        var context = CreateContext();
        var mockHub = CreateMockHubContext();
        var controller = new ItemController(context, mockHub.Object);

        var dto = new CreateItemDto { SerialNumber = "" };
        var result = await controller.CreateItem(dto);

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task CreateItem_InvalidLength_ReturnsBadRequest()
    {
        var context = CreateContext();
        var mockHub = CreateMockHubContext();
        var controller = new ItemController(context, mockHub.Object);

        var dto = new CreateItemDto { SerialNumber = "SHORT" };
        var result = await controller.CreateItem(dto);

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task CreateItem_InvalidCharacters_ReturnsBadRequest()
    {
        var context = CreateContext();
        var mockHub = CreateMockHubContext();
        var controller = new ItemController(context, mockHub.Object);

        var dto = new CreateItemDto { SerialNumber = "abcd1234567890ef12" };
        var result = await controller.CreateItem(dto);

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task CreateItem_DuplicateSerialNumber_ReturnsConflict()
    {
        var context = CreateContext();
        var mockHub = CreateMockHubContext();
        var controller = new ItemController(context, mockHub.Object);

        context.Items.Add(new Item { SerialNumber = "ABCD1234567890EF12", Barcode = "ABCD1234567890EF12" });
        await context.SaveChangesAsync();

        var dto = new CreateItemDto { SerialNumber = "ABCD1234567890EF12" };
        var result = await controller.CreateItem(dto);

        Assert.IsType<ConflictObjectResult>(result.Result);
    }

    [Fact]
    public async Task GetItem_ExistingId_ReturnsItem()
    {
        var context = CreateContext();
        var mockHub = CreateMockHubContext();
        var controller = new ItemController(context, mockHub.Object);

        var item = new Item { SerialNumber = "ABCD1234567890EF12", Barcode = "ABCD1234567890EF12" };
        context.Items.Add(item);
        await context.SaveChangesAsync();

        var result = await controller.GetItem(item.Id);

        var returnedItem = Assert.IsType<Item>(result.Value);
        Assert.Equal("ABCD1234567890EF12", returnedItem.SerialNumber);
    }

    [Fact]
    public async Task GetItem_NonExistingId_ReturnsNotFound()
    {
        var context = CreateContext();
        var mockHub = CreateMockHubContext();
        var controller = new ItemController(context, mockHub.Object);

        var result = await controller.GetItem(999);

        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task DeleteItem_ExistingId_ReturnsNoContent()
    {
        var context = CreateContext();
        var mockHub = CreateMockHubContext();
        var controller = new ItemController(context, mockHub.Object);

        var item = new Item { SerialNumber = "ABCD1234567890EF12", Barcode = "ABCD1234567890EF12" };
        context.Items.Add(item);
        await context.SaveChangesAsync();

        var result = await controller.DeleteItem(item.Id);

        Assert.IsType<NoContentResult>(result);
        Assert.Null(await context.Items.FindAsync(item.Id));
    }

    [Fact]
    public async Task DeleteItem_NonExistingId_ReturnsNotFound()
    {
        var context = CreateContext();
        var mockHub = CreateMockHubContext();
        var controller = new ItemController(context, mockHub.Object);

        var result = await controller.DeleteItem(999);

        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task SearchItems_ReturnsPagedResult()
    {
        var context = CreateContext();
        var mockHub = CreateMockHubContext();
        var controller = new ItemController(context, mockHub.Object);

        for (int i = 1; i <= 5; i++)
        {
            context.Items.Add(new Item
            {
                SerialNumber = $"ITEM{i:D14}",
                Barcode = $"ITEM{i:D14}"
            });
        }
        await context.SaveChangesAsync();

        var request = new GetItemsRequest { Skip = 0, Take = 10 };
        var result = await controller.SearchItems(request);

        var pagedResult = Assert.IsType<PagedResultDto<Item>>(result.Value);
        Assert.Equal(5, pagedResult.TotalCount);
        Assert.Equal(5, pagedResult.Items.Count);
    }
}
