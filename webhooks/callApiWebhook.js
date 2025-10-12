import axios from "axios";
import { getAPIServerUrl } from "../utils/configuration.js";

export async function errorHandler(status, errorMessage, message, isRetry=false) {
    const payload = {
	  "ARCHIVE_KEY": "streamchat",
	  "type":        "error",
	  "stream":      errorMessage,
	  "status":      status,
	  "error":       message,
    "isRetry":     isRetry
	}
    let response;
    let url = `${getAPIServerUrl()}/api/webhook/error`
    try {
      response = await axios.post(url, payload)
    } catch(err) {
      console.log(err)
      return {'status': 'failed'}
    }
    return {'status':'finished'}
}
