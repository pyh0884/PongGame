# =================================================================
# Game Files Scanning and Update Script
# =================================================================
# 
# Functions:
# 1. Read game rules from packing_rule.json
# 2. Scan matching game files in build folder
# 3. Update packing_rule.json, add game_files domain
# 
# Usage:
#   powershell -ExecutionPolicy Bypass -File update_game_files.ps1
# 
# =================================================================

param(
    [string]$BuildDir = $null,
    [string]$PackingRuleFile = $null
)

# Set default paths
if (-not $BuildDir) {
    $ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
    $ProjectRoot = Split-Path -Parent $ScriptDir
    $BuildDir = Join-Path $ProjectRoot "build"
}

if (-not $PackingRuleFile) {
    $PackingRuleFile = Join-Path $BuildDir "packing_rule.json"
}

Write-Host "====================================================="
Write-Host "Game Files Scanning and Update Script"
Write-Host "====================================================="
Write-Host "Build Directory: $BuildDir"
Write-Host "Packing Rule File: $PackingRuleFile"
Write-Host ""

# Check if build directory exists
if (-not (Test-Path $BuildDir)) {
    Write-Host "Error: Build directory not found: $BuildDir" -ForegroundColor Red
    exit 1
}

# Check if packing rule file exists
if (-not (Test-Path $PackingRuleFile)) {
    Write-Host "Error: Packing rule file not found: $PackingRuleFile" -ForegroundColor Red
    exit 1
}

try {
    # Read packing rules
    Write-Host "[1/4] Reading packing rules..."
    $packingRuleContent = Get-Content $PackingRuleFile -Raw -Encoding UTF8
    $packingRule = $packingRuleContent | ConvertFrom-Json
    
    if (-not $packingRule.rules.game) {
        Write-Host "Error: Game rules not found in packing rule file" -ForegroundColor Red
        exit 1
    }
    
    $gamePatterns = $packingRule.rules.game.patterns
    Write-Host "     - Found $($gamePatterns.Length) game file patterns"
    
    # Scan all files in build directory
    Write-Host "[2/4] Scanning files in build directory..."
    $allFiles = Get-ChildItem -Path $BuildDir -Recurse -File | Where-Object { $_.Name -ne "packing_rule.json" }
    Write-Host "     - Found $($allFiles.Count) files"
    
    # Match game files using regex
    Write-Host "[3/4] Matching game files with regex patterns..."
    Write-Host "     - Build directory: $BuildDir"
    Write-Host "     - Game patterns: $($gamePatterns -join ', ')"
    
    # Compile regex patterns for better performance
    $compiledPatterns = @()
    foreach ($pattern in $gamePatterns) {
        try {
            $compiledPatterns += [System.Text.RegularExpressions.Regex]::new($pattern, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
            Write-Host "     - Compiled pattern: $pattern"
        } catch {
            Write-Host "     - Warning: Invalid regex pattern: $pattern" -ForegroundColor Yellow
        }
    }
    
    # Get normalized build directory path
    $buildDirNormalized = [System.IO.Path]::GetFullPath($BuildDir)
    if (-not $buildDirNormalized.EndsWith([System.IO.Path]::DirectorySeparatorChar)) {
        $buildDirNormalized += [System.IO.Path]::DirectorySeparatorChar
    }
    
    # Use pipeline and regex to efficiently filter and match files
    $gameFiles = @($allFiles | ForEach-Object {
        try {
            # Get full path and calculate relative path
            $fullPath = [System.IO.Path]::GetFullPath($_.FullName)
            
            if ($fullPath.StartsWith($buildDirNormalized, [System.StringComparison]::OrdinalIgnoreCase)) {
                $relativePath = $fullPath.Substring($buildDirNormalized.Length).Replace('\', '/')
                
                # Test against compiled regex patterns
                foreach ($regex in $compiledPatterns) {
                    if ($regex.IsMatch($relativePath)) {
                        Write-Host "     - Match: $relativePath (Pattern: $($regex.ToString()))" -ForegroundColor Green
                        $relativePath  # Output matched file path
                        break  # Exit inner loop after first match
                    }
                }
            }
        } catch {
            Write-Host "     - Error processing file: $($_.FullName) - $($_.Exception.Message)" -ForegroundColor Red
        }
    } | Where-Object { $_ -ne $null -and $_ -ne '' })  # Filter out null/empty results
    
    Write-Host "     - Total matched $($gameFiles.Count) game files"
    
    # Update packing rules, add game_files domain
    Write-Host "[4/4] Updating packing rules..."
    
    # Create game_files domain
    $gameFilesInfo = @{
        "description" = "Scanned game file list (relative paths from build directory)"
        "scan_time" = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        "total_count" = $gameFiles.Count
        "files" = $gameFiles | Sort-Object
    }
    
    # Add to packing rules
    $packingRule | Add-Member -MemberType NoteProperty -Name "game_files" -Value $gameFilesInfo -Force
    
    # Save updated packing rules
    $updatedJson = $packingRule | ConvertTo-Json -Depth 10 -Compress:$false
    [System.IO.File]::WriteAllText($PackingRuleFile, $updatedJson, [System.Text.Encoding]::UTF8)
    
    Write-Host "     - Packing rules updated" -ForegroundColor Green
    Write-Host ""
    
    # Display statistics
    Write-Host "====================================================="
    Write-Host "Scan Complete Statistics:"
    Write-Host "====================================================="
    Write-Host "Total Files: $($allFiles.Count)"
    Write-Host "Game Files: $($gameFiles.Count)"
    Write-Host "Scan Time: $((Get-Date).ToString('yyyy-MM-dd HH:mm:ss'))"
    Write-Host ""
    
    if ($gameFiles.Count -gt 0) {
        Write-Host "Game Files List:"
        foreach ($file in ($gameFiles | Sort-Object)) {
            Write-Host "  - $file"
        }
    } else {
        Write-Host "Warning: No matching game files found" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Game files scanning and updating completed!" -ForegroundColor Green
    
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Details: $($_.Exception.ToString())" -ForegroundColor Red
    exit 1
}

exit 0 