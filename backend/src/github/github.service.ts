import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GithubService {
  constructor(private readonly httpService: HttpService) {}

  async getRepository(owner: string, repo: string) {
    const url = `https://api.github.com/repos/${owner}/${repo}`;
    const response = await firstValueFrom(this.httpService.get(url));
    return response.data;
  }
}