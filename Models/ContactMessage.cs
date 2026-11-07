namespace Portfolio.Models;

public record ContactRequest(string? Name, string? Email, string? Message);

public record ContactMessage(long Id, string Name, string Email, string Message, DateTime CreatedAt);
