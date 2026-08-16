# AnatomiGrade AI - Lightweight PowerShell HTTP Server & Browser Launcher
$port = 8080
$prefix = "http://localhost:$port/"
$root = $PSScriptRoot

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "  🩺 AnatomiGrade AI - Medical Exam Grading Server" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "Serving files from: $root"
Write-Host "Opening web app at: $prefix" -ForegroundColor Yellow

# Try to launch local browser directly
Start-Process $prefix

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
    Write-Host "Server running on $prefix (Press Ctrl+C to stop)" -ForegroundColor Green
    
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $path = $request.Url.LocalPath
        if ($path -eq '/' -or [string]::IsNullOrWhiteSpace($path)) {
            $path = '/index.html'
        }

        $localPath = Join-Path $root ($path.TrimStart('/').Replace('/', '\'))

        if (Test-Path $localPath -PathType Leaf) {
            $bytes = [System.IO.File]::ReadAllBytes($localPath)
            
            $ext = [System.IO.Path]::GetExtension($localPath).ToLower()
            $mime = switch ($ext) {
                '.html' { 'text/html; charset=utf-8' }
                '.css'  { 'text/css; charset=utf-8' }
                '.js'   { 'application/javascript; charset=utf-8' }
                '.json' { 'application/json; charset=utf-8' }
                '.png'  { 'image/png' }
                '.jpg'  { 'image/jpeg' }
                '.svg'  { 'image/svg+xml' }
                default { 'application/octet-stream' }
            }

            $response.ContentType = $mime
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }
        $response.OutputStream.Close()
    }
} catch {
    Write-Host "Server stopped: $_" -ForegroundColor Red
} finally {
    $listener.Stop()
    $listener.Close()
}
