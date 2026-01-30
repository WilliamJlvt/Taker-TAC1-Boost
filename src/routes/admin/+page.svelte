<script lang="ts">
	import FileQuestionIcon from '@lucide/svelte/icons/file-question';
	import FolderOpenIcon from '@lucide/svelte/icons/folder-open';
	import UsersIcon from '@lucide/svelte/icons/users';
	import TrendingUpIcon from '@lucide/svelte/icons/trending-up';
	import TrendingDownIcon from '@lucide/svelte/icons/trending-down';
	import * as Card from '$lib/components/ui/card';
	import { LineChart, BarChart } from 'layerchart';
	import { scaleUtc, scaleBand } from 'd3-scale';
	import { curveNatural } from 'd3-shape';
	import * as Chart from '$lib/components/ui/chart/index.js';

	let { data } = $props();

	// Prepare chart data
	// Use string dates for discrete bar chart x-axis
	const participationData = data.stats.dailyParticipation.map((d) => ({
		date: d.date, // keep original string "YYYY-MM-DD" for uniqueness
		label: new Date(d.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
		count: d.count
	}));

	const participationConfig = {
		count: { label: 'Participations', color: '#2563eb' } // Use explicit hex
	} satisfies Chart.ChartConfig;

	// Merge score evolution for chart
	const scoreEvolutionData = (() => {
		const dates = new Set(
			[
				...data.stats.avgScoreEvolution.organisationnelle.map((d) => d.date),
				...data.stats.avgScoreEvolution.tresorerie.map((d) => d.date)
			].sort()
		);

		return Array.from(dates).map((date) => {
			const orga = data.stats.avgScoreEvolution.organisationnelle.find((d) => d.date === date);
			const treso = data.stats.avgScoreEvolution.tresorerie.find((d) => d.date === date);
			return {
				date: new Date(date),
				organisationnelle: orga?.score || null,
				tresorerie: treso?.score || null
			};
		});
	})();

	const evolutionConfig = {
		organisationnelle: { label: 'Organisationnelle', color: '#2563eb' },
		tresorerie: { label: 'Trésorerie', color: '#d97706' }
	} satisfies Chart.ChartConfig;
</script>

<div class="space-y-6 mt-8">
	<div class="flex items-center justify-between">
		<h2 class="text-2xl font-bold text-[#122555]">Tableau de bord</h2>
	</div>

	<!-- Summary Cards -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
		<a
			href="/admin/questions"
			class="bg-white p-6 rounded-2xl border border-gray-100/50 shadow-sm flex items-center gap-4 hover:shadow-md transition-all group"
		>
			<div
				class="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors"
			>
				<FileQuestionIcon class="w-8 h-8" />
			</div>
			<div>
				<p class="text-sm text-gray-500 font-medium">Total Questions</p>
				<p class="text-2xl font-bold text-[#122555]">{data.stats.questions}</p>
			</div>
		</a>

		<div
			class="bg-white p-6 rounded-2xl border border-gray-100/50 shadow-sm flex items-center gap-4"
		>
			<div class="p-3 bg-amber-50 text-amber-600 rounded-lg">
				<FolderOpenIcon class="w-8 h-8" />
			</div>
			<div>
				<p class="text-sm text-gray-500 font-medium">Catégories</p>
				<!-- Calculated from length of categoryPerformance array as we stopped passing it explicitly -->
				<p class="text-2xl font-bold text-[#122555]">{data.stats.categoryPerformance.length}</p>
			</div>
		</div>

		<div
			class="bg-white p-6 rounded-2xl border border-gray-100/50 shadow-sm flex items-center gap-4"
		>
			<div class="p-3 bg-cyan-50 text-cyan-600 rounded-lg">
				<UsersIcon class="w-8 h-8" />
			</div>
			<div>
				<p class="text-sm text-gray-500 font-medium">Utilisateurs</p>
				<p class="text-2xl font-bold text-[#122555]">{data.stats.users}</p>
			</div>
		</div>
	</div>

	<!-- Charts Row 1 -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<!-- Daily Participation -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Participations (30 jours)</Card.Title>
				<Card.Description>Nombre de tests effectués par jour</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="h-[300px] w-full">
					{#if participationData.length > 0}
						<Chart.Container config={participationConfig} class="h-full w-full">
							<BarChart
								data={participationData}
								x="date"
								y="count"
								xScale={scaleBand().padding(0.4)}
								series={[
									{
										key: 'count',
										label: 'Participations',
										color: participationConfig.count.color
									}
								]}
								props={{
									bars: { rx: 4, ry: 4 },
									xAxis: {
										format: (d: string) => {
											const item = participationData.find((p) => p.date === d);
											return item ? item.label : d;
										}
									}
								}}
							>
								{#snippet tooltip()}
									<Chart.Tooltip
										labelFormatter={(v: string) => {
											const item = participationData.find((p) => p.date === v);
											return item ? item.label : v;
										}}
									/>
								{/snippet}
							</BarChart>
						</Chart.Container>
					{:else}
						<div class="flex h-full items-center justify-center text-gray-400">
							Pas de données suffisantes
						</div>
					{/if}
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Category Performance -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Performance par catégorie</Card.Title>
				<Card.Description>Taux de réussite global</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="space-y-4">
					{#each data.stats.categoryPerformance as cat}
						<div class="space-y-1">
							<div class="flex justify-between text-sm">
								<span class="font-medium text-[#122555]">{cat.name}</span>
								<span class="text-gray-500"
									>{cat.successRate}% ({cat.totalQuestions} questions)</span
								>
							</div>
							<div class="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
								<div
									class="h-full rounded-full {cat.successRate >= 70
										? 'bg-green-500'
										: cat.successRate >= 40
											? 'bg-yellow-500'
											: 'bg-red-500'}"
									style="width: {cat.successRate}%"
								></div>
							</div>
						</div>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Charts Row 2: Score Evolution -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Évolution des scores moyens</Card.Title>
			<Card.Description>Progression sur les 30 derniers jours</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="h-[300px] w-full">
				{#if scoreEvolutionData.length > 0}
					<Chart.Container config={evolutionConfig} class="h-full w-full">
						<LineChart
							data={scoreEvolutionData}
							x="date"
							xScale={scaleUtc()}
							series={[
								{
									key: 'organisationnelle',
									label: 'Organisationnelle',
									color: evolutionConfig.organisationnelle.color
								},
								{
									key: 'tresorerie',
									label: 'Trésorerie',
									color: evolutionConfig.tresorerie.color
								}
							]}
							props={{
								spline: { curve: curveNatural, motion: 'tween', strokeWidth: 2 },
								xAxis: {
									format: (v) => v.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
								}
							}}
						>
							{#snippet tooltip()}
								<Chart.Tooltip
									labelFormatter={(v: Date) =>
										v.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
								/>
							{/snippet}
						</LineChart>
					</Chart.Container>
				{:else}
					<div class="flex h-full items-center justify-center text-gray-400">
						Pas de données suffisantes
					</div>
				{/if}
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Top/Flop Questions -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<!-- Top Questions -->
		<Card.Root class="border-green-100 bg-green-50/10">
			<Card.Header>
				<div class="flex items-center gap-2">
					<TrendingUpIcon class="w-5 h-5 text-green-600" />
					<Card.Title class="text-green-800">Top 3 Questions Réussies</Card.Title>
				</div>
			</Card.Header>
			<Card.Content>
				<div class="space-y-4">
					{#each data.stats.topQuestions as q, i}
						<div
							class="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-100 shadow-sm"
						>
							<span
								class="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold"
							>
								{i + 1}
							</span>
							<div class="flex-1 min-w-0">
								<p class="text-sm font-medium text-gray-900 line-clamp-2">{q.question}</p>
								<p class="text-xs text-green-600 mt-1">
									{q.successRate}% réussite ({q.count} essais)
								</p>
							</div>
						</div>
					{/each}
					{#if data.stats.topQuestions.length === 0}
						<p class="text-sm text-gray-500 italic">Pas assez de données</p>
					{/if}
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Flop Questions -->
		<Card.Root class="border-red-100 bg-red-50/10">
			<Card.Header>
				<div class="flex items-center gap-2">
					<TrendingDownIcon class="w-5 h-5 text-red-600" />
					<Card.Title class="text-red-800">Top 3 Questions Échouées</Card.Title>
				</div>
			</Card.Header>
			<Card.Content>
				<div class="space-y-4">
					{#each data.stats.flopQuestions as q, i}
						<div
							class="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-100 shadow-sm"
						>
							<span
								class="flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-700 text-xs font-bold"
							>
								{i + 1}
							</span>
							<div class="flex-1 min-w-0">
								<p class="text-sm font-medium text-gray-900 line-clamp-2">{q.question}</p>
								<p class="text-xs text-red-600 mt-1">
									{q.successRate}% réussite ({q.count} essais)
								</p>
							</div>
						</div>
					{/each}
					{#if data.stats.flopQuestions.length === 0}
						<p class="text-sm text-gray-500 italic">Pas assez de données</p>
					{/if}
				</div>
			</Card.Content>
		</Card.Root>
	</div>
</div>
