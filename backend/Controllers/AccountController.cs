using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

using System.ComponentModel.DataAnnotations;
using System.Security.Claims;
using System.IdentityModel.Tokens;
using System.Text;

using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
namespace backend.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AccountController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly IConfiguration _config;
    public AccountController(UserManager<User> userManager, IConfiguration config)
    {
        _userManager = userManager;
        _config = config;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        
        var user = new User
        {
            UserName = model.UserName,
            Email = model.Email,
        };

        var result = await _userManager.CreateAsync(user, model.Password);

        if (result.Succeeded)
        {
            return Ok(new { message= "Registration Successful !"});
        }

        return BadRequest(result.Errors);
    }
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto model)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);
        
        var user = await _userManager.FindByEmailAsync(model.Email);
        if (user == null) 
            return Unauthorized();
        
        var valid = await _userManager.CheckPasswordAsync(user, model.Password);
        if (!valid)
            return Unauthorized();
        var claims = new List<Claim>
        {
          new Claim(ClaimTypes.NameIdentifier, user.Id),
          new Claim(ClaimTypes.Email, user.Email),
          new Claim(ClaimTypes.Name, user.UserName)
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["JWT:Key"])
        );

        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.Now.AddDays(7),
            signingCredentials: creds
        );

        var jwt = new JwtSecurityTokenHandler().WriteToken(token);

        return Ok(new { token = jwt});
    }
}

public class RegisterDto
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
    [Required]
    [MinLength(8)]
    public string Password { get; set; } = string.Empty;
    [Required]
    public string UserName { get; set; } = string.Empty;

}

public class LoginDto
{
    [Required]
    public string Email { get; set; } = string.Empty;
    [Required]
    public string Password { get; set; } = string.Empty;
}
