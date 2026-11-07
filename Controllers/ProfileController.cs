using Microsoft.AspNetCore.Mvc;
using Portfolio.Services;

namespace Portfolio.Controllers;

[ApiController]
[Route("api")]
public class ProfileController(ProfileService profiles) : ControllerBase
{
    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var profile = await profiles.GetAsync();
        return Ok(profile with { Projects = null });
    }

    [HttpGet("projects")]
    public async Task<IActionResult> GetProjects([FromQuery] string? category) =>
        Ok(await profiles.GetProjectsAsync(category));
}
