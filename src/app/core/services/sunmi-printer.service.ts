import { Injectable } from '@angular/core';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { environment } from '../../../environments/environment';

interface SunmiPrinterPlugin {
  isAvailable(): Promise<{ available: boolean }>;
  connect(): Promise<{ connected: boolean }>;
  printText(options: { text: string }): Promise<{ printed: boolean }>;
}

interface RongtaPrinterPlugin {
  isAvailable(): Promise<{ available: boolean }>;
  listPairedDevices(): Promise<{ devices: unknown }>;
  connect(options?: { address?: string; nameKeywords?: string[] }): Promise<{ connected: boolean }>;
  printText(options: {
    text: string;
    address?: string;
    nameKeywords?: string[];
  }): Promise<{ printed: boolean }>;
}

const SunmiPrinter = registerPlugin<SunmiPrinterPlugin>('SunmiPrinter');
const RongtaPrinter = registerPlugin<RongtaPrinterPlugin>('RongtaPrinter');
const RongtaPrinting = registerPlugin<RongtaPrinterPlugin>('RongtaPrinting');

@Injectable({
  providedIn: 'root'
})
export class SunmiPrinterService {
  private static readonly RONGTA_SELECTED_ADDRESS_KEY = 'pos_rongta_printer_address';
  private static readonly RONGTA_SELECTED_NAME_KEY = 'pos_rongta_printer_name';
  private readonly printerType = environment.printer?.type ?? 'auto';
  private readonly rongtaAddress = environment.printer?.rongtaAddress ?? '';
  private readonly rongtaNameKeywords = environment.printer?.rongtaNameKeywords ?? [
    'RONGTA',
    'RP335',
    'RP80',
    'RP58',
    'RP302',
    'RP'
  ];

  isNativeAndroid(): boolean {
    return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
  }

  getSelectedRongtaAddress(): string {
    return localStorage.getItem(SunmiPrinterService.RONGTA_SELECTED_ADDRESS_KEY)?.trim() ?? '';
  }

  getSelectedRongtaName(): string {
    return localStorage.getItem(SunmiPrinterService.RONGTA_SELECTED_NAME_KEY)?.trim() ?? '';
  }

  setSelectedRongtaPrinter(address: string, name: string): void {
    localStorage.setItem(SunmiPrinterService.RONGTA_SELECTED_ADDRESS_KEY, (address || '').trim());
    localStorage.setItem(SunmiPrinterService.RONGTA_SELECTED_NAME_KEY, (name || '').trim());
  }

  clearSelectedRongtaPrinter(): void {
    localStorage.removeItem(SunmiPrinterService.RONGTA_SELECTED_ADDRESS_KEY);
    localStorage.removeItem(SunmiPrinterService.RONGTA_SELECTED_NAME_KEY);
  }

  async listPairedRongtaDevices(): Promise<Array<{ name: string; address: string }>> {
    if (!this.isNativeAndroid() || !this.isRongtaPluginAvailable()) {
      return [];
    }
    console.log('Platform:', Capacitor.getPlatform());
    try {
      const plugin = this.getRongtaPlugin();
      const result = await plugin.listPairedDevices();
      console.log('Raw result:', result);
      const rawDevices = result?.devices;
      const normalizedDevices = this.normalizeDevices(rawDevices);
      return normalizedDevices
        .filter((d) => !!d.address)
        .sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('List Rongta paired devices failed:', error);
      return [];
    }
  }
  // async listPairedRongtaDevices() {
  //   console.log('Platform:', Capacitor.getPlatform());
  
  //   try {
  //     const result = await RongtaPrinter.listPairedDevices();
  //     console.log('Raw result:', result);
  //     return result?.devices || [];
  //   } catch (e) {
  //     console.error(e);
  //     return [];
  //   }
  // }

  async connectSelectedRongtaPrinter(address?: string): Promise<boolean> {
    if (!this.isNativeAndroid() || !this.isRongtaPluginAvailable()) {
      return false;
    }

    const finalAddress = (address || this.getSelectedRongtaAddress() || this.rongtaAddress || '').trim();
    if (!finalAddress) {
      return false;
    }

    try {
      const plugin = this.getRongtaPlugin();
      const result = await plugin.connect({
        address: finalAddress,
        nameKeywords: this.rongtaNameKeywords
      });
      return !!result?.connected;
    } catch (error) {
      console.error('Rongta connect failed:', error);
      return false;
    }
  }

  async printText(text: string): Promise<boolean> {
    if (!this.isNativeAndroid() || !text.trim()) {
      return false;
    }

    if ((this.printerType === 'rongta' || this.printerType === 'auto') && this.isRongtaPluginAvailable()) {
      const printedByRongta = await this.printWithRongta(text);
      if (printedByRongta) {
        return true;
      }
    }

    if ((this.printerType === 'sunmi' || this.printerType === 'auto') && this.isSunmiPluginAvailable()) {
      const printedBySunmi = await this.printWithSunmi(text);
      if (printedBySunmi) {
        return true;
      }
    }

    return false;
  }

  private isRongtaPluginAvailable(): boolean {
    return Capacitor.isPluginAvailable('RongtaPrinter') || Capacitor.isPluginAvailable('RongtaPrinting');
  }

  private isSunmiPluginAvailable(): boolean {
    return Capacitor.isPluginAvailable('SunmiPrinter');
  }

  private normalizeDevices(input: unknown): Array<{ name: string; address: string }> {
    const rawList = Array.isArray(input)
      ? input
      : (input && typeof input === 'object' ? Object.values(input as Record<string, unknown>) : []);

    return rawList
      .map((item) => {
        const obj = item as { name?: unknown; address?: unknown; macAddress?: unknown };
        const address = String(obj?.address ?? obj?.macAddress ?? '').trim();
        const name = String(obj?.name ?? 'Unknown Device').trim() || 'Unknown Device';
        return { name, address };
      })
      .filter((item) => !!item.address);
  }

  private async printWithSunmi(text: string): Promise<boolean> {
    try {
      await SunmiPrinter.connect();
      await SunmiPrinter.printText({ text });
      return true;
    } catch (error) {
      console.error('Sunmi print failed:', error);
      return false;
    }
  }

  private async printWithRongta(text: string): Promise<boolean> {
    try {
      const selectedAddress = this.getSelectedRongtaAddress();
      const finalAddress = selectedAddress || this.rongtaAddress || undefined;
      const plugin = this.getRongtaPlugin();
      await plugin.connect({
        address: finalAddress,
        nameKeywords: this.rongtaNameKeywords
      });
      await plugin.printText({
        text,
        address: finalAddress,
        nameKeywords: this.rongtaNameKeywords
      });
      return true;
    } catch (error) {
      console.error('Rongta print failed:', error);
      return false;
    }
  }

  private getRongtaPlugin(): RongtaPrinterPlugin {
    if (Capacitor.isPluginAvailable('RongtaPrinter')) {
      return RongtaPrinter;
    }
    if (Capacitor.isPluginAvailable('RongtaPrinting')) {
      return RongtaPrinting;
    }
    throw new Error('Rongta plugin is not available on this device');
  }
}
