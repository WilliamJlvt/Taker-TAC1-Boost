<script lang="ts">
	import { enhance } from '$app/forms';
	import * as Table from '$lib/components/ui/table';
	import * as Card from '$lib/components/ui/card';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import MoreHorizontal from '@lucide/svelte/icons/more-horizontal';
	import TrendingUpIcon from '@lucide/svelte/icons/trending-up';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Shield from '@lucide/svelte/icons/shield';
	import ShieldAlert from '@lucide/svelte/icons/shield-alert';
	import * as Select from '$lib/components/ui/select';

	let { data } = $props();

	function handleRoleChange(userId: string, newRole: string) {
		const form = document.querySelector('#global-role-form') as HTMLFormElement;
		if (form) {
			const idInput = form.querySelector('input[name="id"]') as HTMLInputElement;
			const roleInput = form.querySelector('input[name="role"]') as HTMLInputElement;
			idInput.value = userId;
			roleInput.value = newRole;
			form.requestSubmit();
		}
	}
</script>

<form id="global-role-form" action="?/updateRole" method="POST" use:enhance class="hidden">
	<input type="hidden" name="id" />
	<input type="hidden" name="role" />
</form>

<div class="space-y-6 mt-8">
	<div class="flex items-center justify-between">
		<h2 class="text-2xl font-bold text-[#122555]">Utilisateurs</h2>
	</div>

	<Card.Root>
		<Card.Content class="p-0">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head class="w-[80px]">Avatar</Table.Head>
						<Table.Head>Nom</Table.Head>
						<Table.Head>Email</Table.Head>
						<Table.Head class="w-[200px]">Rôle</Table.Head>
						<Table.Head>Inscrit le</Table.Head>
						<Table.Head class="text-right">Actions</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.users as user (user.id)}
						<Table.Row>
							<Table.Cell>
								{#if user.image}
									<img
										src={user.image}
										alt={user.name}
										class="w-10 h-10 rounded-full object-cover"
									/>
								{:else}
									<div
										class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold"
									>
										{user.name.charAt(0).toUpperCase()}
									</div>
								{/if}
							</Table.Cell>
							<Table.Cell class="font-medium">{user.name}</Table.Cell>
							<Table.Cell>{user.email}</Table.Cell>
							<Table.Cell>
								{#if user.isHardcodedAdmin}
									<span
										class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200"
										title="Administrateur Système (Config)"
									>
										<ShieldAlert class="w-3 h-3" />
										Admin ★
									</span>
								{:else}
									<Select.Root
										type="single"
										value={user.role}
										onValueChange={(v) => handleRoleChange(user.id, v)}
										disabled={user.id === data.user?.id}
									>
										<Select.Trigger class="w-[160px] h-9 bg-white text-xs">
											<span data-slot="select-value" class="truncate flex items-center gap-2">
												{#if user.role === 'admin'}
													<ShieldAlert class="w-3 h-3 text-purple-600" />
													Admin
												{:else}
													<Shield class="w-3 h-3 text-gray-600" />
													Utilisateur
												{/if}
											</span>
										</Select.Trigger>
										<Select.Content>
											<Select.Item value="user" class="text-xs">
												<div class="flex items-center gap-2">
													<Shield class="w-3 h-3" />
													Utilisateur
												</div>
											</Select.Item>
											<Select.Item value="admin" class="text-xs">
												<div class="flex items-center gap-2">
													<ShieldAlert class="w-3 h-3" />
													Administrateur
												</div>
											</Select.Item>
										</Select.Content>
									</Select.Root>
								{/if}
							</Table.Cell>
							<Table.Cell>
								{user.created_at
									? new Date(user.created_at).toLocaleDateString('fr-FR', {
											day: 'numeric',
											month: 'short',
											year: 'numeric'
										})
									: 'N/A'}
							</Table.Cell>
							<Table.Cell class="text-right">
								<DropdownMenu.Root>
									<DropdownMenu.Trigger>
										{#snippet child({ props })}
											<Button {...props} variant="ghost" size="icon" class="h-8 w-8 p-0">
												<span class="sr-only">Ouvrir menu</span>
												<MoreHorizontal class="h-4 w-4" />
											</Button>
										{/snippet}
									</DropdownMenu.Trigger>
									<DropdownMenu.Content align="end" class="w-48 bg-white">
										<DropdownMenu.Label>Actions</DropdownMenu.Label>
										<DropdownMenu.Separator />
										<DropdownMenu.Item>
											{#snippet child({ props })}
												<a {...props} href="/admin/users/{user.id}" class="flex items-center">
													<TrendingUpIcon class="mr-2 h-4 w-4" />
													Voir le profil
												</a>
											{/snippet}
										</DropdownMenu.Item>
										<DropdownMenu.Separator />
										<form action="?/delete" method="POST" use:enhance>
											<input type="hidden" name="id" value={user.id} />
											<button
												type="submit"
												class="w-full flex items-center px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-sm cursor-pointer"
												disabled={user.id === data.user?.id || user.isHardcodedAdmin}
												onclick={(e) => {
													if (
														!confirm(
															'Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.'
														)
													) {
														e.preventDefault();
													}
												}}
											>
												<Trash2 class="mr-2 h-4 w-4" />
												Supprimer
											</button>
										</form>
									</DropdownMenu.Content>
								</DropdownMenu.Root>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Content>
	</Card.Root>
</div>
