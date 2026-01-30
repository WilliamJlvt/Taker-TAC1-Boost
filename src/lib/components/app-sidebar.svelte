<script lang="ts" module>
	import LayoutDashboardIcon from '@lucide/svelte/icons/layout-dashboard';
	import FileQuestionIcon from '@lucide/svelte/icons/file-question';
	import FolderOpenIcon from '@lucide/svelte/icons/folder-open';
	import UploadIcon from '@lucide/svelte/icons/upload';
	import UsersIcon from '@lucide/svelte/icons/users';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';

	// Menu items.
	const items = [
		{
			title: 'Tableau de bord',
			url: '/admin',
			icon: LayoutDashboardIcon
		},
		{
			title: 'Questions',
			url: '/admin/questions',
			icon: FileQuestionIcon
		},
		{
			title: 'Utilisateurs',
			url: '/admin/users',
			icon: UsersIcon
		},
		{
			title: 'Import JSON',
			url: '/admin/import',
			icon: UploadIcon
		}
	];
</script>

<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import type { ComponentProps } from 'svelte';
	import { page } from '$app/stores';
	import logo from '$lib/assets/logo.svg';

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root {...restProps} bind:ref>
	<Sidebar.Header>
		<div class="flex items-center gap-2 px-2 py-2">
			<div class="flex h-8 w-8 items-center justify-center rounded-lg">
				<img src={logo} alt="Logo" class="size-8" />
			</div>
			<div class="grid flex-1 text-left text-sm leading-tight">
				<span class="truncate font-semibold">TACBoost Admin</span>
				<span class="truncate text-xs text-muted-foreground">Administration</span>
			</div>
		</div>
	</Sidebar.Header>
	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel>Application</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each items as item}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton isActive={$page.url.pathname === item.url}>
								{#snippet child({ props }: { props: Record<string, unknown> })}
									<a href={item.url} {...props}>
										<item.icon />
										<span>{item.title}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>
	<Sidebar.Footer>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton>
					{#snippet child({ props }: { props: Record<string, unknown> })}
						<a href="/" {...props}>
							<ArrowLeftIcon />
							<span>Retour au site</span>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Footer>
	<Sidebar.Rail />
</Sidebar.Root>
