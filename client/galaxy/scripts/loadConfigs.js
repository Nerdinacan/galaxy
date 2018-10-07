// Placeholder for loadConfigs from my branch
export function getAppRoot() {
    try {
        return window.top.Galaxy.root;
    } catch (err) {
        return "";
    }
}
