import {
  Body,
  Controller,
  Get,
  HttpStatus,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { info } from 'console';
import { AppService } from './app.service';
import { PrintDTO } from './printDTO';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getHello() {
    return this.appService.getHello();
  }

  /* simply uploading */
  // @Post('upload')
  // @UseInterceptors(FileInterceptor('file'))
  // async uploadFile(@UploadedFile() file: Express.Multer.File) {
  //   info(file);
  //   return { ok: true };
  // }

  /* listing connected printers */
  @Get('printers')
  async getPinters() {
    return await this.appService.getPrinters();
  }

  /* upload pdf file to server, then print */
  @Post('print')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFileAndPassValidator(
    @Body() body: PrintDTO,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({ fileType: 'pdf' })
        .addMaxSizeValidator({ maxSize: 500000 })
        .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
    )
    file: Express.Multer.File,
  ) {
    /* we got uploaded file, print it now */
    info({ body, file });
    return await this.appService.printFile(file.path, body.printer);
  }
}
