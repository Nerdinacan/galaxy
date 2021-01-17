import axios from "axios";
import { prependPath } from "utils/redirect";

const api = axios.create({
    baseURL: prependPath("/api"),
});

export const getUploadDatatypes = async () => {
    const response = await api.get("/datatypes?extension_only=False");
    const { data = [] } = response;

    return data.map((opt) => ({
        id: opt.extension,
        text: opt.extension,
        ...opt,
    }));
};

export const getUploadGenomes = async () => {
    const response = await api.get("/genomes");
    const { data = [] } = response;

    return data.map(([description, id]) => ({
        id,
        text: id,
        description,
    }));
};
