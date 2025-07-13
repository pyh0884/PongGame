# =================================================================
# Unity WebGL Build Script (PowerShell)
# =================================================================
#
# Usage:
#   powershell -ExecutionPolicy Bypass -File build_html5.ps1 [development | release]
#
# Arguments:
#   - development: Creates a development build with debugging enabled. (Default)
#   - release:     Creates a release build.
#
# =================================================================

param(
    [string]$BuildType = "development"
)

# -- Configuration --
# IMPORTANT: Set this to the full path of your Unity Editor executable.
$UNITY_EDITOR_PATH = "D:\Programs\UnityEditor\2022.3.62f1\Editor\Unity.exe"

# -- Validate build type --
if ($BuildType -notin @("development", "release")) {
    Write-Host "Invalid build type: '$BuildType'. Please use 'development' or 'release'." -ForegroundColor Red
    exit 1
}

# -- Paths --
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ProjectRoot = Split-Path -Parent $ScriptDir
$UnityProjectPath = Join-Path $ProjectRoot "game_dev"
$BuildOutputPath = Join-Path $ProjectRoot "build"
$LogPath = Join-Path $ProjectRoot "logs"

Write-Host "==================================================="
Write-Host "Starting Unity WebGL Build"
Write-Host "==================================================="
Write-Host ""
Write-Host "Unity Editor: $UNITY_EDITOR_PATH"
Write-Host "Project Path: $UnityProjectPath"
Write-Host "Build Type:   $BuildType"
Write-Host "Output Path:  $BuildOutputPath"
Write-Host "Log Folder:   $LogPath"
Write-Host ""

# -- Check Unity Editor exists --
if (-not (Test-Path $UNITY_EDITOR_PATH)) {
    Write-Host "ERROR: Unity Editor not found at $UNITY_EDITOR_PATH" -ForegroundColor Red
    Write-Host "Please update the UNITY_EDITOR_PATH variable in this script." -ForegroundColor Red
    exit 1
}

# -- Prepare output and log directories --
if (Test-Path $BuildOutputPath) {
    Write-Host "Cleaning previous build at '$BuildOutputPath'..."
    Remove-Item -Path $BuildOutputPath -Recurse -Force
}
New-Item -ItemType Directory -Path $BuildOutputPath -Force | Out-Null

if (-not (Test-Path $LogPath)) {
    Write-Host "Creating log directory: $LogPath"
    New-Item -ItemType Directory -Path $LogPath -Force | Out-Null
}

$LogFile = Join-Path $LogPath "unity_build_$BuildType.log"

# -- Run Unity Build --
Write-Host "Starting Unity build process... This may take a while."
Write-Host "See $LogFile for detailed progress."

$UnityArgs = @(
    "-quit",
    "-batchmode",
    "-projectPath", "`"$UnityProjectPath`"",
    "-executeMethod", "UnityBuilderAction.BuildScript.BuildFromCommandLine",
    "-buildType", $BuildType,
    "-buildPath", "`"$BuildOutputPath`"",
    "-logFile", "`"$LogFile`""
)

try {
    $Process = Start-Process -FilePath $UNITY_EDITOR_PATH -ArgumentList $UnityArgs -Wait -PassThru -NoNewWindow
    $BuildExitCode = $Process.ExitCode
} catch {
    Write-Host "ERROR: Failed to start Unity process: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

if ($BuildExitCode -eq 0) {
    Write-Host ""
    Write-Host "==================================================="
    Write-Host "Build successful!"
    Write-Host "==================================================="
    Write-Host "Files are located in: $BuildOutputPath"
} else {
    Write-Host ""
    Write-Host "==================================================="
    Write-Host "ERROR: Unity build failed with exit code $BuildExitCode."
    Write-Host "==================================================="
    Write-Host "Check the log file for details: $LogFile"
}

exit $BuildExitCode 