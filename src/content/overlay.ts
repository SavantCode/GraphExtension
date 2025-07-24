// Content script for chart selection overlay
// Add at the very top
import type html2canvas from 'html2canvas';

interface SelectionBox {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

class ChartSelector {
  private overlay: HTMLDivElement | null = null;
  private selectionBox: HTMLDivElement | null = null;
  private isSelecting: boolean = false;
  private startPos: { x: number; y: number } = { x: 0, y: 0 };

  // Bound event handlers
  private handleMouseMoveBound = this.handleMouseMove.bind(this);
  private handleMouseUpBound = this.handleMouseUp.bind(this);
  private handleKeyDownBound = this.handleKeyDown.bind(this);
  private handleMouseDownBound = this.handleMouseDown.bind(this);

  constructor() {
    this.init();
  }

  private init(): void {
    this.createOverlay();
    this.addEventListeners();
    this.showInstructions();
  }

  private createOverlay(): void {
    this.cleanup();

    this.overlay = document.createElement('div');
    this.overlay.id = 'trendlens-overlay';
    this.overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.1);
      z-index: 999999;
      cursor: crosshair;
      user-select: none;
    `;

    document.body.appendChild(this.overlay);
  }

  private showInstructions(): void {
    const instructions = document.createElement('div');
    instructions.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #3b82f6, #14b8a6);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1000000;
      animation: slideDown 0.3s ease-out;
    `;
    instructions.innerHTML = `
      <div style="text-align: center;">
        📊 Drag to select a chart area • Press ESC to cancel
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideDown {
        from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
        to { transform: translateX(-50%) translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(instructions);

    setTimeout(() => {
      if (instructions.parentNode) {
        instructions.style.animation = 'slideDown 0.3s ease-out reverse';
        setTimeout(() => instructions.remove(), 300);
      }
    }, 3000);
  }

  private addEventListeners(): void {
    if (!this.overlay) return;
    this.overlay.addEventListener('mousedown', this.handleMouseDownBound);
    document.addEventListener('mousemove', this.handleMouseMoveBound);
    document.addEventListener('mouseup', this.handleMouseUpBound);
    document.addEventListener('keydown', this.handleKeyDownBound);
  }

  private handleMouseDown(event: MouseEvent): void {
    event.preventDefault();
    this.isSelecting = true;
    this.startPos = { x: event.clientX, y: event.clientY };
    this.createSelectionBox();
  }

  private createSelectionBox(): void {
    if (this.selectionBox) this.selectionBox.remove();

    this.selectionBox = document.createElement('div');
    this.selectionBox.style.cssText = `
      position: fixed;
      border: 2px dashed #3b82f6;
      background: rgba(59, 130, 246, 0.1);
      pointer-events: none;
      z-index: 1000000;
      border-radius: 4px;
    `;
    document.body.appendChild(this.selectionBox);
  }

  private handleMouseMove(event: MouseEvent): void {
    if (!this.isSelecting || !this.selectionBox) return;

    const currentX = event.clientX;
    const currentY = event.clientY;

    const left = Math.min(this.startPos.x, currentX);
    const top = Math.min(this.startPos.y, currentY);
    const width = Math.abs(currentX - this.startPos.x);
    const height = Math.abs(currentY - this.startPos.y);

    this.selectionBox.style.left = `${left}px`;
    this.selectionBox.style.top = `${top}px`;
    this.selectionBox.style.width = `${width}px`;
    this.selectionBox.style.height = `${height}px`;
  }

  private async handleMouseUp(event: MouseEvent): Promise<void> {
    if (!this.isSelecting) return;
    this.isSelecting = false;

    const selection: SelectionBox = {
      startX: Math.min(this.startPos.x, event.clientX),
      startY: Math.min(this.startPos.y, event.clientY),
      endX: Math.max(this.startPos.x, event.clientX),
      endY: Math.max(this.startPos.y, event.clientY),
    };

    const width = selection.endX - selection.startX;
    const height = selection.endY - selection.startY;

    if (width < 50 || height < 50) {
      this.showMessage('Selection too small. Please select a larger area.', 'warning');
      this.resetSelection();
      return;
    }

    await this.captureAndAnalyze(selection);
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.cleanup();
    }
  }

  private async captureAndAnalyze(selection: SelectionBox): Promise<void> {
    this.showMessage('Capturing chart...', 'info');

    try {
      await this.loadHtml2Canvas();
      const canvas = await this.captureArea(selection);
      const blob = await this.canvasToBlob(canvas);

      this.showMessage('Analyzing chart with AI...', 'info');
      const analysisResult = await this.sendForAnalysis(blob);
      this.displayResults(analysisResult, selection);
    } catch (error) {
      console.error('Analysis failed:', error);
      this.showMessage('Analysis failed. Please try again.', 'error');
    } finally {
      this.cleanup();
    }
  }

  private async loadHtml2Canvas(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.html2canvas) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = chrome.runtime.getURL('lib/html2canvas.min.js');
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load html2canvas'));
      document.head.appendChild(script);
    });
  }

  private async captureArea(selection: SelectionBox): Promise<HTMLCanvasElement> {
    const canvasElements = document.querySelectorAll('canvas');
    let targetCanvas: HTMLCanvasElement | null = null;

    for (const canvas of canvasElements) {
      const rect = canvas.getBoundingClientRect();
      if (
        rect.left < selection.endX &&
        rect.right > selection.startX &&
        rect.top < selection.endY &&
        rect.bottom > selection.startY
      ) {
        targetCanvas = canvas;
        break;
      }
    }

    if (targetCanvas) {
      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');

      const width = selection.endX - selection.startX;
      const height = selection.endY - selection.startY;

      tempCanvas.width = width;
      tempCanvas.height = height;

      const rect = targetCanvas.getBoundingClientRect();
      const offsetX = selection.startX - rect.left;
      const offsetY = selection.startY - rect.top;

      ctx.drawImage(targetCanvas, offsetX, offsetY, width, height, 0, 0, width, height);
      return tempCanvas;
    } else {
      return await window.html2canvas(document.body, {
        x: selection.startX,
        y: selection.startY,
        width: selection.endX - selection.startX,
        height: selection.endY - selection.startY,
        useCORS: true,
        allowTaint: true,
      });
    }
  }

  private async canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), 'image/png', 0.9);
    });
  }

  private async sendForAnalysis(imageBlob: Blob): Promise<any> {
    const formData = new FormData();
    formData.append('image', imageBlob, 'chart.png');

    const response = await fetch('http://localhost:5000/api/analyze-chart', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw new Error(`Analysis failed: ${response.statusText}`);
    return await response.json();
  }

  private displayResults(analysis: any, selection: SelectionBox): void {
    const resultWindow = document.createElement('div');
    resultWindow.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 480px;
      max-height: 600px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
      z-index: 1000001;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      animation: slideIn 0.3s ease-out;
    `;

