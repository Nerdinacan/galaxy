import sampleCredentials from "../testdata/listCredentials.json";

export const fakeLoadCredentials = (delay = 2000) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(sampleCredentials);
        }, delay);
    });
};
