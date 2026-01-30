<script lang="ts">
	import FileQuestionIcon from '@lucide/svelte/icons/file-question';
	import FolderOpenIcon from '@lucide/svelte/icons/folder-open';
	import UsersIcon from '@lucide/svelte/icons/users';
	import TrendingUpIcon from '@lucide/svelte/icons/trending-up';
	import TrendingDownIcon from '@lucide/svelte/icons/trending-down';
	import * as Card from '$lib/components/ui/card';
	import * as Chart from '$lib/components/ui/chart/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Area, AreaChart, ChartClipPath } from 'layerchart';
	import { scaleUtc } from 'd3-scale';
	import { curveNatural } from 'd3-shape';
	import { cubicInOut } from 'svelte/easing';

	let { data } = $props();

	// Time range filter state
	let timeRange = $state('30d');

	const selectedLabel = $derived.by(() => {
		switch (timeRange) {
			case '30d':
				return '30 derniers jours';
			case '14d':
				return '14 derniers jours';
			case '7d':
				return '7 derniers jours';
			default:
				return '30 derniers jours';
		}
	});

	// Prepare participation data with Date objects
	const participationData = $derived(
		data.stats.dailyParticipation
			.map((d) => ({
				date: new Date(d.date),
				count: d.count
			}))
			.filter((item) => {
				const referenceDate = new Date();
				let daysToSubtract = 30;
				if (timeRange === '14d') daysToSubtract = 14;
				else if (timeRange === '7d') daysToSubtract = 7;
				const cutoff = new Date(Date.now() - daysToSubtract * 24 * 60 * 60 * 1000);
				return item.date >= cutoff;
			})
	);

	const participationConfig = {
		count: { label: 'Participations', color: 'hsl(221, 83%, 53%)' }
	} satisfies Chart.ChartConfig;

	// Merge score evolution for chart
	const scoreEvolutionData = $derived.by(() => {
		const dates = new Set(
			[
				...data.stats.avgScoreEvolution.organisationnel.map((d) => d.date),
				...data.stats.avgScoreEvolution.tresorerie.map((d) => d.date)
			].sort()
		);

		const allData = Array.from(dates).map((date) => {
			const orga = data.stats.avgScoreEvolution.organisationnel.find((d) => d.date === date);
			const treso = data.stats.avgScoreEvolution.tresorerie.find((d) => d.date === date);
			return {
				date: new Date(date),
				Organisationnel: orga?.score || 0,
				tresorerie: treso?.score || 0
			};
		});

		// Filter by time range
		const referenceDate = new Date();
		let daysToSubtract = 30;
		if (timeRange === '14d') daysToSubtract = 14;
		else if (timeRange === '7d') daysToSubtract = 7;
		const cutoff = new Date(Date.now() - daysToSubtract * 24 * 60 * 60 * 1000);

		return allData.filter((item) => item.date >= cutoff);
	});

	const evolutionConfig = {
		organisationnel: { label: 'Organisationnel', color: 'hsl(221, 83%, 53%)' },
		tresorerie: { label: 'Trésorerie', color: 'hsl(36, 77%, 49%)' }
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

	<!-- Charts Row -->
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
		<!-- Participation Chart -->
		<Card.Root>
			<Card.Header
				class="flex items-center gap-2 space-y-0 border-b border-gray-100/50 py-5 sm:flex-row"
			>
				<div class="grid flex-1 gap-1 text-center sm:text-start">
					<Card.Title>Participations quotidiennes</Card.Title>
					<Card.Description>Nombre de tests effectués par jour</Card.Description>
				</div>
				<Select.Root type="single" bind:value={timeRange}>
					<Select.Trigger class="w-44 rounded-lg sm:ms-auto bg-white" aria-label="Période">
						{selectedLabel}
					</Select.Trigger>
					<Select.Content class="rounded-xl bg-white">
						<Select.Item value="30d" class="rounded-lg">30 derniers jours</Select.Item>
						<Select.Item value="14d" class="rounded-lg">14 derniers jours</Select.Item>
						<Select.Item value="7d" class="rounded-lg">7 derniers jours</Select.Item>
					</Select.Content>
				</Select.Root>
			</Card.Header>
			<Card.Content>
				<div class="h-[250px] w-full">
					{#if participationData.length > 0}
						<Chart.Container config={participationConfig} class="h-full w-full">
							<AreaChart
								data={participationData}
								x="date"
								xScale={scaleUtc()}
								series={[
									{
										key: 'count',
										label: 'Participations',
										color: participationConfig.count.color
									}
								]}
								props={{
									area: {
										curve: curveNatural,
										'fill-opacity': 0.4,
										line: { class: 'stroke-2' },
										motion: 'tween'
									},
									xAxis: {
										ticks: timeRange === '7d' ? 7 : undefined,
										format: (v) =>
											v.toLocaleDateString('fr-FR', {
												day: 'numeric',
												month: 'short'
											})
									},
									yAxis: { format: (v) => v.toString() }
								}}
							>
								{#snippet marks({ series, getAreaProps })}
									<defs>
										<linearGradient id="fillParticipation" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stop-color="hsl(221, 83%, 53%)" stop-opacity={0.8} />
											<stop offset="95%" stop-color="hsl(221, 83%, 53%)" stop-opacity={0.1} />
										</linearGradient>
									</defs>
									<ChartClipPath
										initialWidth={0}
										motion={{
											width: { type: 'tween', duration: 1000, easing: cubicInOut }
										}}
									>
										{#each series as s, i (s.key)}
											<Area {...getAreaProps(s, i)} fill="url(#fillParticipation)" />
										{/each}
									</ChartClipPath>
								{/snippet}
								{#snippet tooltip()}
									<Chart.Tooltip
										labelFormatter={(v: Date) =>
											v.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
									/>
								{/snippet}
							</AreaChart>
						</Chart.Container>
					{:else}
						<div class="flex h-full items-center justify-center text-gray-400">
							Pas de données suffisantes
						</div>
					{/if}
				</div>
			</Card.Content>
		</Card.Root>

		<!-- Score Evolution Chart -->
		<Card.Root>
			<Card.Header
				class="flex items-center gap-2 space-y-0 border-b border-gray-100/50 py-5 sm:flex-row"
			>
				<div class="grid flex-1 gap-1 text-center sm:text-start">
					<Card.Title>Évolution des scores moyens</Card.Title>
					<Card.Description>Progression par type d'examen</Card.Description>
				</div>
				<Select.Root type="single" bind:value={timeRange}>
					<Select.Trigger class="w-44 rounded-lg sm:ms-auto bg-white" aria-label="Période">
						{selectedLabel}
					</Select.Trigger>
					<Select.Content class="rounded-xl bg-white">
						<Select.Item value="30d" class="rounded-lg">30 derniers jours</Select.Item>
						<Select.Item value="14d" class="rounded-lg">14 derniers jours</Select.Item>
						<Select.Item value="7d" class="rounded-lg">7 derniers jours</Select.Item>
					</Select.Content>
				</Select.Root>
			</Card.Header>
			<Card.Content>
				<div class="h-[250px] w-full">
					{#if scoreEvolutionData.length > 0}
						<Chart.Container config={evolutionConfig} class="h-full w-full">
							<AreaChart
								legend
								data={scoreEvolutionData}
								x="date"
								xScale={scaleUtc()}
								series={[
									{
										key: 'tresorerie',
										label: 'Trésorerie',
										color: evolutionConfig.tresorerie.color
									},
									{
										key: 'Organisationnel',
										label: 'Organisationnel',
										color: evolutionConfig.organisationnel.color
									}
								]}
								seriesLayout="stack"
								props={{
									area: {
										curve: curveNatural,
										'fill-opacity': 0.4,
										line: { class: 'stroke-1' },
										motion: 'tween'
									},
									xAxis: {
										ticks: timeRange === '7d' ? 7 : undefined,
										format: (v) =>
											v.toLocaleDateString('fr-FR', {
												day: 'numeric',
												month: 'short'
											})
									},
									yAxis: { format: (v) => v + '%' }
								}}
							>
								{#snippet marks({ series, getAreaProps })}
									<defs>
										<linearGradient id="fillOrga" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stop-color="hsl(221, 83%, 53%)" stop-opacity={1.0} />
											<stop offset="95%" stop-color="hsl(221, 83%, 53%)" stop-opacity={0.1} />
										</linearGradient>
										<linearGradient id="fillTreso" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stop-color="hsl(36, 77%, 49%)" stop-opacity={0.8} />
											<stop offset="95%" stop-color="hsl(36, 77%, 49%)" stop-opacity={0.1} />
										</linearGradient>
									</defs>
									<ChartClipPath
										initialWidth={0}
										motion={{
											width: { type: 'tween', duration: 1000, easing: cubicInOut }
										}}
									>
										{#each series as s, i (s.key)}
											<Area
												{...getAreaProps(s, i)}
												fill={s.key === 'Organisationnel' ? 'url(#fillOrga)' : 'url(#fillTreso)'}
											/>
										{/each}
									</ChartClipPath>
								{/snippet}
								{#snippet tooltip()}
									<Chart.Tooltip
										labelFormatter={(v: Date) =>
											v.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
										indicator="line"
									/>
								{/snippet}
							</AreaChart>
						</Chart.Container>
					{:else}
						<div class="flex h-full items-center justify-center text-gray-400">
							Pas de données suffisantes
						</div>
					{/if}
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Category Performance -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Performance par catégorie</Card.Title>
			<Card.Description>Taux de réussite global</Card.Description>
		</Card.Header>
		<Card.Content>
			<div class="space-y-4">
				{#each data.stats.categoryPerformance as cat (cat.name)}
					<div class="space-y-1">
						<div class="flex justify-between text-sm">
							<span class="font-medium text-[#122555]">{cat.name}</span>
							<span class="text-gray-500">{cat.successRate}% ({cat.totalQuestions} questions)</span>
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
					{#each data.stats.topQuestions as q, i (q.question)}
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
					{#each data.stats.flopQuestions as q, i (q.question)}
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

<style>
	/* Override layerchart legend circles to rounded squares */
	:global(div.rounded-full[style*='background']) {
		border-radius: 4px !important;
	}
	/* Increase spacing between legend items */
	:global(.flex.gap-x-4) {
		gap: 1.5rem !important;
	}
	:global(.flex.gap-1) {
		gap: 0.5rem !important;
	}
</style>