    resultWindow.innerHTML = `
      <div style="background: linear-gradient(135deg, #3b82f6, #14b8a6); color: white; padding: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0; font-size: 18px; font-weight: 600;">📊 Chart Analysis Results</h3>
          <button id="close-results" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 24px; height: 24px; border-radius: 50%; cursor: pointer; font-size: 16px;">×</button>
        </div>
      </div>
      <div style="padding: 20px; max-height: 500px; overflow-y: auto;">
        <div style="margin-bottom: 16px;">
          <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 14px; font-weight: 600;">Chart Type</h4>
          <p style="margin: 0; color: #6b7280; font-size: 14px;">${analysis.chartType || 'Unknown'}</p>
        </div>
        <div style="margin-bottom: 16px;">
          <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 14px; font-weight: 600;">Key Insights</h4>
          <div style="background: #f3f4f6; padding: 12px; border-radius: 8px;">
            <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.5;">${analysis.insights || 'Analysis completed successfully.'}</p>
          </div>
        </div>
        <div style="margin-bottom: 16px;">
          <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 14px; font-weight: 600;">Detected Patterns</h4>
          <div style="background: #ecfdf5; padding: 12px; border-radius: 8px; border-left: 4px solid #10b981;">
            <p style="margin: 0; color: #065f46; font-size: 14px; line-height: 1.5;">${analysis.patterns || 'No specific patterns detected.'}</p>
          </div>
        </div>
        <div>
          <h4 style="margin: 0 0 8px 0; color: #374151; font-size: 14px; font-weight: 600;">Summary</h4>
          <div style="background: #eff6ff; padding: 12px; border-radius: 8px; border-left: 4px solid #3b82f6;">
            <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.5;">${analysis.summary || 'Chart analysis completed.'}</p>
          </div>
        </div>
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translate(-50%, -50%) scale(0.9); opacity: 0; }
        to { transform: translate(-50%, -50%) scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(resultWindow);

    const closeBtn = resultWindow.querySelector('#close-results');
    closeBtn?.addEventListener('click', () => {
      resultWindow.style.animation = 'slideIn 0.3s ease-out reverse';
      setTimeout(() => resultWindow.remove(), 300);
    });

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!resultWindow.contains(event.target as Node)) {
        resultWindow.remove();
        document.removeEventListener('click', closeOnOutsideClick);
      }
    };
    setTimeout(() => document.addEventListener('click', closeOnOutsideClick), 300);
  }

  private showMessage(text: string, type: 'info' | 'warning' | 'error'): void {
    const colors = {
      info: '#3b82f6',
      warning: '#f59e0b',
      error: '#ef4444',
    };

    const message = document.createElement('div');
    message.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type]};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      z-index: 1000002;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideInRight 0.3s ease-out;
    `;
    message.textContent = text;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    if (!document.head.querySelector('style[data-animations]')) {
      style.setAttribute('data-animations', 'true');
      document.head.appendChild(style);
    }

    document.body.appendChild(message);

    setTimeout(() => {
      if (message.parentNode) {
        message.style.animation = 'slideInRight 0.3s ease-out reverse';
        setTimeout(() => message.remove(), 300);
      }
    }, 3000);
  }

  private resetSelection(): void {
    if (this.selectionBox) {
      this.selectionBox.remove();
      this.selectionBox = null;
    }
    this.isSelecting = false;
  }

  private cleanup(): void {
    if (this.overlay) {
      this.overlay.removeEventListener('mousedown', this.handleMouseDownBound);
      this.overlay.remove();
      this.overlay = null;
    }

    if (this.selectionBox) {
      this.selectionBox.remove();
      this.selectionBox = null;
    }

    document.removeEventListener('mousemove', this.handleMouseMoveBound);
    document.removeEventListener('mouseup', this.handleMouseUpBound);
    document.removeEventListener('keydown', this.handleKeyDownBound);
  }
}

// Type declarations for external libraries
declare global {
  interface Window {
    html2canvas: any;
  }
}

// Initialize the chart selector
new ChartSelector();
