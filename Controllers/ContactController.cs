using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Portfolio.Models;
using Portfolio.Services;

namespace Portfolio.Controllers;

[ApiController]
[Route("api")]
public class ContactController(MessageService messages, IConfiguration config) : ControllerBase
{
    [HttpPost("contact")]
    [EnableRateLimiting("contact")]
    public async Task<IActionResult> Send([FromBody] ContactRequest request)
    {
        var errors = MessageService.Validate(request);
        if (errors.Count > 0) return BadRequest(new { errors });

        await messages.AddAsync(request);
        return StatusCode(StatusCodes.Status201Created, new { ok = true, message = "Thanks! Your message was sent." });
    }

    [HttpGet("messages")]
    public async Task<IActionResult> GetAll([FromHeader(Name = "x-admin-key")] string? key)
    {
        var adminKey = config["ADMIN_KEY"] ?? "change-me";
        if (key != adminKey) return Unauthorized(new { error = "Unauthorized" });
        return Ok(await messages.GetAllAsync());
    }
}
