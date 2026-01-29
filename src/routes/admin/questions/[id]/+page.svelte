<script lang="ts">
	import { enhance } from '$app/forms';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import TrashIcon from '@lucide/svelte/icons/trash-2';

	let { data } = $props();

	let answers = $state(
		data.question.answers.length > 0
			? data.question.answers.map((a: any) => ({
					id: a.id,
					text: a.text,
					correct: a.is_correct === 1,
					rationale: a.rationale || ''
				}))
			: [
					{ id: Date.now(), text: '', correct: false, rationale: '' },
					{ id: Date.now() + 1, text: '', correct: false, rationale: '' }
				]
	);

	function addAnswer() {
		answers = [...answers, { id: Date.now(), text: '', correct: false, rationale: '' }];
	}

	function removeAnswer(index: number) {
		if (answers.length <= 2) return;
		answers = answers.filter((_, i) => i !== index);
	}
</script>

<div class="max-w-3xl mx-auto space-y-6">
	<div class="flex justify-between items-center">
		<h2 class="text-2xl font-bold text-[#122555]">Modifier la question</h2>
	</div>

	<div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
		<form method="POST" use:enhance class="space-y-6">
			<!-- Category & Question -->
			<div class="grid gap-6">
				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
					<select
						name="category"
						required
						value={data.question.category_id}
						class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#122555] focus:border-transparent bg-white"
					>
						<option value="">Sélectionner une catégorie</option>
						{#each data.categories as category}
							<option value={category.id}>{category.name}</option>
						{/each}
					</select>
				</div>

				<div>
					<label class="block text-sm font-medium text-gray-700 mb-1">Question</label>
					<textarea
						name="question"
						required
						rows="3"
						class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#122555] focus:border-transparent"
						placeholder="Intitulé de la question">{data.question.question_text}</textarea
					>
				</div>
			</div>

			<!-- Answers -->
			<div class="space-y-4">
				<div class="flex justify-between items-center">
					<label class="block text-sm font-medium text-gray-700">Réponses</label>
					<button
						type="button"
						onclick={addAnswer}
						class="text-sm text-[#122555] hover:underline flex items-center gap-1"
					>
						<PlusIcon class="w-4 h-4" /> Ajouter une réponse
					</button>
				</div>

				{#each answers as answer, i}
					<div
						class="p-4 bg-gray-50 rounded-lg border border-gray-200 relative group animate-fade-in"
					>
						<div class="grid gap-4">
							<div class="flex gap-4">
								<div class="flex-1">
									<input
										type="text"
										name="answers[{i}][text]"
										value={answer.text}
										placeholder="Texte de la réponse"
										required
										class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#122555] focus:border-transparent"
									/>
								</div>
								<div class="flex items-center gap-2 pt-2">
									<input
										type="checkbox"
										name="answers[{i}][correct]"
										id="correct-{i}"
										checked={answer.correct}
										class="w-4 h-4 text-[#122555] rounded focus:ring-[#122555]"
									/>
									<label for="correct-{i}" class="text-sm text-gray-600">Correct</label>
								</div>
								{#if answers.length > 2}
									<button
										type="button"
										onclick={() => removeAnswer(i)}
										class="text-gray-400 hover:text-red-500 transition-colors p-2"
									>
										<TrashIcon class="w-4 h-4" />
									</button>
								{/if}
							</div>
							<div>
								<input
									type="text"
									name="answers[{i}][rationale]"
									value={answer.rationale}
									placeholder="Explication (optionnel)"
									class="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#122555] focus:border-transparent text-sm"
								/>
							</div>
						</div>
					</div>
				{/each}
			</div>

			<div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
				<a
					href="/admin/questions"
					class="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Annuler</a
				>
				<button
					type="submit"
					class="px-6 py-2 bg-[#122555] text-white rounded-lg hover:bg-[#0d1a3d] transition-colors"
					>Enregistrer</button
				>
			</div>
		</form>
	</div>
</div>
