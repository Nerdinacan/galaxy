<template>
    <section>
        <div>
            <h2>Histories</h2>
            <button @click.prevent="loadHistories">Load Histories</button>
            <pre>{{histories}}</pre>
        </div>
        <div>
            <h2>Load Details</h2>
            <input v-model="selectedHistoryId" />
            <button @click.prevent="selectHistory(selectedHistoryId)">Select History</button>
            <pre>{{currentHistory}}</pre>
        </div>
    </section>
</template>

<script src="./History.js"></script>
