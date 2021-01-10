import axios from "axios";
import { prependPath } from "utils/redirect";

const api = axios.create({
    baseURL: prependPath("/api"),
});

export const getUploadDatatypes = async () => {
    const url = "/datatypes?extension_only=False";
    const { data = [] } = await api.get(url);

    return data.map((dtype) => {
        const { extension: id, extension: text } = dtype;
        return { ...dtype, id, text };
    });
};

export const getUploadGenomes = async () => {
    const url = "/genomes";
    const { data = [] } = await api.get(url);

    return data.map((d) => {
        const [id, text] = d;
        return { id, text };
    });
};
