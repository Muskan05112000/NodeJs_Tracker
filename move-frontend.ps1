# PowerShell script to move frontend files into /frontend

# Set working directory to the project root
$projectRoot = "c:\Users\2273224\CascadeProjects\Updated_Leave_Tracker"
Set-Location $projectRoot

# Create frontend directory if it doesn't exist
if (-not (Test-Path -Path "frontend")) {
    New-Item -ItemType Directory -Path "frontend"
}

# Move package.json and package-lock.json if they exist and match frontend
Move-Item -Path "package.json" -Destination "frontend\package.json" -Force
if (Test-Path "package-lock.json") {
    Move-Item -Path "package-lock.json" -Destination "frontend\package-lock.json" -Force
}

# Move src and public directories
if (Test-Path "src") {
    Move-Item -Path "src" -Destination "frontend\src" -Force
}
if (Test-Path "public") {
    Move-Item -Path "public" -Destination "frontend\public" -Force
}

Write-Host "Frontend files have been moved to the /frontend directory."
