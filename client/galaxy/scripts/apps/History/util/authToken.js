// NOTE: unused here

import { BehaviorSubject } from "rxjs";

// stores current auth token
// TODO: retrieve value from localstorage, if any

export const authToken$ = new BehaviorSubject(null);

export function setAuthToken(token) {
    console.log("setAuthToken", token);
    authToken$.next(token);
}
