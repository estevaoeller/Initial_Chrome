param(
    [string]$WikiRemote = "https://github.com/estevaoeller/Initial_Chrome.wiki.git",
    [string]$SourceDir = "$PSScriptRoot\..\wiki",
    [string]$TempDir = "$env:TEMP\initial-chrome-wiki-sync",
    [switch]$StageOnly
)

$ErrorActionPreference = "Stop"
$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)

if (-not (Test-Path $SourceDir)) {
    $AltDir = "$PSScriptRoot\..\_wiki"
    if (Test-Path $AltDir) {
        $SourceDir = $AltDir
    } else {
        throw "Directory wiki not found at $SourceDir"
    }
}

if (Test-Path $TempDir) {
    Remove-Item -Recurse -Force $TempDir
}
New-Item -ItemType Directory -Path $TempDir -Force | Out-Null

function Convert-WikiLinks([string]$content) {
    return [regex]::Replace($content, '\[([^\]]+)\]\((?!https?:\/\/|mailto:|file:\/\/)([^)#]+?)\.md(#[^)]+)?\)', {
        param($m)
        $label = $m.Groups[1].Value
        $rawPath = $m.Groups[2].Value
        $anchor = $m.Groups[3].Value
        $leaf = [System.IO.Path]::GetFileName($rawPath)
        if ($leaf -eq "INDEX") { $leaf = "Home" }
        return "[$label]($leaf$anchor)"
    })
}

# Process all .md files in wiki/ using strict UTF-8 without BOM
$mdFiles = Get-ChildItem -Path $SourceDir -Filter "*.md" -Recurse
foreach ($file in $mdFiles) {
    $raw = [System.IO.File]::ReadAllText($file.FullName, $Utf8NoBom)
    $converted = Convert-WikiLinks $raw

    if ($file.Name -eq "INDEX.md") {
        $targetPath = Join-Path $TempDir "Home.md"
    } else {
        $targetPath = Join-Path $TempDir $file.Name
    }
    [System.IO.File]::WriteAllText($targetPath, $converted, $Utf8NoBom)
}

Push-Location $TempDir
try {
    git init -b master
    git remote add origin $WikiRemote
    git add -A
    git commit -m "docs(wiki): sync project wiki pages and sidebar with UTF-8 encoding"
    if (-not $StageOnly) {
        git push -f origin master
    }
} finally {
    Pop-Location
}
