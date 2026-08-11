Add-Type -AssemblyName System.Drawing

function New-DifferentMindsIcon([int]$Size, [string]$OutputPath) {
  $bitmap = New-Object System.Drawing.Bitmap($Size, $Size)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml('#0F1220'))

  $margin = [int]($Size * 0.11)
  $circleBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#1A1E33'))
  $borderPen = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml('#2C3153'), [float]($Size * 0.012))
  $graphics.FillEllipse($circleBrush, $margin, $margin, $Size - (2 * $margin), $Size - (2 * $margin))
  $graphics.DrawEllipse($borderPen, $margin, $margin, $Size - (2 * $margin), $Size - (2 * $margin))

  $lineWidth = [float]($Size * 0.058)
  $leftPen = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml('#7C8CFF'), $lineWidth)
  $rightPen = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml('#5EE6C5'), $lineWidth)
  $leftPen.StartCap = $leftPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $rightPen.StartCap = $rightPen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round

  $left = New-Object System.Drawing.Drawing2D.GraphicsPath
  $left.AddBezier($Size * .23, $Size * .30, $Size * .40, $Size * .30, $Size * .40, $Size * .42, $Size * .40, $Size * .50)
  $left.AddBezier($Size * .40, $Size * .50, $Size * .40, $Size * .68, $Size * .34, $Size * .74, $Size * .30, $Size * .78)
  $right = New-Object System.Drawing.Drawing2D.GraphicsPath
  $right.AddBezier($Size * .77, $Size * .30, $Size * .60, $Size * .30, $Size * .60, $Size * .42, $Size * .60, $Size * .50)
  $right.AddBezier($Size * .60, $Size * .50, $Size * .60, $Size * .68, $Size * .66, $Size * .74, $Size * .70, $Size * .78)
  $graphics.DrawPath($leftPen, $left)
  $graphics.DrawPath($rightPen, $right)

  $dotSize = [int]($Size * .14)
  $dotBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#F4F5FA'))
  $graphics.FillEllipse($dotBrush, ($Size - $dotSize) / 2, ($Size - $dotSize) / 2, $dotSize, $dotSize)
  $bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)

  $dotBrush.Dispose(); $left.Dispose(); $right.Dispose(); $leftPen.Dispose(); $rightPen.Dispose()
  $circleBrush.Dispose(); $borderPen.Dispose(); $graphics.Dispose(); $bitmap.Dispose()
}

$assets = Join-Path $PSScriptRoot '..\assets'
New-DifferentMindsIcon 1024 (Join-Path $assets 'icon.png')
New-DifferentMindsIcon 1024 (Join-Path $assets 'adaptive-icon.png')
New-DifferentMindsIcon 1024 (Join-Path $assets 'splash-icon.png')
New-DifferentMindsIcon 256 (Join-Path $assets 'favicon.png')
