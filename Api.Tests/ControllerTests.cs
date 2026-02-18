using Xunit;
using Moq;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using backend.Controllers;
using System.Threading.Tasks;
using System.Collections.Generic;

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
}
