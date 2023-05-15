# <b style="color: red;">(OUTDATED)</b> How to setup and run via Docker

## Setup Docker (Windows)

- Download [Docker Desktop](https://docs.docker.com/desktop/install/windows-install/)
- Install `Docker Desktop` up until it asks to "Close and Restart"
- Open a PowerShell instance as Administrator
- Install wsl

```ps1
# Type `wsl --install`
wsl --install
```

- Follow the instructions on the terminal.
- Once the terminal asks you to restart, go to the Docker Desktop app and click the `Close and Restart button`.
- Once the computer has restart, a Docker Desktop page and a WLS shell will open to setup the Linux account (Ubuntu by default) will open.
- On Docker Desktop, accept the ToS, wait for the container to start and skip the tutorial.

## Setup Docker Engine (Linux)

Use the official [tutorial](https://docs.docker.com/engine/install/ubuntu/) from the official documentation

> Note: The tutorial uses Ubuntu and apt as package manager.

---

## Run on Docker

- Make sure Docker is installed and running.
- Cd into the `backend` folder and build the bundle.

  ```bash
  # From the backend directory
  npm run build # run it with sudo if fails
  ```

- From the root directory run `docker-compose up --build` to spin up the containers
- To run tests in Docker, run `docker-compose -f docker-compose.test.yml up --build`
- You can also use the `Makefile` to start, stop, and restart the containers, in addition to running tests

```bash
# From the root directory

# Confirm that make is installed
make --version

# Start the containers (all of them if no parameter is passed)
make up [containers] # Example: make up frontend backend

# Stop the containers (all of them if no parameter is passed)
make down [containers] # Example: make down reverse-proxy

# Restart the currently running containers (no parameters needed)
make restart

# Run tests in containers and exit.
make test [frontend|backend] # Example: make test frontend
```

### Services

- **frontend:** This is the container where the React application is hosted. To access it from the browser, navigate to `localhost`.
- **backend:** This is the container where the API is hosted. To access it from the browser, navigate to `localhost/api`.

> Note: in the code itself, the backend still runs on port 8000. From the frontend, all requests should go to [http://localhost:8000/api/[endpoint]](http://localhost:8000/api/%5Bendpoint%5D) when running in a development environment.

- **reverse-proxy**: This is the container where the nginx service reroutes all requests to backend and frontend through port 80. You shouldn't need to access or modify this. Logs are located in /var/log/nginx/<access|error>.log
