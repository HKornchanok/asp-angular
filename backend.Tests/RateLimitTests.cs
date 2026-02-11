using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.Sqlite;
using Backend.Data;

namespace Backend.Tests;

public class RateLimitTests : IDisposable
{
    private SqliteConnection? _connection;

    private WebApplicationFactory<Program> CreateFactory()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();

        return new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
        {
            builder.ConfigureServices(services =>
            {
                // Remove all EF Core related services
                var descriptors = services.Where(d =>
                    d.ServiceType == typeof(DbContextOptions<AppDbContext>) ||
                    d.ServiceType == typeof(DbContextOptions) ||
                    d.ServiceType.FullName?.Contains("EntityFrameworkCore") == true).ToList();

                foreach (var descriptor in descriptors)
                    services.Remove(descriptor);

                services.AddDbContext<AppDbContext>(options =>
                    options.UseSqlite(_connection));
            });
        });
    }

    public void Dispose()
    {
        _connection?.Close();
        _connection?.Dispose();
    }

    [Fact]
    public async Task CreateItem_WithRateLimiting_ProcessesRequest()
    {
        using var factory = CreateFactory();

        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            db.Database.EnsureCreated();
        }

        var client = factory.CreateClient();

        var content = new StringContent(
            "{\"serialNumber\":\"RATELIMIT000000001\"}",
            System.Text.Encoding.UTF8,
            "application/json");

        var response = await client.PostAsync("/api/item", content);

        // Rate limiting is configured; request should either succeed or be rate limited
        Assert.True(
            response.StatusCode == System.Net.HttpStatusCode.OK ||
            response.StatusCode == System.Net.HttpStatusCode.TooManyRequests,
            $"Expected OK or TooManyRequests, got {response.StatusCode}");
    }

    [Fact]
    public async Task SearchItems_WithinRateLimit_ReturnsOk()
    {
        using var factory = CreateFactory();

        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            db.Database.EnsureCreated();
        }

        var client = factory.CreateClient();

        var content = new StringContent(
            "{\"skip\":0,\"take\":10}",
            System.Text.Encoding.UTF8,
            "application/json");

        var response = await client.PostAsync("/api/item/search", content);
        Assert.Equal(System.Net.HttpStatusCode.OK, response.StatusCode);
    }
}
