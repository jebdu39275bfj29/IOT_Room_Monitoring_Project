# IoT Room Monitoring Project
This project introduces a simple but scalable IoT-style solution that monitors rooms, updates their occupancy status, and provides a clean web dashboard for users.
The system simulates sensors (or can connect to real sensors in the future), updates a backend API, and displays room availability through a browser interface.

## Start the Backend
cd backend  
npm install  
npm run dev   # server on http://localhost:3001

## Open the Frontend
open frontend/index.html （or Live Server）

# Below are Git ###

## Create Brach (First time):
 - git checkout -b "Your_Branch_Name"

## Enter Branch: 
 - git checkout "Your_Branch_Name"

# Standard-workflow
## 1. Move to project directory.
 - cd IOT_Room_Monitoring_Project

## 2. Ensure you’re on your branch.
 - git checkout "Your_Branch_Name"

## 3. Always pull the newest main BEFORE starting work.
 - git pull origin main

# Save your work (commit + push)
## 1. See what changed
 - git status

## 2. Add your changes
 - git add .

## 3. Commit with a short useful description
 - git commit -m "your description here"

## 4. Push up to GitHub (YOUR branch)
 - git push origin Your_Branch_Name

# Merge Your Work into Main (Pull Request)
1. Enter GitHub → your repo.
2. A banner appears: “Compare & Pull Request”.
3. Click → add a short description.
4. Click Merge Pull Request (if no conflicts).
5. Your branch code is now merged into main.

# After Merge: Update Your Local Main
 - git checkout main
 - git pull origin main








