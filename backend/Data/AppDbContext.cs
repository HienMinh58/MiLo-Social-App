using Microsoft.AspNetCore.Components.Server.ProtectedBrowserStorage;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

public class AppDbContext : IdentityDbContext<User>
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {}
        //Create Tables here

        protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        //Create Relationships here
    }
    
}