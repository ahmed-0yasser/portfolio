using System.Text.Json;
using Portfolio.Models;

namespace Portfolio.Services;

public class ProfileService(IWebHostEnvironment env, JsonSerializerOptions json)
{
    private readonly string _file = Path.Combine(env.ContentRootPath, "data", "profile.json");

    public async Task<Profile> GetAsync()
    {
        await using var stream = File.OpenRead(_file);
        return await JsonSerializer.DeserializeAsync<Profile>(stream, json) ?? new Profile();
    }

    public async Task<List<Project>> GetProjectsAsync(string? category)
    {
        var projects = (await GetAsync()).Projects ?? [];
        return string.IsNullOrWhiteSpace(category)
            ? projects
            : projects.Where(p => p.Category.Equals(category, StringComparison.OrdinalIgnoreCase)).ToList();
    }
}
