
$files = @(
    "server.ts",
    "src/pages/AdminDashboard.tsx",
    "src/pages/UserDashboard.tsx",
    "src/context/StoreContext.tsx"
)

$outputFile = "FINAL_CODE_FOR_AI_STUDIO.txt"
"" | Set-Content $outputFile

foreach ($file in $files) {
    if (Test-Path $file) {
        "--- START OF FILE: $file ---" | Add-Content $outputFile
        Get-Content $file | Add-Content $outputFile
        "--- END OF FILE: $file ---" | Add-Content $outputFile
        "`n`n" | Add-Content $outputFile
        Write-Host "Added $file to sync file." -ForegroundColor Green
    } else {
        Write-Host "Warning: $file not found!" -ForegroundColor Yellow
    }
}

Write-Host "`nDone! Open FINAL_CODE_FOR_AI_STUDIO.txt and copy its content to AI Studio." -ForegroundColor Cyan
