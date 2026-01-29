<script lang="ts">
	import type { ScoreEntry, ExamMode } from '$lib/types.js';
	import { formatTime } from '$lib/quiz.js';
	
	let { 
		initialMode = 'organisationnelle',
		currentUserId = null 
	}: { 
		initialMode?: Exclude<ExamMode, 'custom'>;
		currentUserId?: string | null;
	} = $props();
	
	let activeMode = $state<Exclude<ExamMode, 'custom'>>(initialMode);
	let leaderboard = $state<ScoreEntry[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	
	async function fetchLeaderboard(mode: Exclude<ExamMode, 'custom'>) {
		loading = true;
		error = null;
		try {
			const response = await fetch(`/api/scores?mode=${mode}`);
			if (!response.ok) throw new Error('Failed to fetch leaderboard');
			const data = await response.json();
			leaderboard = data.leaderboard;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Une erreur est survenue';
		} finally {
			loading = false;
		}
	}
	
	function switchMode(mode: Exclude<ExamMode, 'custom'>) {
		activeMode = mode;
		fetchLeaderboard(mode);
	}
	
	// Fetch on mount
	$effect(() => {
		fetchLeaderboard(activeMode);
	});
	
	function getRankEmoji(index: number): string {
		if (index === 0) return '🥇';
		if (index === 1) return '🥈';
		if (index === 2) return '🥉';
		return `${index + 1}`;
	}
	
	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('fr-FR', {
			day: 'numeric',
			month: 'short'
		});
	}
</script>

<div class="bg-white rounded-2xl shadow-xl overflow-hidden">
	<!-- Mode Tabs -->
	<div class="flex border-b border-gray-200">
		<button
			onclick={() => switchMode('organisationnelle')}
			class="flex-1 py-4 px-6 text-center font-medium transition-all duration-200
				{activeMode === 'organisationnelle' 
					? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50' 
					: 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}"
		>
			🏢 TAC1 Organisationnelle
		</button>
		<button
			onclick={() => switchMode('tresorerie')}
			class="flex-1 py-4 px-6 text-center font-medium transition-all duration-200
				{activeMode === 'tresorerie' 
					? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50' 
					: 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}"
		>
			💰 TAC1 Trésorerie
		</button>
	</div>
	
	<!-- Leaderboard Content -->
	<div class="p-6">
		{#if loading}
			<div class="flex justify-center items-center py-12">
				<div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
			</div>
		{:else if error}
			<div class="text-center py-12">
				<p class="text-red-600">{error}</p>
				<button 
					onclick={() => fetchLeaderboard(activeMode)}
					class="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
				>
					Réessayer
				</button>
			</div>
		{:else if leaderboard.length === 0}
			<div class="text-center py-12">
				<p class="text-gray-500 text-lg">🏆 Aucun score pour le moment</p>
				<p class="text-gray-400 mt-2">Soyez le premier à apparaître au classement !</p>
			</div>
		{:else}
			<div class="space-y-3">
				{#each leaderboard as entry, index}
					<div 
						class="flex items-center gap-4 p-4 rounded-xl transition-all duration-200
							{entry.user_id === currentUserId 
								? 'bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200' 
								: 'bg-gray-50 hover:bg-gray-100'}"
					>
						<!-- Rank -->
						<div class="w-10 text-center text-xl font-bold">
							{getRankEmoji(index)}
						</div>
						
						<!-- Avatar -->
						<div class="flex-shrink-0">
							{#if entry.user_image}
								<img 
									src={entry.user_image} 
									alt={entry.user_name} 
									class="w-12 h-12 rounded-full"
								/>
							{:else}
								<div class="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
									{entry.user_name.charAt(0).toUpperCase()}
								</div>
							{/if}
						</div>
						
						<!-- Name & Date -->
						<div class="flex-1 min-w-0">
							<p class="font-semibold text-gray-800 truncate">
								{entry.user_name}
								{#if entry.user_id === currentUserId}
									<span class="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full ml-2">Vous</span>
								{/if}
							</p>
							<p class="text-sm text-gray-500">{formatDate(entry.created_at)}</p>
						</div>
						
						<!-- Score -->
						<div class="text-right">
							<p class="text-2xl font-bold {entry.score >= 80 ? 'text-green-600' : entry.score >= 60 ? 'text-yellow-600' : 'text-red-600'}">
								{entry.score}%
							</p>
							<p class="text-xs text-gray-500">
								{entry.correct_answers}/{entry.total_questions} • {formatTime(entry.time_spent)}
							</p>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
