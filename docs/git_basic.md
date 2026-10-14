Git Commands Guide — Attendance Analyzer

1. Introduction

Git is a version control system that helps team members track code changes, work on separate branches, and collaborate on the same project.

GitHub is an online platform where we can store and share our Git repository.

Why We Use Git

- Track changes in the project.
- Work on different features independently.
- Share code with teammates.
- Review changes before merging them.
- Recover previous versions of files.
- Reduce conflicts when multiple people work on the project.

2. Git Setup

2.1 Check Git Installation

git --version

This command displays the installed Git version.

2.2 Configure Your Identity

Run these commands once on your computer:

git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"

Example:

git config --global user.name "name"
git config --global user.email "name@example.com"

Use the email associated with your GitHub account if appropriate.

2.3 Check Your Configuration

git config --global --list

This displays your global Git configuration.

3. Clone the Repository

Command

git clone <repository-url>

Example

git clone https://github.com/username/attendance-analyzer.git

Purpose

- Downloads the remote repository to your computer.
- Creates a local project folder.
- Sets up the remote connection, usually named "origin".

After cloning, enter the project directory:

cd attendance-analyzer

Important: Replace the example URL with the actual GitHub repository URL.

4. Check Repository Status

Command

git status

Purpose

- Shows modified files.
- Shows files that are staged.
- Shows untracked files.
- Displays the current branch.

Best practice: Run "git status" before committing or switching branches.

5. Download the Latest Changes

5.1 Pull Changes

git pull origin main

Purpose

Downloads and integrates changes from the remote "main" branch into your current local branch.

Use this when you need the latest changes from "main".

Important Notes

- Commit or safely store your own work before pulling.
- Resolve merge conflicts if Git reports them.
- Do not assume "git pull" is safe to run blindly while you have conflicting local changes.

5.2 Fetch Changes Without Integrating Them

git fetch origin

This downloads information about remote changes but does not merge those changes into your current branch.

Difference Between Fetch and Pull

- "git fetch" downloads remote updates without integrating them.
- "git pull" fetches updates and integrates them into the current branch.

6. Create and Switch Branches

Branches allow team members to work on different features without directly changing the shared "main" branch.

6.1 View Local Branches

git branch

6.2 View Local and Remote Branches

git branch -a

6.3 Create a New Branch

git branch feature-name

This creates a branch but does not switch to it.

6.4 Switch to an Existing Branch

git switch feature-name

6.5 Create and Switch to a New Branch

git switch -c feature-name

Examples for Attendance Analyzer

Frontend developer:

git switch -c feature/frontend-dashboard

Backend developer:

git switch -c feature/backend-api

AI developer:

git switch -c feature/ai-insights

Team rule: Each member should normally implement their assigned feature on a separate branch.

7. Stage Changes

Staging means selecting which changes will be included in the next commit.

7.1 Stage a Specific File

git add docs/git-commands.md

7.2 Stage Multiple Files

git add frontend/index.html backend/server.js

7.3 Stage All Changes in the Current Directory

git add .

This stages changes under the current directory, including new files, modifications, and deletions Git detects.

Best practice: Use "git status" after staging to verify what will be committed.

8. Commit Changes

A commit records a snapshot of your staged changes.

Command

git commit -m "Your commit message"

Examples

git commit -m "Add attendance dashboard layout"

git commit -m "Implement subject API endpoints"

git commit -m "Add Git commands documentation"

Good Commit Message Practices