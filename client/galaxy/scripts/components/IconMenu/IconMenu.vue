<template>
    <nav><slot></slot></nav>
</template>

<style lang="scss" scoped>

nav {
    display: flex;
    justify-content: space-between;
}

nav.no-border /deep/ .fa.icon-btn {
    background: transparent;
    border: none;
}

</style>
