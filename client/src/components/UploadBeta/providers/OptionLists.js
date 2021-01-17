/**
 * Loaded genome options
 */

import { getUploadDatatypes, getUploadGenomes } from "./queries";
import { SingleQueryProvider } from "../../providers/SingleQueryProvider";

export const GenomeProvider = SingleQueryProvider({
    resultName: "genomes",
    lookup: getUploadGenomes,
});

export const ExtensionProvider = SingleQueryProvider({
    resultName: "extensions",
    lookup: getUploadDatatypes,
});
