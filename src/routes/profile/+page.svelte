<script lang="ts">
	import { formatTime } from '$lib/quiz.js';
	import type { UserStats } from '$lib/server/db';
	import logo from '$lib/assets/logo.svg';
	import BuildingIcon from '@lucide/svelte/icons/building-2';
	import WalletIcon from '@lucide/svelte/icons/wallet';
	import BarChartIcon from '@lucide/svelte/icons/bar-chart-3';
	import TrendingUpIcon from '@lucide/svelte/icons/trending-up';
	import ClipboardListIcon from '@lucide/svelte/icons/clipboard-list';

	let { data } = $props();
	const stats: UserStats = data.stats;
	const session = data.session;

	// Chart configuration
	const chartWidth = 400;
	const chartHeight = 200;
	const padding = { top: 20, right: 20, bottom: 40, left: 45 };
	const innerWidth = chartWidth - padding.left - padding.right;
	const innerHeight = chartHeight - padding.top - padding.bottom;

	// Prepare chart data
	const chartDataOrga = stats.progression.organisationnelle.map((p, i) => ({
		date: new Date(p.date),
		score: p.score,
		index: i
	}));

	const chartDataTreso = stats.progression.tresorerie.map((p, i) => ({
		date: new Date(p.date),
		score: p.score,
		index: i
	}));

	// Scale functions
	function scaleX(index: number, total: number): number {
		if (total <= 1) return padding.left + innerWidth / 2;
		return padding.left + (index / (total - 1)) * innerWidth;
	}

	function scaleY(score: number): number {
		return padding.top + innerHeight - (score / 100) * innerHeight;
	}

	// Generate path for line chart
	function generatePath(data: { index: number; score: number }[], total: number): string {
		if (data.length === 0) return '';
		const points = data.map((d) => `${scaleX(d.index, total)},${scaleY(d.score)}`);
		return `M ${points.join(' L ')}`;
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString('fr-FR', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	function formatShortDate(date: Date): string {
		return date.toLocaleDateString('fr-FR', {
			day: 'numeric',
			month: 'short'
		});
	}

	function getScoreColor(score: number): string {
		if (score >= 80) return 'text-green-600';
		if (score >= 60) return 'text-yellow-600';
		return 'text-red-600';
	}

	function getScoreBgColor(score: number): string {
		if (score >= 80) return 'bg-green-100 border-green-200';
		if (score >= 60) return 'bg-yellow-100 border-yellow-200';
		return 'bg-red-100 border-red-200';
	}
</script>

<svelte:head>
	<title>Mon Profil - TAC1 Boost</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-white via-slate-50 to-[#122555]/5">
	<div class="container mx-auto px-4 py-8 max-w-6xl">
		<!-- Header -->
		<header class="flex justify-between items-center mb-8">
			<a href="/" class="flex items-center gap-3">
				<img src={logo} alt="TAC1 Boost" class="h-10 w-auto" />
			</a>
			<a
				href="/"
				class="flex items-center gap-2 text-[#122555]/70 hover:text-[#122555] transition-colors"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M15 19l-7-7 7-7"
					/>
				</svg>
				Retour
			</a>
		</header>

		<!-- User Info -->
		<div class="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-[#122555]/10">
			<div class="flex items-center gap-4">
				{#if session?.user?.image}
					<img
						src={session.user.image}
						alt={session.user.name || 'User'}
						class="w-16 h-16 rounded-full"
					/>
				{:else}
					<div
						class="w-16 h-16 rounded-full bg-[#122555] flex items-center justify-center text-white font-bold text-2xl"
					>
						{session?.user?.name?.charAt(0).toUpperCase() || '?'}
					</div>
				{/if}
				<div>
					<h1 class="text-2xl font-bold text-[#122555]">{session?.user?.name || 'Utilisateur'}</h1>
					<p class="text-[#122555]/60">{session?.user?.email}</p>
				</div>
			</div>
		</div>

		<!-- Stats Cards -->
		<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
			<div class="bg-white rounded-xl shadow p-4 border border-[#122555]/10">
				<p class="text-[#122555]/60 text-sm">Tentatives</p>
				<p class="text-3xl font-bold text-[#122555]">{stats.totalAttempts}</p>
			</div>
			<div class="bg-white rounded-xl shadow p-4 border border-[#122555]/10">
				<p class="text-[#122555]/60 text-sm">Score moyen</p>
				<p class="text-3xl font-bold {getScoreColor(stats.avgScore)}">{stats.avgScore}%</p>
			</div>
			<div class="bg-white rounded-xl shadow p-4 border border-[#122555]/10">
				<p class="text-[#122555]/60 text-sm flex items-center gap-1">
					<BuildingIcon class="w-4 h-4" /> Meilleur Organisationnel
				</p>
				<p
					class="text-3xl font-bold {stats.bestScoreOrga
						? getScoreColor(stats.bestScoreOrga)
						: 'text-[#122555]/30'}"
				>
					{stats.bestScoreOrga !== null ? `${stats.bestScoreOrga}%` : '-'}
				</p>
			</div>
			<div class="bg-white rounded-xl shadow p-4 border border-[#122555]/10">
				<p class="text-[#122555]/60 text-sm flex items-center gap-1">
					<WalletIcon class="w-4 h-4" /> Meilleur Trésorerie
				</p>
				<p
					class="text-3xl font-bold {stats.bestScoreTreso
						? getScoreColor(stats.bestScoreTreso)
						: 'text-[#122555]/30'}"
				>
					{stats.bestScoreTreso !== null ? `${stats.bestScoreTreso}%` : '-'}
				</p>
			</div>
		</div>

		<div class="grid md:grid-cols-2 gap-8 mb-8">
			<!-- Category Stats -->
			<div class="bg-white rounded-2xl shadow-lg p-6 border border-[#122555]/10">
				<h2 class="text-xl font-bold text-[#122555] mb-4 flex items-center gap-2">
					<BarChartIcon class="w-5 h-5" /> Taux de réussite par catégorie
				</h2>
				{#if Object.keys(stats.categoryStats).length > 0}
					<div class="space-y-4">
						{#each Object.entries(stats.categoryStats) as [category, catData]}
							<div>
								<div class="flex justify-between mb-1">
									<span class="text-sm font-medium text-[#122555]">{category}</span>
									<span class="text-sm font-medium {getScoreColor(catData.percentage)}"
										>{catData.percentage}%</span
									>
								</div>
								<div class="w-full bg-[#122555]/10 rounded-full h-2.5">
									<div
										class="h-2.5 rounded-full transition-all duration-500 {catData.percentage >= 80
											? 'bg-green-500'
											: catData.percentage >= 60
												? 'bg-yellow-500'
												: 'bg-red-500'}"
										style="width: {catData.percentage}%"
									></div>
								</div>
								<p class="text-xs text-[#122555]/50 mt-1">
									{catData.correct}/{catData.total} questions
								</p>
							</div>
						{/each}
					</div>
				{:else}
					<p class="text-[#122555]/50 text-center py-8">Aucune donnée disponible</p>
				{/if}
			</div>

			<!-- Progression Chart -->
			<div class="bg-white rounded-2xl shadow-lg p-6 border border-[#122555]/10">
				<h2 class="text-xl font-bold text-[#122555] mb-4 flex items-center gap-2">
					<TrendingUpIcon class="w-5 h-5" /> Progression
				</h2>
				{#if chartDataOrga.length > 0 || chartDataTreso.length > 0}
					<div class="w-full">
						<svg viewBox="0 0 {chartWidth} {chartHeight}" class="w-full h-auto">
							<!-- Grid lines -->
							{#each [0, 25, 50, 75, 100] as tick}
								<line
									x1={padding.left}
									y1={scaleY(tick)}
									x2={chartWidth - padding.right}
									y2={scaleY(tick)}
									stroke="#e5e7eb"
									stroke-width="1"
								/>
								<text
									x={padding.left - 8}
									y={scaleY(tick)}
									text-anchor="end"
									dominant-baseline="middle"
									class="text-xs fill-[#122555]/60"
									font-size="10"
								>
									{tick}%
								</text>
							{/each}

							<!-- X-axis label -->
							<text
								x={chartWidth / 2}
								y={chartHeight - 5}
								text-anchor="middle"
								class="text-xs fill-[#122555]/60"
								font-size="10"
							>
								Tentatives
							</text>

							<!-- Organisationnelle line -->
							{#if chartDataOrga.length > 0}
								<path
									d={generatePath(chartDataOrga, chartDataOrga.length)}
									fill="none"
									stroke="#122555"
									stroke-width="2.5"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
								{#each chartDataOrga as point}
									<circle
										cx={scaleX(point.index, chartDataOrga.length)}
										cy={scaleY(point.score)}
										r="5"
										fill="#122555"
									/>
									<title>{formatShortDate(point.date)}: {point.score}%</title>
								{/each}
							{/if}

							<!-- Trésorerie line -->
							{#if chartDataTreso.length > 0}
								<path
									d={generatePath(chartDataTreso, chartDataTreso.length)}
									fill="none"
									stroke="#10b981"
									stroke-width="2.5"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
								{#each chartDataTreso as point}
									<circle
										cx={scaleX(point.index, chartDataTreso.length)}
										cy={scaleY(point.score)}
										r="5"
										fill="#10b981"
									/>
									<title>{formatShortDate(point.date)}: {point.score}%</title>
								{/each}
							{/if}

							<!-- Axes -->
							<line
								x1={padding.left}
								y1={padding.top}
								x2={padding.left}
								y2={chartHeight - padding.bottom}
								stroke="#122555"
								stroke-width="1.5"
							/>
							<line
								x1={padding.left}
								y1={chartHeight - padding.bottom}
								x2={chartWidth - padding.right}
								y2={chartHeight - padding.bottom}
								stroke="#122555"
								stroke-width="1.5"
							/>
						</svg>
					</div>
					<div class="flex justify-center gap-6 mt-4">
						<div class="flex items-center gap-2">
							<div class="w-3 h-3 rounded-full bg-[#122555]"></div>
							<span class="text-sm text-[#122555]">Organisationnelle ({chartDataOrga.length})</span>
						</div>
						<div class="flex items-center gap-2">
							<div class="w-3 h-3 rounded-full bg-emerald-500"></div>
							<span class="text-sm text-[#122555]">Trésorerie ({chartDataTreso.length})</span>
						</div>
					</div>
				{:else}
					<div class="h-64 flex items-center justify-center">
						<p class="text-[#122555]/50">Aucune donnée de progression</p>
					</div>
				{/if}
			</div>
		</div>

		<!-- Recent Attempts -->
		<div class="bg-white rounded-2xl shadow-lg p-6 border border-[#122555]/10">
			<h2 class="text-xl font-bold text-[#122555] mb-4 flex items-center gap-2">
				<ClipboardListIcon class="w-5 h-5" /> Historique des tentatives
			</h2>
			{#if stats.recentAttempts.length > 0}
				<div class="overflow-x-auto">
					<table class="w-full">
						<thead>
							<tr class="border-b border-[#122555]/10">
								<th class="text-left py-3 px-2 text-[#122555]/60 text-sm font-medium">Date</th>
								<th class="text-left py-3 px-2 text-[#122555]/60 text-sm font-medium">Mode</th>
								<th class="text-center py-3 px-2 text-[#122555]/60 text-sm font-medium">Score</th>
								<th class="text-center py-3 px-2 text-[#122555]/60 text-sm font-medium"
									>Questions</th
								>
								<th class="text-center py-3 px-2 text-[#122555]/60 text-sm font-medium">Temps</th>
							</tr>
						</thead>
						<tbody>
							{#each stats.recentAttempts as attempt}
								<tr class="border-b border-[#122555]/5 hover:bg-[#122555]/5 transition-colors">
									<td class="py-3 px-2 text-[#122555]">{formatDate(attempt.created_at)}</td>
									<td class="py-3 px-2">
										<span
											class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium {attempt.exam_mode ===
											'organisationnelle'
												? 'bg-blue-100 text-blue-800'
												: 'bg-green-100 text-green-800'}"
										>
											{attempt.exam_mode === 'organisationnelle'
												? '🏢 Organisationnel'
												: '💰 Trésorerie'}
										</span>
									</td>
									<td class="py-3 px-2 text-center">
										<span
											class="inline-flex items-center px-3 py-1 rounded-lg font-bold {getScoreBgColor(
												attempt.score
											)} {getScoreColor(attempt.score)} border"
										>
											{attempt.score}%
										</span>
									</td>
									<td class="py-3 px-2 text-center text-[#122555]/70">
										{attempt.correct_answers}/{attempt.total_questions}
									</td>
									<td class="py-3 px-2 text-center text-[#122555]/70">
										{formatTime(Math.round(attempt.time_spent))}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			{:else}
				<p class="text-[#122555]/50 text-center py-8">Aucune tentative enregistrée</p>
			{/if}
		</div>
	</div>
</div>
