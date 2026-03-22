# Dashboard Migration Script
# Run this from PowerShell in: c:\Users\Kortez\Desktop\DesktopSaas

# 1. Create dashboard folder structure in website
$dashboardPath = ".\studylayer-website\src\dashboard"
New-Item -ItemType Directory -Force -Path "$dashboardPath\components"
New-Item -ItemType Directory -Force -Path "$dashboardPath\components\learn-mode"
New-Item -ItemType Directory -Force -Path "$dashboardPath\components\learn-mode\utils"
New-Item -ItemType Directory -Force -Path "$dashboardPath\components\ui"
New-Item -ItemType Directory -Force -Path "$dashboardPath\pages"
New-Item -ItemType Directory -Force -Path "$dashboardPath\contexts"
New-Item -ItemType Directory -Force -Path "$dashboardPath\styles"

# 2. Copy components
Copy-Item ".\studylayer-dashboard\src\components\*.tsx" "$dashboardPath\components\" -Force
Copy-Item ".\studylayer-dashboard\src\components\ui\*.tsx" "$dashboardPath\components\ui\" -Force
Copy-Item ".\studylayer-dashboard\src\components\learn-mode\*.tsx" "$dashboardPath\components\learn-mode\" -Force
Copy-Item ".\studylayer-dashboard\src\components\learn-mode\*.ts" "$dashboardPath\components\learn-mode\" -Force
Copy-Item ".\studylayer-dashboard\src\components\learn-mode\utils\*" "$dashboardPath\components\learn-mode\utils\" -Force

# 3. Copy pages
Copy-Item ".\studylayer-dashboard\src\pages\*.tsx" "$dashboardPath\pages\" -Force

# 4. Copy contexts (except ClassesContext which was removed)
Get-ChildItem ".\studylayer-dashboard\src\contexts\*.tsx" | Where-Object { $_.Name -ne "ClassesContext.tsx" } | Copy-Item -Destination "$dashboardPath\contexts\" -Force

# 5. Copy styles
Copy-Item ".\studylayer-dashboard\src\index.css" "$dashboardPath\styles\dashboard.css" -Force

Write-Host "Migration complete! Dashboard copied to: $dashboardPath" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Open the studylayer-website project"
Write-Host "2. Update imports in dashboard files to use relative paths"
Write-Host "3. Create DashboardApp.tsx entry point"
Write-Host "4. Add dashboard routes to main App.tsx"
