/**
 * Split array result, emit individual items
 */

import { from } from "rxjs";
import { mergeMap } from "rxjs/operators";

export const split = () => mergeMap(from);
