# MiLo Social App

Welcome to **MiLo**, a full-featured real-time social web application. The platform provides a seamless space for users to register, discover friends, exchange real-time instant messages, create social posts, and manage their interactive user profiles.

---

## 🚀 Main Features

* **User Authentication:** Secure registration and login flows using industry-standard ASP.NET Core Identity paired with JWT Bearer Tokens.
* **Global Search:** Discover potential friends via a real-time global search directly from the Navbar.
* **User Profiles:** A customizable hub outlining user details, avatars, and a dynamic biography. Automatically calculates interaction buttons depending on Friendship status.
* **Friend Requests:** A robust two-way friendship handshake. Send requests, accept/decline reciprocal invites, and instantly drop or block inactive connections.
* **Real-time Messenger:** 
    * End-to-End WebSocket chat powered dynamically via SignalR.
    * Highly responsive modern UI with dynamically tracking "speech bubbles", sender name-tags, and parsed circular avatars.
* **Social Feed:** An interactive centralized timeline spanning posts constructed by the community.

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React + TypeScript (Bootstrapped via Vite)
- **Styling:** Chakra UI (for beautiful accessible component architectures)
- **State & Networking:** Axios & React Router DOM
- **Live Communication:** `@microsoft/signalr`

### Backend
- **Core Server:** C# .NET 10 (ASP.NET Core Web API)
- **Database ORM:** Entity Framework Core (`Npgsql.EntityFrameworkCore.PostgreSQL`)
- **Authentication:** ASP.NET Identity & Custom JWT Middlewares (including query-string decryption for SignalR channels)
- **Real-Time:** Microsoft SignalR Hubs

---

## 📂 Project Structure

```text
MiLo-Social-App/
├── backend/
│   ├── Controllers/     # RESTful API logic (Auth, Chat, Friends, Profile)
│   ├── Data/            # DBContext and EF Core connection mapping
│   ├── Hubs/            # SignalR communication pipes (ChatHub.cs)
│   ├── Migrations/      # Auto-generated EF Core DB migrations
│   ├── Program.cs       # ASP.NET runtime pipeline & DI containers
│   └── backend.csproj   # Backend project manifest & library configurations
├── frontend/
│   ├── src/
│   │   ├── components/  # React functional components (Messenger, Profile, App, Feed)
│   │   ├── config/      # Environment agnostic API routing
│   │   ├── services/    # SignalR connector configs
│   │   └── App.jsx      # Core React Router map
│   ├── vite.config.js   # Vite bundler options
│   └── package.json     # Node modules and dependency trees
└── docker-compose.yml   # Multi-container orchestration rules
```

---

## ⚙️ Environment Configuration

You'll need properly configured environment values for both local dev servers and Docker containers.

**Backend (`backend/appsettings.Development.json`):**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=milo;Username=postgres;Password=your_password"
  },
  "JWT": {
    "Key": "a_long_super_secret_encryption_key_for_jwt_tokens"
  }
}
```

**Frontend (`frontend/.env.development`):**
```env
VITE_API_URL=http://localhost:8080/api
```

*(Note: If running via Docker Compose, the `docker-compose.yml` injects these environments inherently without needing the physical `.env` files).*

---

## ⚡ Installation & Local Deployment

### Option 1: Docker Compose (Recommended)
This approach spins up the database, compiles the .NET binaries, builds the optimized React output, and maps all ports automatically.
1. Make sure you have Docker Desktop running.
2. At the root of the project, run:
```bash
docker compose up -d --build
```
3. Open your browser to `http://localhost`.

### Option 2: Native Hosting
Ensure you have Node.js 20+ and the .NET 10 SDK installed.

**1. Launch the Database (Supabase / Postgres)**
If you are attaching to a managed cloud database like Supabase, copy your external connection string and paste it straight into your `appsettings.json`.

**2. Setup Backend Engine**
```bash
cd backend
dotnet ef database update  # Create all tables cleanly
dotnet run                 # API will map dynamically to port 5127 or 8080
```

**3. Setup Frontend UI**
```bash
cd frontend
npm install
npm run dev                # Starts Vite on http://localhost:5173
```

---

## 🗄️ Supabase/Database Context

We heavily utilize a standard PostgreSQL database schema. 
* By default, local docker environments initialize an ephemeral Vanilla Postgres Database. 
* If plugging into Supabase, the Entity Framework takes completely native control over the database definitions. 
* *Note: The architecture leverages `.NET` identity internally rather than hitting Supabase's proprietary Auth schema.*

---

## 🔭 Future Improvements

While MiLo is feature-rich, our roadmap for subsequent milestone updates includes:
1. **Push Notifications:** Web-workers pushing OS-level toasts when receiving DMs.
2. **Cloud Storage Integration:** Integrating actual S3/Supabase storage Buckets allowing users to natively upload Avatars rather than providing hot-link URLs.
3. **Advanced Relationships:** Creating grouping concepts, typing indicators (`User is typing...`), and read-receipts.
4. **Enhanced React State Management:** Phasing out manual API queries in exchange for highly cached `React Query` wrappers.
