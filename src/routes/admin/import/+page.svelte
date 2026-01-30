<script lang="ts">
	import { enhance } from '$app/forms';
	import UploadIcon from '@lucide/svelte/icons/upload';
	import * as Select from '$lib/components/ui/select';

	let { data, form } = $props();
	let uploading = $state(false);
	let fileName = $state('');
	let categoryId = $state('');

	const selectedCategoryLabel = $derived(
		data.categories.find((c) => c.id.toString() === categoryId)?.name ??
			'Sélectionner une catégorie'
	);

	function handleFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			fileName = target.files[0].name;
		}
	}
</script>

<div class="max-w-6xl mx-auto space-y-8 mt-8">
	<div class="flex justify-center items-center">
		<h2 class="text-3xl font-bold text-[#122555]">Importer des questions</h2>
	</div>

	<!-- Success / Error Messages -->
	{#if form?.success}
		<div
			class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl animate-fade-in shadow-sm"
		>
			<p class="font-bold flex items-center gap-2">✅ Import réussi !</p>
			<p class="mt-1">{form.added} questions importées avec succès.</p>
			{#if form.errors.length > 0}
				<div class="mt-3 text-sm bg-green-100 p-3 rounded-lg">
					<p class="font-semibold mb-1 text-green-800">
						Cependant, quelques erreurs sont survenues :
					</p>
					<ul class="list-disc list-inside space-y-1 text-green-800">
						{#each form.errors as error}
							<li>{error}</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>
	{/if}

	{#if form?.error}
		<div
			class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl animate-fade-in shadow-sm"
		>
			<p class="font-bold flex items-center gap-2">❌ Erreur</p>
			<p class="mt-1">{form.error}</p>
		</div>
	{/if}

	<div class="bg-white p-8 rounded-xl border border-gray-100 shadow-sm">
		<form
			method="POST"
			enctype="multipart/form-data"
			use:enhance={() => {
				uploading = true;
				return async ({ update }) => {
					await update();
					uploading = false;
				};
			}}
			class="space-y-8"
		>
			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2"
					>1. Choisissez une catégorie cible</label
				>
				<Select.Root type="single" name="category" bind:value={categoryId} required>
					<Select.Trigger class="w-full bg-white">
						<span data-slot="select-value" class="truncate">{selectedCategoryLabel}</span>
					</Select.Trigger>
					<Select.Content>
						{#each data.categories as category}
							<Select.Item value={category.id.toString()}>{category.name}</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
				<p class="mt-2 text-xs text-gray-500">
					Toutes les questions importées seront liées à cette catégorie.
				</p>
			</div>

			<div>
				<label class="block text-sm font-medium text-gray-700 mb-2"
					>2. Téléchargez votre fichier JSON</label
				>
				<div
					class="mt-1 flex justify-center px-6 pt-10 pb-10 border-2 border-gray-300 border-dashed rounded-xl hover:border-[#122555] hover:bg-gray-50 transition-all cursor-pointer group"
					onclick={() => document.getElementById('file-upload')?.click()}
				>
					<div class="space-y-2 text-center">
						<div
							class="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300"
						>
							<UploadIcon
								class="h-8 w-8 text-gray-500 group-hover:text-[#122555] transition-colors"
							/>
						</div>
						<div class="flex text-sm text-gray-600 justify-center">
							<label
								for="file-upload"
								class="relative cursor-pointer rounded-md font-medium text-[#122555] hover:text-[#0d1a3d] focus-within:outline-none"
							>
								<span>Cliquez pour upload</span>
								<input
									id="file-upload"
									name="file"
									type="file"
									accept=".json"
									class="sr-only"
									required
									onchange={handleFileChange}
								/>
							</label>
							<p class="pl-1">ou glissez-déposez</p>
						</div>
						<p class="text-xs text-gray-500" id="file-name-display">
							{fileName || "JSON jusqu'à 10MB"}
						</p>
					</div>
				</div>
			</div>

			<div class="flex justify-center pt-4 border-t border-gray-100">
				<button
					type="submit"
					disabled={uploading}
					class="px-8 py-3 bg-[#122555] text-white font-medium rounded-xl hover:bg-[#0d1a3d] hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none flex items-center gap-2"
				>
					{#if uploading}
						<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
						Import en cours...
					{:else}
						<UploadIcon class="w-4 h-4" />
						Lancer l'importation
					{/if}
				</button>
			</div>
		</form>
	</div>
</div>
