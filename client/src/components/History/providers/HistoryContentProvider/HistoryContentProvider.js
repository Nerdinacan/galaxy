import { History, SearchParams } from "../../model";
import { ContentProvider } from "../ContentProvider";
import { buildHistoryContentProviderStreams } from "./streams";
import { distinctUntilChanged } from "rxjs/operators";
import { scrollPosEquals } from "../utils";

export default {
    mixins: [ContentProvider],
    props: {
        disablePoll: { type: Boolean, default: false },
    },
    computed: {
        history() {
            if (this.parent instanceof History) {
                return this.parent;
            }
            return new History(this.parent);
        },
    },
    methods: {
        initStreams() {
            const { disablePoll, debouncePeriod, pageSize } = this;

            // Make observables out of a bunch of properties from the component
            const [rawHistory$, rawParam$, rawScrollPos$] = this.watch$(["history", "params", "scrollPos"]);

            // make sure they don't emit repeated vals
            const history$ = rawHistory$.pipe(distinctUntilChanged(History.equals));
            const params$ = rawParam$.pipe(distinctUntilChanged(SearchParams.equals));
            const scrollPos$ = rawScrollPos$.pipe(distinctUntilChanged(scrollPosEquals));
            const obsArray = [history$, params$, scrollPos$];

            return buildHistoryContentProviderStreams(obsArray, {
                disablePoll,
                debouncePeriod,
                pageSize,
            });
        },
    },
};
