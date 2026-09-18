import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AxiosError } from 'axios';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any = 'Erro interno no servidor.';

    if (exception?.isAxiosError || exception instanceof AxiosError) {
      const axiosError = exception as AxiosError<any>;
      const axiosStatus = axiosError.response?.status;
      const axiosData = axiosError.response?.data;
      const remainingRequests = axiosError.response?.headers?.['x-ratelimit-remaining']; 
      if (
        (axiosStatus === 403 || axiosStatus === 429) &&
        (remainingRequests === '0' ||
          JSON.stringify(axiosData).toLowerCase().includes('rate limit'))
      ) {
        status = HttpStatus.TOO_MANY_REQUESTS;
        message =
          'O limite de requisições da API do GitHub foi excedido. Tente novamente mais tarde.';
      } else if (axiosStatus === 404) {
        status = HttpStatus.NOT_FOUND;
        message = 'Repositório não encontrado no GitHub.';
      } else {
        status = axiosStatus || HttpStatus.BAD_GATEWAY;
        message = axiosData?.message || 'Erro de comunicação com serviço externo.';
      }

      this.logger.error(`[GitHub API Error] Status: ${status} - URL: ${request.url}`);
    } 
    else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === 'object' && (res as any).message ? (res as any).message : res;
    } 
    else {
      this.logger.error(exception);
      if (exception?.message) {
        message = exception.message;
      }
    }
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    });
  }
}