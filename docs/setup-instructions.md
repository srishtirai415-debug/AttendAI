Attendance Analyzer — Setup Instructions

1. Purpose

This document explains how to prepare the local development environment and run the Attendance Analyzer project.

Every team member should follow these instructions before starting development.

2. Prerequisites

Install the following software:

- Git
- Visual Studio Code
- Node.js and npm
- MySQL Server and MySQL command-line client
- Python 3

Verify the installations using:

git --version
node --version
npm --version
python --version

Verify MySQL from your system terminal:

mysql --version

If the "mysql" command is unavailable, check that the MySQL "bin" directory is added to your system's PATH.

Depending on your Python installation, you may need to use "python3" instead of "python".

3. Clone the Repository

Open a terminal and run:

git clone YOUR_REPOSITORY_URL
cd attendance-analyzer

Replace "YOUR_REPOSITORY_URL" with the actual GitHub repository URL.

Open the project in VS Code:

code .

4. Initialize the MySQL Database

Make sure your local MySQL server is running.

The project contains a database initialization script:

`database/init.sql`

On Windows PowerShell, run:

`Get-Content .\database\init.sql -Raw | mysql -u root -p`

On Windows Command Prompt, run:

`mysql -u root -p < database/init.sql`

On Linux or macOS, run:

`mysql -u root -p < database/init.sql`

Enter your local MySQL password when prompted.

The script creates the "attendance_analyzer" database and the initial "subjects" table.

Verify the Database

Connect to MySQL:

`mysql -u root -p`

Then run:
```MYSQL
USE attendance_analyzer;
DESCRIBE subjects;
SELECT * FROM subjects;
```

The table should contain the agreed columns. It may be empty initially.

5. Configure the Backend

The backend will be developed using Node.js and Express.js.

Once the backend package files are available, navigate to the backend directory:

cd backend
npm install

Create a local ".env" file in the backend directory using the environment variable names specified by the backend developer.

Example configuration:

PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_local_mysql_password
DB_NAME=attendance_analyzer

Replace the example values with your own local settings.

Security: Never commit ".env" files, database passwords, or API keys to GitHub. Use ".env.example" to document required variable names without real secrets.

Start the backend using the script defined in "backend/package.json". For example, if a "dev" script is configured:

npm run dev

6. Configure the Frontend

Once the frontend project and its package files are available, follow the instructions documented for the chosen frontend setup.

If the frontend uses plain HTML, CSS, and JavaScript, follow the agreed method for serving the application locally.

If a frontend development server is configured, use the command specified in its "package.json".

The frontend should send requests to the backend using the agreed API base URL.

7. Configure the AI Module

The AI module will use Python.

Once its files and dependencies are available, create a virtual environment inside "ai-module".

On Windows:

cd ai-module
python -m venv .venv
.\.venv\Scripts\Activate.ps1

On Linux or macOS:

cd ai-module
python3 -m venv .venv
source .venv/bin/activate

Install dependencies using the project's "requirements.txt", once that file has been created:

python -m pip install -r requirements.txt

The AI module's startup command will be documented after the team decides how it will be exposed to the backend.

8. Development Workflow

Before starting work:

1. Pull the latest changes from the shared repository.
2. Create or switch to your assigned Git branch.
3. Read the relevant project documentation.
4. Complete the assigned task.
5. Test your changes locally.
6. Commit your changes and open a pull request.

Example:

git switch main
git pull origin main
git switch -c frontend/subject-form

Choose a branch name that matches your assigned task.

9. Troubleshooting

MySQL command not found

Check the MySQL installation and add its "bin" directory to PATH if necessary.

Database connec