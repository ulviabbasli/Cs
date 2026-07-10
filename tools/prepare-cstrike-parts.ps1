param(
    [Parameter(Mandatory = $true)]
    [string]$ZipPath,

    [string]$OutputDir = "engine/cs",

    [int]$PartSizeMb = 15
)

$ErrorActionPreference = "Stop"

$resolvedZip = Resolve-Path -LiteralPath $ZipPath
$resolvedOutput = Resolve-Path -LiteralPath $OutputDir
$partSize = $PartSizeMb * 1024 * 1024

Write-Host "Checking ZIP: $resolvedZip"
$zipEntries = tar -tf $resolvedZip
$zipEntries | Select-Object -First 30

$required = @(
    "cstrike/liblist.gam",
    "cstrike/maps",
    "cstrike/models",
    "cstrike/sound",
    "cstrike/sprites",
    "valve/pak0.pak"
)

$missing = @()
foreach ($item in $required) {
    if (-not ($zipEntries | Where-Object { $_.StartsWith($item) })) {
        $missing += $item
    }
}

if ($missing.Count -gt 0) {
    Write-Warning "The ZIP looks incomplete. Missing expected entries:"
    $missing | ForEach-Object { Write-Warning " - $_" }
    Write-Warning "The browser client may open a black screen if these assets are missing."
}

Get-ChildItem -LiteralPath $resolvedOutput -Filter "cstrike_game.part_*" | Remove-Item -Force

$inputStream = [System.IO.File]::OpenRead($resolvedZip)
try {
    $buffer = New-Object byte[] $partSize
    $index = 1
    while (($read = $inputStream.Read($buffer, 0, $buffer.Length)) -gt 0) {
        $partPath = Join-Path $resolvedOutput "cstrike_game.part_$index"
        $outputStream = [System.IO.File]::Create($partPath)
        try {
            $outputStream.Write($buffer, 0, $read)
        } finally {
            $outputStream.Dispose()
        }
        Write-Host "Wrote $partPath ($read bytes)"
        $index++
    }
} finally {
    $inputStream.Dispose()
}

Write-Host "Done. Commit the generated engine/cs/cstrike_game.part_* files only if you have distribution rights."
