<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { timeRemaining, totalTime, isQuizActive } from '$lib/stores.js';
	import { formatTime } from '$lib/quiz.js';

	let { onTimeUp } = $props<{ onTimeUp: () => void }>();
	
	let interval: number;
	let currentTime = $state(0); // Will be set by timeRemaining store

	$effect(() => {
		currentTime = $timeRemaining;
	});

	onMount(() => {
		interval = setInterval(() => {
			if ($isQuizActive && currentTime > 0) {
				currentTime--;
				timeRemaining.set(currentTime);
				
				if (currentTime === 0) {
					onTimeUp();
				}
			}
		}, 1000);
	});

	onDestroy(() => {
		if (interval) {
			clearInterval(interval);
		}
	});

	const timeColor = $derived(currentTime <= 300 ? 'text-red-600' : currentTime <= 900 ? 'text-yellow-600' : 'text-green-600');
	const progressWidth = $derived($totalTime > 0 ? (currentTime / $totalTime) * 100 : 0);
	const isWarning = $derived(currentTime <= 300); // Last 5 minutes
</script>

<div class="bg-white rounded-xl shadow-lg p-4">
	<div class="flex items-center justify-between mb-3">
		<h3 class="text-lg font-semibold text-gray-700">Temps restant</h3>
		<div class="{timeColor} text-2xl font-mono font-bold {isWarning ? 'animate-pulse' : ''}">
			{formatTime(currentTime)}
		</div>
	</div>
	
	<div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
		<div 
			class="h-full transition-all duration-1000 ease-linear {currentTime <= 300 ? 'bg-red-500' : currentTime <= 900 ? 'bg-yellow-500' : 'bg-green-500'}"
			style="width: {progressWidth}%"
		></div>
	</div>
	
	{#if currentTime <= 300}
		<p class="text-red-600 text-sm font-medium mt-2 animate-pulse">
			⚠️ Attention : Plus que 5 minutes !
		</p>
	{:else if currentTime <= 900}
		<p class="text-yellow-600 text-sm font-medium mt-2">
			⏰ Plus que 15 minutes
		</p>
	{/if}
</div>