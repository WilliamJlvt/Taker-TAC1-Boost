<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import SearchIcon from '@lucide/svelte/icons/search';
	import TrashIcon from '@lucide/svelte/icons/trash-2';
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';

	let { data } = $props();

	let searchTimeout: NodeJS.Timeout;
	function handleSearch(e: Event) {
		const value = (e.target as HTMLInputElement).value;
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			const url = new URL($page.url);
			if (value) url.searchParams.set('search', value);
			else url.searchParams.delete('search');
			url.searchParams.set('page', '1');
			goto(url);
		}, 300);
	}

	function handleCategoryChange(e: Event) {
		const value = (e.target as HTMLSelectElement).value;
		const url = new URL($page.url);
		if (value) url.searchParams.set('category', value);
		else url.searchParams.delete('category');
		url.searchParams.set('page', '1');
		goto(url);
	}

	function changePage(newPage: number) {
		const url = new URL($page.url);
		url.searchParams.set('page', newPage.toString());
		goto(url);
	}
</script>

<div class="space-y-6">
	<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
		<h2 class="text-2xl font-bold text-[#122555]">Questions</h2>
		<a
			href="/admin/questions/new"
			class="px-4 py-2 bg-[#122555] text-white rounded-lg hover:bg-[#0d1a3d] transition-colors flex items-center gap-2"
		>
			<PlusIcon class="w-5 h-5" />
			Nouvelle question
		</a>
	</div>

	<!-- Filters -->
	<div
		class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4"
	>
		<div class="relative flex-1">
			<SearchIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
			<input
				type="text"
				placeholder="Rechercher une question..."
				value={data.filters.search || ''}
				oninput={handleSearch}
				class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#122555] focus:border-transparent"
			/>
		</div>
		<select
			value={data.filters.categoryId || ''}
			onchange={handleCategoryChange}
			class="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#122555] focus:border-transparent bg-white"
		>
			<option value="">Toutes les catégories</option>
			{#each data.categories as category}
				<option value={category.id}>{category.name}</option>
			{/each}
		</select>
	</div>

	<!-- Questions List -->
	<div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
		<table class="w-full text-left">
			<thead class="bg-gray-50 border-b border-gray-100">
				<tr>
					<th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase w-2/3">Question</th>
					<th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Catégorie</th>
					<th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase text-right">Actions</th
					>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-100">
				{#each data.questions as question}
					<tr class="hover:bg-gray-50 transition-colors group">
						<td class="px-6 py-4">
							<p class="font-medium text-[#122555] line-clamp-2">{question.question_text}</p>
							<p class="text-xs text-gray-400 mt-1">{question.answer_count} réponses</p>
						</td>
						<td class="px-6 py-4">
							<span class="px-2 py-1 rounded bg-gray-100 text-xs font-medium text-gray-600">
								{question.category_name}
							</span>
						</td>
						<td class="px-6 py-4 text-right">
							<div
								class="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
							>
								<a
									href="/admin/questions/{question.id}"
									class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
									title="Modifier"
								>
									<PencilIcon class="w-4 h-4" />
								</a>
								<form method="POST" action="?/delete" use:enhance>
									<input type="hidden" name="id" value={question.id} />
									<button
										type="submit"
										class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
										title="Supprimer"
										onclick={() => !confirm('Êtes-vous sûr ?') && event.preventDefault()}
									>
										<TrashIcon class="w-4 h-4" />
									</button>
								</form>
							</div>
						</td>
					</tr>
				{/each}
				{#if data.questions.length === 0}
					<tr>
						<td colspan="3" class="px-6 py-12 text-center text-gray-500">Aucune question trouvée</td
						>
					</tr>
				{/if}
			</tbody>
		</table>

		<!-- Pagination -->
		<div class="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
			<button
				onclick={() => changePage(data.filters.page - 1)}
				disabled={data.filters.page <= 1}
				class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
			>
				<ChevronLeftIcon class="w-4 h-4" />
				Précédent
			</button>
			<span class="text-sm text-gray-500">Page {data.filters.page}</span>
			<button
				onclick={() => changePage(data.filters.page + 1)}
				disabled={data.questions.length < 20}
				class="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
			>
				Suivant
				<ChevronRightIcon class="w-4 h-4" />
			</button>
		</div>
	</div>
</div>
