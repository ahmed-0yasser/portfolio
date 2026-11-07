namespace Portfolio.Models;

public record Profile
{
    public string Name { get; init; } = "";
    public string Role { get; init; } = "";
    public string Tagline { get; init; } = "";
    public List<string> About { get; init; } = [];
    public List<Fact> Facts { get; init; } = [];
    public string Location { get; init; } = "";
    public string Email { get; init; } = "";
    public string Phone { get; init; } = "";
    public string Cv { get; init; } = "";
    public Dictionary<string, string> Social { get; init; } = [];
    public List<SkillGroup> Skills { get; init; } = [];
    public List<TimelineItem> Experience { get; init; } = [];
    public List<TimelineItem> Education { get; init; } = [];
    public List<string> Languages { get; init; } = [];
    public List<Project>? Projects { get; init; }
}

public record Fact(string Label, string Value);

public record SkillGroup(string Group, List<string> Items);

public record TimelineItem(string Title, string Org, List<string> Points);

public record Project
{
    public string Title { get; init; } = "";
    public string Description { get; init; } = "";
    public List<string> Features { get; init; } = [];
    public List<string> Tags { get; init; } = [];
    public string Category { get; init; } = "";
    public string Live { get; init; } = "";
    public string Code { get; init; } = "";
}
