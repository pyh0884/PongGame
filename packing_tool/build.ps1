# =================================================================
# Main Build Script (PowerShell)
# =================================================================
#
# This script orchestrates the entire build process.
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File build.ps1 [develop | release]
#
# Arguments:
#   - develop:   Creates a development build. (Default)
#   - release:   Creates a release build.
#
# =================================================================

param(
    [string]$BuildArg = "develop"
)

# -- Script parameters --
$BuildType = $BuildArg
if ($BuildType -eq "" -or $BuildType -eq "develop") {
    $BuildType = "development"
}

if ($BuildType -notin @("development", "release")) {
    Write-Host "Invalid build type: '$BuildArg'. Please use 'develop' or 'release'." -ForegroundColor Red
    exit 1
}

# -- Paths --
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ProjectRoot = Split-Path -Parent $ScriptDir
$BuildDir = Join-Path $ProjectRoot "build"
$EditorSourceDir = Join-Path $ProjectRoot "editor_dev"

Write-Host "==================================================="
Write-Host "Starting Main Build Process"
Write-Host "Build Type: $BuildType"
Write-Host "==================================================="
Write-Host ""

# -- 1. Cleaning process --
Write-Host "[1/5] Cleaning build directory..."
if (Test-Path $BuildDir) {
    Remove-Item -Path $BuildDir -Recurse -Force
    Write-Host "     - Previous build directory removed."
}
New-Item -ItemType Directory -Path $BuildDir -Force | Out-Null
Write-Host "     - Created new build directory."
Write-Host ""

# -- 2. Unity game build process --
Write-Host "[2/5] Building Unity game via build_html5.ps1..."
$BuildHtml5Script = Join-Path $ScriptDir "build_html5.ps1"

try {
    $Process = Start-Process -FilePath "powershell.exe" -ArgumentList @("-ExecutionPolicy", "Bypass", "-File", "`"$BuildHtml5Script`"", $BuildType) -Wait -PassThru -NoNewWindow
    $BuildExitCode = $Process.ExitCode
} catch {
    Write-Host "ERROR: Failed to start build_html5.ps1: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

if ($BuildExitCode -ne 0) {
    Write-Host ""
    Write-Host "ERROR: Unity game build failed with exit code $BuildExitCode." -ForegroundColor Red
    Write-Host "Aborting main build. See logs for details." -ForegroundColor Red
    exit $BuildExitCode
}
Write-Host "     - Unity game build successful."
Write-Host ""

# -- 3. Editor build process --
Write-Host "[3/5] Copying editor files..."
if (-not (Test-Path $EditorSourceDir)) {
    Write-Host "     - WARNING: Editor source directory not found at '$EditorSourceDir'. Skipping." -ForegroundColor Yellow
} else {
    # Copy editor files (including packing_rule.json, but it will be overwritten in step 4)
    Copy-Item -Path "$EditorSourceDir\*" -Destination $BuildDir -Recurse -Force
    Write-Host "     - Editor files copied to build directory."
}
Write-Host ""

# -- 4. Publishing information processing --
Write-Host "[4/5] Copying packing rule..."
# Note: This will overwrite the packing_rule.json copied from editor_dev in step 3
# We use the version from packing_tool as the main version
$PackingRuleSource = Join-Path $ScriptDir "packing_rule.json"
$PackingRuleDest = Join-Path $BuildDir "packing_rule.json"
Copy-Item -Path $PackingRuleSource -Destination $PackingRuleDest -Force
Write-Host "     - packing_rule.json copied to build directory."
Write-Host ""

# -- 5. Game files scanning and updating process --
Write-Host "[5/5] Scanning and updating game files..."
# Important: This step will add game_files domain to packing_rule.json in build directory
# The updated file will contain all matching game files list
$UpdateGameFilesScript = Join-Path $ScriptDir "update_game_files.ps1"

try {
    $Process = Start-Process -FilePath "powershell.exe" -ArgumentList @("-ExecutionPolicy", "Bypass", "-File", "`"$UpdateGameFilesScript`"", "-BuildDir", "`"$BuildDir`"", "-PackingRuleFile", "`"$PackingRuleDest`"") -Wait -PassThru -NoNewWindow
    $ScanExitCode = $Process.ExitCode
} catch {
    Write-Host "ERROR: Failed to start update_game_files.ps1: $($_.Exception.Message)" -ForegroundColor Red
    $ScanExitCode = 1
}

if ($ScanExitCode -ne 0) {
    Write-Host ""
    Write-Host "WARNING: Game files scanning failed with exit code $ScanExitCode." -ForegroundColor Yellow
    Write-Host "Continuing with build, but packing_rule.json may not contain game_files." -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "     - Game files scanning and updating completed successfully."
    Write-Host "     - packing_rule.json now contains game_files domain with scanned files."
}
Write-Host ""

# -- Verify updated packing_rule.json --
Write-Host "Verifying updated packing_rule.json..."
if (Test-Path $PackingRuleDest) {
    $FileInfo = Get-Item $PackingRuleDest
    Write-Host "     - Final packing_rule.json exists in build directory."
    Write-Host "     - File size: $($FileInfo.Length) bytes"
} else {
    Write-Host "     - ERROR: packing_rule.json missing from build directory!" -ForegroundColor Red
}
Write-Host ""

Write-Host "==================================================="
Write-Host "Main build process completed successfully!"
Write-Host "==================================================="
Write-Host "Final output is in: $BuildDir"

exit 0 