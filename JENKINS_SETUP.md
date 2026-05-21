# DevOps Showcase: Jenkins CI/CD Integration Guide

Welcome to the Jenkins DevOps integration layer for **EzyEduTube**! This document serves as a complete setup guide, architectural blueprint, and classroom presentation resource.

This integration is designed as a **completely isolated, additive, and safe demonstration layer**. It acts as a local automated build and smoke-test environment without affecting your active production applications (Vercel, Render), live external MySQL databases (Railway), or media hosting (Cloudinary).

---

## ─── 1. ARCHITECTURAL BLUEPRINT ───

To achieve safe and lightweight DevOps automation on local environments (including Windows Docker Desktop), we employ a **Socket-Shared Docker-in-Docker (DinD)** architecture.

### How it Works
1. **The Jenkins Container (`ezyedutube-jenkins`)** runs the Jenkins automation server on port `8080`.
2. **Docker Socket Sharing (`/var/run/docker.sock`):** By mounting the host machine's Docker daemon socket into the Jenkins container, the Jenkins pipeline can issue standard `docker` and `docker compose` commands.
3. **Execution Safety:** When Jenkins executes a stage like `docker compose build` or `docker compose up -d`, these commands are **not** run inside a nested virtualized Docker container. Instead, they are passed directly to your **host machine's Docker engine** which orchestrates the builds. This prevents massive memory overhead and permission bottlenecks!

### Network & Port Isolation Table
| Service Name | Port (Internal) | Port (Host / External) | Role |
| :--- | :--- | :--- | :--- |
| **nginx** | `80` | `80` | Reverse Proxy & Router |
| **frontend** | `80` | *None (Routed via Nginx)* | React SPA UI client |
| **api** | `5000` | *None (Routed via Nginx)* | Node.js Backend API Server |
| **jenkins** | `8080`, `50000` | `8080`, `50000` | DevOps Automation Server & Agent |

---

## ─── 2. QUICK START: RUNNING JENKINS ───

### Step A: Start the Jenkins Container
Navigate to your project root in PowerShell/Terminal and launch the isolated Jenkins service:
```powershell
docker compose up -d jenkins
```
> [!NOTE]
> This command selectively starts **only** the Jenkins container, allowing you to access the dashboard and configure your automation layer before building the application.

### Step B: Retrieve the Initial Administrator Password
When Jenkins boots for the first time, it generates a secure, one-time admin setup password. Retrieve it directly from the container logs:
```powershell
docker logs ezyedutube-jenkins
```
*Look for a string of numbers and letters similar to:*
`c83e2003c2da4a8ca4a908d13cfbeea4`

---

## ─── 3. JENKINS DASHBOARD SETUP ───

1. Open your browser and navigate to **`http://localhost:8080`**.
2. **Unlock Jenkins:** Paste the admin password retrieved in Step B.
3. **Install Plugins:** Choose **"Install Suggested Plugins"**. (This automatically installs essential plugins including Git, Pipeline, and SCM integrations).
4. **Create Admin User:** Complete the forms to create your personal administrator account.

---

## ─── 4. CREATING THE CI/CD PIPELINE ───

To showcase automated pipeline flows:

1. On the Jenkins home page, click **"New Item"** (top-left menu).
2. Enter the name: `EzyEduTube-DevOps-Showcase`.
3. Select **"Pipeline"** and click **"OK"** at the bottom.
4. Scroll down to the **"Pipeline"** configuration section:
   - Under *Definition*, select **"Pipeline script from SCM"**.
   - Under *SCM*, select **"Git"**.
   - Under *Repository URL*, enter your local repository path (e.g., `C:/Users/abhil/Downloads/Devops project EzyEduTube` or your Git URL).
   - Under *Branch Specifier*, change `*/master` to `*/main` (or whichever branch holds your code).
   - Ensure the *Script Path* points to `Jenkinsfile` (the default).
5. Click **"Save"**.

---

