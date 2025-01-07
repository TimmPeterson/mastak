export class frame {
  constructor(id) {
    // gameCanvas element
    this.canvas = document.getElementById(id);

    // drawing context for canvas
    this.ctx = this.canvas.getContext("2d");
  }

  putPixel(x, y, r, g, b) {
    this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    this.ctx.fillRect(x, y, 1, 1);
  }

  putRect(x, y, w, h, r, g, b) {
    this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    this.ctx.fillRect(x, y, w, h);
  }

  putHLine(y, x1, x2, r, g, b) {
    this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    this.ctx.fillRect(x1, y, x2 - x1, 1);
  }

  putVLine(x, y1, y2, r, g, b) {
    this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    this.ctx.fillRect(x, y1, y2 - y1, 1);
  }

  putDLine(x1, y1, x2, y2, r, g, b, w) {
    // Устанавливаем цвет линии
    this.ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
    // Устанавливаем ширину линии
    this.ctx.lineWidth = w;

    // Начинаем путь
    this.ctx.beginPath();
    // Перемещаемся к начальной точке
    this.ctx.moveTo(x1, y1);
    // Рисуем линию к конечной точке
    this.ctx.lineTo(x2, y2);
    // Заканчиваем путь и рисуем линию
    this.ctx.stroke();
  }
}
