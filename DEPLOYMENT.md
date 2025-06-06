# Deploying to Cloudflare Pages

This document provides instructions for deploying this static blog project to Cloudflare Pages.

## Prerequisites

*   A GitHub account.
*   A Cloudflare account.
*   Git installed on your local machine.

## Deployment Steps

1.  **Push Project to a GitHub Repository:**
    *   If you haven't already, initialize a Git repository in your project's root directory:
        ```bash
        git init
        ```
    *   Add all your project files:
        ```bash
        git add .
        ```
    *   Commit the files:
        ```bash
        git commit -m "Initial commit of blog project"
        ```
    *   Create a new repository on GitHub (e.g., `my-static-blog`).
    *   Add the GitHub repository as a remote:
        ```bash
        git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
        ```
        (Replace `YOUR_USERNAME` and `YOUR_REPOSITORY_NAME` accordingly)
    *   Push your local `main` (or `master`) branch to GitHub:
        ```bash
        git branch -M main # If your default branch is master, rename it to main
        git push -u origin main
        ```

2.  **Create a New Cloudflare Pages Project:**
    *   Log in to the [Cloudflare dashboard](https://dash.cloudflare.com/).
    *   In your account's homepage, navigate to **Workers & Pages**.
    *   Select the **Pages** tab.
    *   Click on **Create a project**.
    *   Choose **Connect to Git**.

3.  **Connect GitHub Repository:**
    *   Select the GitHub repository you created in Step 1. If it's your first time, you might need to authorize Cloudflare to access your GitHub repositories.
    *   Once authorized, select your project repository and click **Begin setup**.

4.  **Configure Build Settings:**
    *   **Project name:** This will be pre-filled based on your repository name but can be changed. It determines your `*.pages.dev` subdomain.
    *   **Production branch:** Select `main` (or your primary branch).
    *   **Framework preset:** For a simple static HTML/CSS/JS site like this, you can leave this as "None" or select "Static HTML".
    *   **Build command:**
        *   Since this project doesn't require a build step (it's just static files), you can leave this blank or, as Cloudflare recommends for accessing features like Pages Functions, use `exit 0`.
        *   If you leave it blank and Cloudflare requires a command, `exit 0` is a safe bet.
    *   **Build output directory:**
        *   Set this to `/` or leave it as the default if it implies the root of the repository. This is where your `index.html` file is located.
    *   **Root directory (under Advanced):**
        *   Usually, this can be left as `/` unless your project files are in a subdirectory within the repository. For this project, it's the root.
    *   **Environment variables (Advanced):** None needed for this project.

5.  **Deploy the Site:**
    *   After configuring the settings, click **Save and Deploy**.
    *   Cloudflare Pages will then pull your code from GitHub and deploy your site.
    *   Once the deployment is complete, you'll be given a unique `*.pages.dev` URL where your blog is live (e.g., `my-static-blog.pages.dev`).
    *   Future pushes to your connected GitHub branch (e.g., `main`) will automatically trigger new deployments.

Your static blog should now be deployed and accessible via the Cloudflare Pages URL.
