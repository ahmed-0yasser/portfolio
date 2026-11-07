using System.Text.Json;
using System.Text.RegularExpressions;
using Portfolio.Models;

namespace Portfolio.Services;

public partial class MessageService(IWebHostEnvironment env, JsonSerializerOptions json)
{
    private readonly string _file = Path.Combine(env.ContentRootPath, "data", "messages.json");
    private readonly SemaphoreSlim _lock = new(1, 1);

    [GeneratedRegex(@"^[^\s@]+@[^\s@]+\.[^\s@]+$")]
    private static partial Regex EmailRegex();

    public static Dictionary<string, string> Validate(ContactRequest request)
    {
        var errors = new Dictionary<string, string>();
        var name = request.Name?.Trim() ?? "";
        var email = request.Email?.Trim() ?? "";
        var message = request.Message?.Trim() ?? "";

        if (name.Length < 2) errors["name"] = "Name must be at least 2 characters.";
        if (!EmailRegex().IsMatch(email)) errors["email"] = "Please enter a valid email.";
        if (message.Length < 10) errors["message"] = "Message must be at least 10 characters.";
        else if (message.Length > 2000) errors["message"] = "Message is too long.";

        return errors;
    }

    public async Task<List<ContactMessage>> GetAllAsync()
    {
        await _lock.WaitAsync();
        try { return await ReadAsync(); }
        finally { _lock.Release(); }
    }

    public async Task<ContactMessage> AddAsync(ContactRequest request)
    {
        var entry = new ContactMessage(
            DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(),
            request.Name!.Trim(),
            request.Email!.Trim(),
            request.Message!.Trim(),
            DateTime.UtcNow);

        await _lock.WaitAsync();
        try
        {
            var messages = await ReadAsync();
            messages.Add(entry);
            await File.WriteAllTextAsync(_file, JsonSerializer.Serialize(messages, json));
            return entry;
        }
        finally { _lock.Release(); }
    }

    private async Task<List<ContactMessage>> ReadAsync()
    {
        if (!File.Exists(_file)) return [];
        await using var stream = File.OpenRead(_file);
        return await JsonSerializer.DeserializeAsync<List<ContactMessage>>(stream, json) ?? [];
    }
}
