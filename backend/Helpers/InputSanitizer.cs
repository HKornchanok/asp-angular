using System.Web;

namespace Backend.Helpers;

public static class InputSanitizer
{
    /// <summary>
    /// Sanitizes input string by HTML encoding potentially dangerous characters
    /// </summary>
    public static string? Sanitize(string? input)
    {
        if (string.IsNullOrEmpty(input))
            return input;

        // HTML encode to prevent XSS
        return HttpUtility.HtmlEncode(input);
    }

    /// <summary>
    /// Sanitizes input and trims whitespace
    /// </summary>
    public static string? SanitizeAndTrim(string? input)
    {
        if (string.IsNullOrEmpty(input))
            return input;

        return HttpUtility.HtmlEncode(input.Trim());
    }

    /// <summary>
    /// Removes any HTML tags from input
    /// </summary>
    public static string? StripHtml(string? input)
    {
        if (string.IsNullOrEmpty(input))
            return input;

        return System.Text.RegularExpressions.Regex.Replace(input, "<.*?>", string.Empty);
    }
}
