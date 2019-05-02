export const log = (label, method = console.log) => 
    args => method(label, args);
