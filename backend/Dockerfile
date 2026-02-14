FROM mcr.microsoft.com/dotnet/sdk:10.0
WORKDIR /app

COPY backend/backend.csproj ./
RUN dotnet restore

COPY backend/ .

EXPOSE 8080

ENTRYPOINT ["dotnet", "watch", "run", "--project", "backend.csproj", "--non-interactive", "--urls", "http://+:8080"]
