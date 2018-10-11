<template>
    <div>
        <form>
            <h2>{{ username }}:{{ password }}</h2>
            <input v-model="username" /><br/>
            <input v-model="password" /><br/>
            <input @click.prevent="login" type="submit" value="Log In" />
        </form>
    </div>
</template>

<script src="./Login.js"></script>
