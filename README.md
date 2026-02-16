.
├── .gitignore
├── docker-compose.yml
└── webapp.sln

├── backend/
│   ├── .dockerignore
│   ├── appsettings.json
│   ├── appsettings.Development.json
│   ├── backend.csproj
│   ├── Dockerfile
│   ├── Program.cs
│   ├── Controllers/
│   │   ├── AccountController.cs
│   │   └── PostController.cs
│   ├── Data/
│   │   └── AppDbContext.cs
│   ├── Models/
│   │   ├── User.cs
│   │   ├── Post.cs
│   │   ├── Like.cs
│   │   ├── Comments.cs
│   │   └── Friend.cs
│   └── Properties/
│       └── launchSettings.json
└── frontend/
    ├── .dockerignore
    ├── .gitignore
    ├── Dockerfile
    ├── eslint.config.js
    ├── index.html
    ├── package.json
    ├── package-lock.json
    ├── vite.config.js
    ├── public/
    │   └── vite.svg
    └── src/
        ├── App.jsx
        ├── App.css
        ├── main.jsx
        ├── index.css
        ├── assets/
        │   └── react.svg
        ├── components/
        │   └── Register.tsx
        └── config/
            └── api.js
