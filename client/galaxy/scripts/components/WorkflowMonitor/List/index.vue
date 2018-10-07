<template>
    <div>
        <h2>Stuff goes here</h2>
        <h3>workflow_id: {{ workflow_id }}</h3>
        <ol>
            <li :key="i.id" v-for="i in invocations">
                <monitor 
                    :invocation_id="i.id" 
                    :workflow_id="i.workflow_id"
                />
            </li>
        </ol>
    </div>
</template>

<script src="./monitorList.js"></script>
