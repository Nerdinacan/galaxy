<template>
    <nav><slot></slot></nav>
</template>

<style lang="scss" scoped>

nav {
    display: flex;
    justify-content: space-between;
    & > * {
        margin-left: 0.5rem;    
        & :first-child {
            margin-left: 0;
        }
    }
}

</style>