## ─── 5. RUNNING BUILDS & PIPELINE AUTOMATION ───

### Trigger a Build
1. In your newly created pipeline project, click **"Build Now"** in the left sidebar.
2. In the **"Stage View"** dashboard, watch Jenkins execute each stage in real time:
   - **Clone Repository:** Pulls clean project source code.
   - **Verify Docker Environment:** Checks host connection to `docker` and `docker compose`.
   - **Build Docker Images:** Compiles local images for `frontend`, `api`, and `nginx`.
   - **Run Containers:** Orchestrates local environment startup.
   - **Verify Running Containers:** Performs a local status check via `docker ps`.

### Expected Successful Pipeline Output Log
When viewing the Console Output of a successful build, you will see clean logs demonstrating control:
```text
[Pipeline] stage (1. Clone Repository)
=== STAGE: Cloned Repository ===
...
[Pipeline] stage (2. Verify Docker Environment)
=== STAGE: Verifying Docker Installation ===
+ docker --version
Docker version 27.2.0, build 3ab4256
+ docker compose version
Docker Compose version v2.29.2
[Pipeline] stage (3. Build Docker Images)
=== STAGE: Building Application Docker Images ===
+ docker compose build --no-cache
...
Successfully built ezyedutube-frontend
Successfully built ezyedutube-api
Successfully built ezyedutube-nginx
[Pipeline] stage (4. Run Containers)
=== STAGE: Orchestrating Containers via Docker Compose ===
+ docker compose up -d
Container devopsprojectezyedutube-api-1  Started
Container devopsprojectezyedutube-frontend-1  Started
Container devopsprojectezyedutube-nginx-1  Started
[Pipeline] stage (5. Verify Running Containers)
=== STAGE: Verifying Container Health ===
+ docker ps --filter "name=devopsprojectezyedutube"
CONTAINER ID   IMAGE                       STATUS         PORTS                NAMES
8f92bd3a02a1   ezyedutube-nginx:latest     Up 5 seconds   0.0.0.0:80->80/tcp   devopsprojectezyedutube-nginx-1
1b2e8ca0239c   ezyedutube-api:latest       Up 6 seconds   5000/tcp             devopsprojectezyedutube-api-1
e77f0a82410b   ezyedutube-frontend:latest  Up 6 seconds   80/tcp               devopsprojectezyedutube-frontend-1
Local containers active and verified successfully!
[Pipeline] Finished: SUCCESS
```

---

## ─── 6. SAFE DECOMMISSION & TEARDOWN ───

To stop your showcase and keep your system clean and light:

### Stop Application Containers Only
If you want to shut down the running application containers built by Jenkins but leave Jenkins running:
```powershell
docker compose down
```

### Stop Jenkins and Application Containers (Total Teardown)
To shut down Jenkins, application containers, and release resources:
```powershell
docker compose down --volumes
```
> [!TIP]
> Adding `--volumes` will delete the `jenkins_data` volume. This is recommended if you want to perform a fresh showcase next time or remove all localized Docker overhead from your computer.

---

## ─── 7. DEVOP VIVA / PRESENTATION SHOWCASE TIPS ───

If presenting this to professors, interviewers, or peers, highlight these details:
1. **Additive Architecture:** Explain that this pipeline validates local code changes before a GitHub push, functioning *independently* of the production branch which utilizes GitHub Actions, Render, and Vercel.
2. **Secrets Security:** Explain how you avoided hardcoding credentials inside the `Jenkinsfile` to abide by standard production compliance. Show that Docker Hub logins are parameterized.
3. **Rollback Capability:** Point out the `post { failure { ... } }` block in the `Jenkinsfile` where `docker compose down` automatically runs to rollback the local environment if a build phase crashes, preventing corrupted configurations from persisting.
4. **Nginx Integration:** Explain how nginx routes traffic to internal containers safely so that users only have to interface with public port `80`, shielding the internal React and API structures from malicious exterior requests.
