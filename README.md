<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# Nest Unit e2e testing App

1. Clone the project
2. `npm install`
3. Copy the `.env.template` file and rename it to `.env`
4. Update the environment variables as needed
5. Start the database with:

```
docker compose up -d
```

6. Start the application:

```
npm run start:dev
```

7. Execute SEED

```
http://localhost:3000/api/seed
```