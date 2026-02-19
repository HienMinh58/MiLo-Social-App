using Xunit;
using Moq;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Controllers;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using System.Runtime;

namespace Api.Tests
{
    public class AccountControllerTest
    {
        private Mock<UserManager<User>> GetUserManagerMock()
        {
            var store = new Mock<IUserStore<User>>();
            return new Mock<UserManager<User>>(
                store.Object, null, null, null, null, null, null, null, null
            );
        }

        [Fact]
        public async Task Register_ReturnsBadRequest_WhenModelStateInvalid()
        {
            // Arrange
            var userManagerMock = GetUserManagerMock();
            var controller = new AccountController(userManagerMock.Object);

            controller.ModelState.AddModelError("Email", "Required");

            var dto = new RegisterDto
            {
                Email = "",
                Password = "12345678",
                UserName = "test"
            };

            // Act
            var result = await controller.Register(dto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task Register_ReturnsOk_WhenUserCreatedSuccessfully()
        {
            // Arrange
            var userManagerMock = GetUserManagerMock();

            userManagerMock
                .Setup(x => x.CreateAsync(It.IsAny<User>(), It.IsAny<string>()))
                .ReturnsAsync(IdentityResult.Success);

            var controller = new AccountController(userManagerMock.Object);

            var dto = new RegisterDto
            {
                Email = "test@email.com",
                Password = "12345678",
                UserName = "testuser"
            };

            // Act
            var result = await controller.Register(dto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task Register_ReturnsBadRequest_WhenIdentityFails()
        {
            // Arrange
            var userManagerMock = GetUserManagerMock();

            var errors = new List<IdentityError>
            {
                new IdentityError { Description = "User already exists" }
            };

            userManagerMock
                .Setup(x => x.CreateAsync(It.IsAny<User>(), It.IsAny<string>()))
                .ReturnsAsync(IdentityResult.Failed(errors.ToArray()));

            var controller = new AccountController(userManagerMock.Object);

            var dto = new RegisterDto
            {
                Email = "test@email.com",
                Password = "12345678",
                UserName = "testuser"
            };

            // Act
            var result = await controller.Register(dto);

            // Assert
            var badRequest = Assert.IsType<BadRequestObjectResult>(result);
            Assert.NotNull(badRequest.Value);
        }
    }

    public class FriendsControllerTests
    {
        private AppDbContext GetDbContext()
        {
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDb_" + System.Guid.NewGuid())
                .Options;
            return new AppDbContext(options);
        }

        private FriendsController GetController(AppDbContext context, string userId)
        {
            var controller = new FriendsController(context);
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId)
            }, "mock"));
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };
            return controller;
        }

        [Fact]
        public async Task SendRequest_ShouldReturnBadRequest_WhenFriendSelf()
        {
            var db = GetDbContext();
            var controller = GetController(db, "user1");

            var result = await controller.SendRequest("user1");

            Assert.IsType<BadRequestObjectResult>(result);
        }

        [Fact]
        public async Task SendRequest_ShouldAddFriend_WhenValid()
        {
            var db = GetDbContext();
            db.Users.Add(new User { Id = "user2", UserName = "u2"});
            await db.SaveChangesAsync();

            var controller = GetController(db, "user1");
            var result = await controller.SendRequest("user2");

            Assert.IsType<OkResult>(result);
            var friend = await db.Friends.FindAsync("user1", "user2");
            Assert.NotNull(friend);
            Assert.Equal(FriendStatus.Accepted, friend.FriendStatus);
        }

        [Fact]
        public async Task GetPendingRequests_ShouldReturnPending()
        {
            var db = GetDbContext();
            db.Users.AddRange(
                new User { Id = "user1", UserName = "u1", Email = "u1@test.com" },
                new User { Id = "user2", UserName = "u2", Email="u2@test.com"}
            );
            db.Friends.Add(new Friend
            {
                RequesterId = "user2",
                AddresseeId = "user1",
                FriendStatus = FriendStatus.Pending
            });
            await db.SaveChangesAsync();

            var controller = GetController(db, "user1");
            var result = await controller.GetPendingRequests() as OkObjectResult;
            var list = ((IEnumerable<object>)result.Value).ToList();

            var first = list.First();
            var id = first.GetType().GetProperty("Id").GetValue(first).ToString();

            Assert.Single(list);
            Assert.Equal("user2", id);
        }
        [Fact]
        public async Task GetFriends_ShouldReturnAcceptedFriends()
        {
            var db = GetDbContext();
            db.Users.Add(new User { Id = "user2", UserName = "u2", Email = "u2@test.com" });
            db.Friends.Add(new Friend
            {
                RequesterId = "user1",
                AddresseeId = "user2",
                FriendStatus = FriendStatus.Accepted
            });
            await db.SaveChangesAsync();

            var controller = GetController(db, "user1");
            var result = await controller.GetFriends() as OkObjectResult;
            var list = ((IEnumerable<object>)result.Value).ToList();

            var first = list.First();
            var id = first.GetType().GetProperty("Id").GetValue(first).ToString();

            Assert.Single(list);
            Assert.Equal("user2", id);
        }
        [Fact]
        public async Task GetNonFriends_ShouldReturnUsersNotFriends()
        {
            var db = GetDbContext();
            db.Users.AddRange(
                new User { Id = "user1", UserName = "u1" },
                new User { Id = "user2", UserName = "u2" },
                new User { Id = "user3", UserName = "u3" }
            );
            db.Friends.Add(new Friend
            {
                RequesterId = "user1",
                AddresseeId = "user2",
                FriendStatus = FriendStatus.Accepted
            });
            await db.SaveChangesAsync();

            var controller = GetController(db, "user1");
            var result = await controller.GetNonFriends() as OkObjectResult;
            var list = ((IEnumerable<object>)result.Value).ToList();

            var first = list.First();
            var id = first.GetType().GetProperty("Id").GetValue(first).ToString();

            Assert.Single(list);
            Assert.Equal("user3", id);
        }
    };
}
