$moduleRoot = $PSScriptRoot
$moduleId = 'fantastic-depths-dm-screen'
$zipPath = Join-Path $moduleRoot "$moduleId.zip"

$stagingBase = [System.IO.Path]::GetTempPath()
$stagingPath = Join-Path $stagingBase "fade-dm-screen-release-$([guid]::NewGuid().ToString('N'))"
$moduleStagingPath = Join-Path $stagingPath $moduleId

$excludeDirNames = @('.git', '.github', '.windsurf', '.vscode', 'node_modules')
$excludeFileNames = @('.gitignore', 'package-release.ps1', 'monster-name-table.md')
$excludeFilePatterns = @('*.zip')

try {
  New-Item -ItemType Directory -Path $moduleStagingPath -Force | Out-Null

  $files = Get-ChildItem -Path $moduleRoot -Recurse -File | Where-Object {
    $relativeParts = $_.FullName.Substring($moduleRoot.Length + 1).Split([System.IO.Path]::DirectorySeparatorChar)

    foreach ($dir in $excludeDirNames) {
      if ($relativeParts -contains $dir) { return $false }
    }
    if ($excludeFileNames -contains $_.Name) { return $false }
    foreach ($pattern in $excludeFilePatterns) {
      if ($_.Name -like $pattern) { return $false }
    }
    return $true
  }

  if (-not $files) {
    throw "No files found to package."
  }

  foreach ($file in $files) {
    $relativePath = $file.FullName.Substring($moduleRoot.Length + 1)
    $targetPath = Join-Path $moduleStagingPath $relativePath
    $targetDir = Split-Path -Parent $targetPath
    if (-not (Test-Path -LiteralPath $targetDir)) {
      New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    }
    Copy-Item -LiteralPath $file.FullName -Destination $targetPath -Force
  }

  if (Test-Path -LiteralPath $zipPath) {
    Remove-Item -LiteralPath $zipPath -Force
  }

  Compress-Archive -Path $moduleStagingPath -DestinationPath $zipPath -CompressionLevel Optimal

  Write-Host "Release package created: $zipPath" -ForegroundColor Green
}
finally {
  if (Test-Path -LiteralPath $stagingPath) {
    Remove-Item -LiteralPath $stagingPath -Recurse -Force
  }
}
