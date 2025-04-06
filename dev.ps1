# Install frontend dependencies
Write-Host "Installing frontend dependencies..."
Set-Location frontend
npm install

# Install backend dependencies
Write-Host "Installing backend dependencies..."
Set-Location ../backend
npm install

# Start both servers
Write-Host "Starting development servers..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location ../backend; npm run dev"
Set-Location ../frontend
npm start 