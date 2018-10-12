import { map } from "rxjs/operators";
import { doMeSomeAjax } from "./ajax";
import { setAuthToken } from "./authToken";
import { b64EncodeUnicode } from "./b64";

// try to login, store returned token in the subject
// curl --user email:password http://localhost:8080/api/authenticate/baseauth

export function getApiKey(username, password) {
    let Authorization = b64EncodeUnicode(`${username}:${password}`);

    let request = {
        url: "authenticate/baseauth",
        headers: { Authorization }
    };

    return doMeSomeAjax(request).pipe(map(rsp => setAuthToken(rsp.api_key)));
}
