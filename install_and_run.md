# Habit Tracker Installation Guide

This guide will help you install and run the Habit Tracker application on your Windows computer.

## Step 1: Install Node.js

1. Visit [Node.js Download Page](https://nodejs.org/en/download/)
2. Click on the **Windows Installer (.msi)** button under the LTS version (recommended)
3. Once downloaded, run the installer:
   - Accept the license agreement
   - Click "Next" on each screen, accepting the default options
   - Click "Install" to begin installation
   - Wait for the installation to complete, then click "Finish"

## Step 2: Run the Setup Script

1. Navigate to the habit-tracker folder
2. Double-click on the `setup.bat` file
3. The script will:
   - Check if Node.js is installed correctly
   - Install all required dependencies automatically
   - Ask if you want to start the application

## Step 3: Using the Application

Once the application starts:
- It will automatically open in your web browser
- If it doesn't open automatically, go to [http://localhost:3000](http://localhost:3000) in your browser
- You can now start tracking your habits!

## Troubleshooting

If you encounter any issues:

1. **"Node.js is not installed" message**: 
   - Follow Step 1 to install Node.js
   - Make sure to restart your computer after installation
   - Run setup.bat again

2. **"Error installing dependencies" message**:
   - Check your internet connection
   - Try running setup.bat as administrator
   - Run setup.bat again

## Starting the App Later

To start the application later:
1. Navigate to the habit-tracker folder
2. Double-click on `setup.bat`
3. When asked if you want to start the application, type `y` and press Enter

OR

1. Open Command Prompt 
2. Type: `cd C:\path\to\habit-tracker` (replace with your actual path)
3. Type: `npm start` 