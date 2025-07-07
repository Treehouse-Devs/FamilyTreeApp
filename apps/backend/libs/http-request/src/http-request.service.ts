import { Injectable } from "@nestjs/common";
import axios from "axios";

@Injectable()
export class HttpRequestService {
  async sendPostRequest(url: string, data: any) {
    try {
      const response = await axios.post(url, data, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    } catch (error: unknown) {
      // console.log("error", error);
      throw error.response;
    }
  }
}
