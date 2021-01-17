import deepFreeze from "deep-freeze";

const INIT = {
    id: Symbol("init"),
    label: "init",
    variant: "secondary",
};

const RUNNING = {
    id: Symbol("running"),
    label: "running",
    variant: "primary",
};

const PAUSED = {
    id: Symbol("paused"),
    label: "paused",
    variant: "warning",
};

const COMPLETE = {
    id: Symbol("ok"),
    label: "ok",
    variant: "success",
};

const ERROR = {
    id: Symbol("error"),
    label: "error",
    variant: "danger",
};

export default deepFreeze({
    INIT,
    RUNNING,
    PAUSED,
    COMPLETE,
    ERROR,
});
