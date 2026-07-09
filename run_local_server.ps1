# CS 1.6 Local Multiplayer Server & WebSocket Bridge for Windows
# This script starts the CS 1.6 Dedicated Server and acts as a WebSocket proxy
# so that browser-based players on your local network (LAN) can join.

$ErrorActionPreference = "Stop"

$csDir = "D:\antigravity\Cs\Counter Strike 1.6"
$hldsPort = 27015
$wsPort = 27016

# Step 1: Start native Counter-Strike dedicated server
Write-Host "=== Starting CS 1.6 Dedicated Server (UDP $hldsPort) ===" -ForegroundColor Cyan
if (-not (Test-Path "$csDir\hl.exe")) {
    Write-Host "ERROR: hl.exe not found in $csDir" -ForegroundColor Red
    exit
}

$hldsProcess = Get-Process -Name "hl" -ErrorAction SilentlyContinue | Where-Object { $_.Path -like "*Counter Strike 1.6*" }
if ($hldsProcess) {
    Write-Host "Dedicated server is already running (PID: $($hldsProcess.Id))." -ForegroundColor Yellow
} else {
    Write-Host "Launching dedicated server..."
    # Launch in a separate window
    Start-Process -FilePath "$csDir\hl.exe" -ArgumentList "-dedicated -game cstrike +port $hldsPort +maxplayers 16 +map de_dust2" -WorkingDirectory $csDir
    Start-Sleep -Seconds 3
}

# Step 2: Start WebSocket proxy
Write-Host "`n=== Starting WebSocket Proxy (TCP $wsPort) ===" -ForegroundColor Cyan

# Find local IP address
$localIp = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike "127.*" -and $_.InterfaceAlias -notlike "*Loopback*" }).IPAddress | Select-Object -First 1
Write-Host "Your Local IP Address: $localIp" -ForegroundColor Green
Write-Host "Colleagues should connect to: $localIp`:$wsPort" -ForegroundColor Green
Write-Host "--------------------------------------------------------"

$listener = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Any, $wsPort)
$listener.Start()
Write-Host "Listening for browser connections on port $wsPort..." -ForegroundColor Yellow

try {
    while ($true) {
        $client = $listener.AcceptTcpClient()
        $stream = $client.GetStream()
        
        Write-Host "Connection received from: $($client.Client.RemoteEndPoint)" -ForegroundColor Green
        
        # Read HTTP request for handshake
        $reader = New-Object System.IO.StreamReader($stream)
        $headers = @{}
        $line = $reader.ReadLine()
        while ($line -ne "" -and $line -ne $null) {
            if ($line -match "([^:]+):\s*(.*)") {
                $headers[$Matches[1].Trim()] = $Matches[2].Trim()
            }
            $line = $reader.ReadLine()
        }
        
        if ($headers.ContainsKey("Sec-WebSocket-Key")) {
            # Compute accept key
            $key = $headers["Sec-WebSocket-Key"]
            $acceptGuid = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
            $sha1 = [System.Security.Cryptography.SHA1]::Create()
            $hash = $sha1.ComputeHash([System.Text.Encoding]::ASCII.GetBytes($key + $acceptGuid))
            $accept = [System.Convert]::ToBase64String($hash)
            
            # Send HTTP 101 response
            $response = "HTTP/1.1 101 Switching Protocols`r`n" +
                        "Upgrade: websocket`r`n" +
                        "Connection: Upgrade`r`n" +
                        "Sec-WebSocket-Accept: $accept`r`n`r`n"
            $responseBytes = [System.Text.Encoding]::ASCII.GetBytes($response)
            $stream.Write($responseBytes, 0, $responseBytes.Length)
            
            Write-Host "WebSocket handshake completed successfully!" -ForegroundColor Green
            
            # Send SOCKFS initialization packet: \xff\xff\xff\xffport + port bytes (27015 in hex: 0x69 0x87)
            $initBytes = [byte[]](0xFF, 0xFF, 0xFF, 0xFF, 0x70, 0x6F, 0x72, 0x74, 0x69, 0x87)
            
            # Write unmasked server frame
            $wsHeader = [byte[]](0x82, $initBytes.Length)
            $stream.Write($wsHeader, 0, $wsHeader.Length)
            $stream.Write($initBytes, 0, $initBytes.Length)
            
            # Initialize UDP bridge to the local HLDS server
            $udp = New-Object System.Net.Sockets.UdpClient()
            $udp.Connect("127.0.0.1", $hldsPort)
            
            # Start background thread to read from UDP and send to WebSocket
            $cancelTokenSource = New-Object System.Threading.CancellationTokenSource
            $runUdpToWs = {
                param($argsArray)
                $udpClient = $argsArray[0]
                $tcpStream = $argsArray[1]
                $token = $argsArray[2]
                try {
                    $remoteEP = New-Object System.Net.IPEndPoint([System.Net.IPAddress]::Any, 0)
                    while (-not $token.IsCancellationRequested) {
                        if ($udpClient.Available -gt 0) {
                            $data = $udpClient.Receive([ref]$remoteEP)
                            $len = $data.Length
                            
                            # Frame header
                            $header = New-Object System.Collections.Generic.List[byte]
                            $header.Add(0x82) # Fin + Binary
                            if ($len -lt 126) {
                                $header.Add($len)
                            } else {
                                $header.Add(126)
                                $header.Add($len -shr 8)
                                $header.Add($len -band 255)
                            }
                            
                            # Write to stream
                            $tcpStream.Write($header.ToArray(), 0, $header.Count)
                            $tcpStream.Write($data, 0, $len)
                        } else {
                            [System.Threading.Thread]::Sleep(5)
                        }
                    }
                } catch {
                    # Silent exit on disconnect
                }
            }
            
            $thread = New-Object System.Threading.Thread (New-Object System.Threading.ParameterizedThreadStart $runUdpToWs)
            $thread.Start(@($udp, $stream, $cancelTokenSource.Token))
            
            # Main thread loop: read from WebSocket and send to UDP
            try {
                while ($true) {
                    $firstByte = $stream.ReadByte()
                    if ($firstByte -eq -1) { break }
                    
                    $secondByte = $stream.ReadByte()
                    if ($secondByte -eq -1) { break }
                    
                    $masked = ($secondByte -band 128) -eq 128
                    $len = $secondByte -band 127
                    
                    if ($len -eq 126) {
                        $len = ($stream.ReadByte() -shl 8) + $stream.ReadByte()
                    }
                    
                    if ($masked) {
                        $mask = New-Object byte[] 4
                        $read = $stream.Read($mask, 0, 4)
                        
                        $payload = New-Object byte[] $len
                        $bytesRead = 0
                        while ($bytesRead -lt $len) {
                            $r = $stream.Read($payload, $bytesRead, $len - $bytesRead)
                            if ($r -le 0) { break }
                            $bytesRead += $r
                        }
                        
                        # Unmask payload
                        for ($i = 0; $i -lt $len; $i++) {
                            $payload[$i] = $payload[$i] -bxor $mask[$i % 4]
                        }
                        
                        # Forward to UDP game server
                        $udp.Send($payload, $len) | Out-Null
                    }
                }
            } catch {
                Write-Host "Client disconnected." -ForegroundColor Yellow
            } finally {
                $cancelTokenSource.Cancel()
                $udp.Close()
                $client.Close()
                Write-Host "Bridge closed." -ForegroundColor Yellow
            }
        } else {
            $client.Close()
        }
    }
} finally {
    $listener.Stop()
    Write-Host "Proxy stopped." -ForegroundColor Red
}
