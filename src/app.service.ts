import { Injectable } from '@nestjs/common';
import { getDefaultPrinter, getPrinters, print } from 'unix-print';
import { Printer } from 'unix-print/build/types';

@Injectable()
export class AppService {
  async getHello(): Promise<Printer[]> {
    const printers = await getPrinters();
    // console.info(printers);
    return printers;
  }

  async getPrinters(): Promise<Printer[]> {
    const printers = await getPrinters();
    return printers;
  }

  async getDefaultPrinter(): Promise<Printer> {
    return getDefaultPrinter();
  }

  async printFile(filePath: string, printer: string) {
    return print(filePath, printer);
  }
}
