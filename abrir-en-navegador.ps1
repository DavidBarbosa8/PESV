# Script para abrir páginas del sistema PESV en el navegador externo
# Uso: .\abrir-en-navegador.ps1 [nombre-pagina]

param(
    [string]$pagina = "index"
)

$baseUrl = "http://localhost:3000"
$paginas = @{
    "index" = "/index.html"
    "login" = "/login_screen.html"
    "admin-login" = "/admin_login_screen.html"
    "register" = "/register_screen.html"
    "dashboard" = "/dashboard.html"
    "preoperacional-carro" = "/preoperacional_carro.html"
    "preoperacional-moto" = "/preoperacional_moto.html"
    "select-role" = "/select_role.html"
    "password-recovery" = "/password_recovery.html"
    "admin-inspections" = "/admin/inspections.html"
}

if ($paginas.ContainsKey($pagina)) {
    $url = $baseUrl + $paginas[$pagina]
    Write-Host "Abriendo: $url" -ForegroundColor Green
    Start-Process $url
} else {
    Write-Host "Páginas disponibles:" -ForegroundColor Yellow
    $paginas.Keys | ForEach-Object { Write-Host "  - $_" }
    Write-Host "`nUso: .\abrir-en-navegador.ps1 [nombre-pagina]" -ForegroundColor Cyan
    Write-Host "Ejemplo: .\abrir-en-navegador.ps1 login" -ForegroundColor Cyan
}
