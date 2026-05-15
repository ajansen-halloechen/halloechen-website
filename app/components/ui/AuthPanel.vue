<template>
    <div class="w-full grow flex items-center justify-center">
        <div class="w-full max-w-sm flex flex-col gap-4 bg-surface p-8 mx-2 border border-accent border-3 rounded-md">
            <h1 class="text-2xl font-bold text-center">
                <slot name="heading" />
            </h1>
            <slot />
        </div>
    </div>
</template>
