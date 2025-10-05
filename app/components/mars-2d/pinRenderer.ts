/**
 * Desenha um pin de localização no canvas
 * @param ctx Contexto 2D do canvas
 * @param x Posição X na tela
 * @param y Posição Y na tela
 */
export function drawLocationPin(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number
): void {
  ctx.save();

  // Ponta do pin (triângulo) - desenhar primeiro (atrás)
  ctx.fillStyle = "#ef4444"; // red-500
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - 8, y - 12);
  ctx.lineTo(x + 8, y - 12);
  ctx.closePath();
  ctx.fill();

  // Borda da ponta
  ctx.strokeStyle = "#991b1b"; // red-800
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - 8, y - 12);
  ctx.lineTo(x + 8, y - 12);
  ctx.closePath();
  ctx.stroke();

  // Corpo principal do pin (círculo superior) - desenhar depois (na frente)
  ctx.fillStyle = "#ef4444"; // red-500
  ctx.beginPath();
  ctx.arc(x, y - 18, 12, 0, Math.PI * 2);
  ctx.fill();

  // Borda do círculo
  ctx.strokeStyle = "#991b1b"; // red-800
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y - 18, 12, 0, Math.PI * 2);
  ctx.stroke();

  // Círculo interno branco (por último, na frente de tudo)
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(x, y - 18, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}
