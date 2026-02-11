using Backend.Helpers;

namespace Backend.Tests;

public class InputSanitizerTests
{
    [Fact]
    public void Sanitize_NullInput_ReturnsNull()
    {
        Assert.Null(InputSanitizer.Sanitize(null));
    }

    [Fact]
    public void Sanitize_EmptyString_ReturnsEmpty()
    {
        Assert.Equal("", InputSanitizer.Sanitize(""));
    }

    [Fact]
    public void Sanitize_HtmlInput_EncodesCharacters()
    {
        var result = InputSanitizer.Sanitize("<script>alert('xss')</script>");
        Assert.DoesNotContain("<script>", result);
        Assert.Contains("&lt;", result);
    }

    [Fact]
    public void StripHtml_RemovesTags()
    {
        var result = InputSanitizer.StripHtml("<b>test</b><script>alert('xss')</script>");
        Assert.Equal("testalert('xss')", result);
    }

    [Fact]
    public void StripHtml_NullInput_ReturnsNull()
    {
        Assert.Null(InputSanitizer.StripHtml(null));
    }

    [Fact]
    public void SanitizeAndTrim_TrimsWhitespace()
    {
        var result = InputSanitizer.SanitizeAndTrim("  test  ");
        Assert.Equal("test", result);
    }
}
