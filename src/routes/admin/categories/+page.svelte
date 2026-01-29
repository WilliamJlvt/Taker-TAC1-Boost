<script lang="ts">
	import { enhance } from '$app/forms';
	import FolderPlusIcon from '@lucide/svelte/icons/folder-plus';

	let { data, form } = $props();
	let creating = $state(false);
</script>

<div class="space-y-6">
	<div class="flex justify-between items-center">
		<h2 class="text-2xl font-bold text-[#122555]">Catégories</h2>
		<button
			onclick={() => (creating = !creating)}
			class="px-4 py-2 bg-[#122555] text-white rounded-lg hover:bg-[#0d1a3d] transition-colors flex items-center gap-2"
		>
			<FolderPlusIcon class="w-5 h-5" />
			Nouvelle catégorie
		</button>
	</div>

	{#if creating}
		<div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm animate-fade-in">
			<h3 class="font-bold text-lg mb-4">Ajouter une catégorie</h3>
			<form method="POST" action="?/create" use:enhance onsubmit={() => (creating = false)}>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
						<input
							name="name"
							type="text"
							required
							class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#122555] focus:border-transparent"
							placeholder="Ex: Mouvement"
						/>
					</div>
					<div>
						<label class="block text-sm font-medium text-gray-700 mb-1">Slug</label>
						<input
							name="slug"
							type="text"
							required
							class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#122555] focus:border-transparent"
							placeholder="Ex: mouvement"
						/>
					</div>
					<div class="md:col-span-2">
						<label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
						<textarea
							name="description"
							rows="2"
							class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#122555] focus:border-transparent"
						></textarea>
					</div>
				</div>
				<div class="flex justify-end gap-2">
					<button
						type="button"
						onclick={() => (creating = false)}
						class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
						>Annuler</button
					>
					<button
						type="submit"
						class="px-4 py-2 bg-[#122555] text-white rounded-lg hover:bg-[#0d1a3d] transition-colors"
						>Enregistrer</button
					>
				</div>
			</form>
		</div>
	{/if}

	<div class="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
		<table class="w-full text-left">
			<thead class="bg-gray-50 border-b border-gray-100">
				<tr>
					<th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Nom</th>
					<th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Slug</th>
					<th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Description</th>
					<th class="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Créé le</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-100">
				{#each data.categories as category}
					<tr class="hover:bg-gray-50 transition-colors">
						<td class="px-6 py-4 font-medium text-[#122555]">{category.name}</td>
						<td
							class="px-6 py-4 text-gray-500 font-mono text-xs bg-gray-100/50 rounded inline-block m-2 px-2 py-1"
							>{category.slug}</td
						>
						<td class="px-6 py-4 text-gray-500">{category.description || '-'}</td>
						<td class="px-6 py-4 text-gray-500 text-sm"
							>{new Date(category.created_at).toLocaleDateString()}</td
						>
					</tr>
				{/each}
				{#if data.categories.length === 0}
					<tr>
						<td colspan="4" class="px-6 py-12 text-center text-gray-500"
							>Aucune catégorie trouvée</td
						>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
</div>
