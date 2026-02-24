using Microsoft.AspNetCore.Components.Server.ProtectedBrowserStorage;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

public class AppDbContext : IdentityDbContext<User>
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {}
        //Create Tables here
        public DbSet<Post> Posts => Set<Post>();
        public DbSet<Like> Likes => Set<Like>();
        public DbSet<Comment> Comments => Set<Comment>();
        public DbSet<Friend> Friends => Set<Friend>();
        public DbSet<Message> Messages => Set<Message>();
        protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        //Create Relationships here

        //Post Relationship
        builder.Entity<Post>()
            .HasOne(p => p.User)
            .WithMany(u => u.Posts)
            .HasForeignKey(p => p.UserId)
            .OnDelete(DeleteBehavior.Cascade);
            
        //Like Relationship
        builder.Entity<Like>()
            .HasOne(l => l.Post)
            .WithMany(p => p.Likes)
            .HasForeignKey(l => l.PostId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Entity<Like>()
            .HasOne(l => l.User)
            .WithMany(u => u.Likes)
            .HasForeignKey(l => l.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        //Friend Relationship
        builder.Entity<Friend>()
            .HasKey(f => new { f.RequesterId, f.AddresseeId});
        
        builder.Entity<Friend>()
            .HasOne(f => f.Requester)
            .WithMany(u => u.SentRequests)
            .HasForeignKey(f => f.RequesterId)
            .OnDelete(DeleteBehavior.Restrict);
        
        builder.Entity<Friend>()
            .HasOne(f => f.Addressee)
            .WithMany(u => u.ReceivedRequests)
            .HasForeignKey(f => f.AddresseeId)
            .OnDelete(DeleteBehavior.Restrict);
    }
    
}