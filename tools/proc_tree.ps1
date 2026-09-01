# proc_tree.ps1 — 递归枚举指定根 PID 的 chrome 进程树内存（WorkingSet / Private）
# 用法: powershell -NoProfile -ExecutionPolicy Bypass -File proc_tree.ps1 <rootPid>
param([int]$RootPid)

$pids = @($RootPid)
$all = @(Get-CimInstance Win32_Process -Filter "Name='chrome.exe'" | Select-Object ProcessId, ParentProcessId, WorkingSetSize, PrivateMemorySize)

$changed = $true
while ($changed) {
    $changed = $false
    foreach ($p in $all) {
        if ($pids -contains $p.ParentProcessId -and $pids -notcontains $p.ProcessId) {
            $pids += $p.ProcessId
            $changed = $true
        }
    }
}

$ws = 0
$priv = 0
foreach ($p in $all) {
    if ($pids -contains $p.ProcessId) {
        $ws += [long]$p.WorkingSetSize
        $priv += [long]$p.PrivateMemorySize
    }
}

Write-Output ("WS={0};PRIV={1};COUNT={2}" -f $ws, $priv, $pids.Count)
