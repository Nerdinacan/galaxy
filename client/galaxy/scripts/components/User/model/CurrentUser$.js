import { pluck, filter, distinctUntilChanged, shareReplay } from "rxjs/operators";
import { Galaxy$ } from "./Galaxy$";

export const CurrentUser$ = Galaxy$.pipe(
    filter(galaxy => 'user' in galaxy),
    pluck('user'),
    shareReplay(1)
)

export const CurrentUserId$ = CurrentUser$.pipe(
    pluck('id'),
    distinctUntilChanged(),
    shareReplay(1)
)
