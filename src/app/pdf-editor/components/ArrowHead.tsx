export function ArrowHead({
  startX,
  startY,
  endX,
  endY,
  color,
  dashed = false,
}: {
  startX: number
  startY: number
  endX: number
  endY: number
  color: string
  dashed?: boolean
}) {
  const angle = Math.atan2(endY - startY, endX - startX)
  const lineLength = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2)
  const headLength = Math.min(lineLength * 0.25, 2.5)

  if (headLength < 0.3) return null

  const leftX = endX - headLength * Math.cos(angle - Math.PI / 7)
  const leftY = endY - headLength * Math.sin(angle - Math.PI / 7)
  const rightX = endX - headLength * Math.cos(angle + Math.PI / 7)
  const rightY = endY - headLength * Math.sin(angle + Math.PI / 7)

  return (
    <polygon
      points={`${endX},${endY} ${leftX},${leftY} ${rightX},${rightY}`}
      fill={color}
      stroke={dashed ? color : "none"}
      strokeDasharray={dashed ? "3 2" : undefined}
    />
  )
}
