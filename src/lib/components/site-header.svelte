<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { page } from '$app/stores';

	// Simple breadcrumb logic based on URL
	// /admin -> Dashboard
	// /admin/questions -> Questions
	// /admin/questions/new -> Questions > Nouvelle
	// /admin/import -> Import

	let breadcrumbs = $derived.by(() => {
		const path = $page.url.pathname;
		const segments = path.split('/').filter(Boolean);
		// segments[0] is 'admin'

		const crumbs = [{ label: 'Dashboard', href: '/admin' }];

		if (segments.length > 1) {
			if (segments[1] === 'questions') {
				crumbs.push({ label: 'Questions', href: '/admin/questions' });
				if (segments[2] === 'new') {
					crumbs.push({ label: 'Nouvelle question', href: '/admin/questions/new' });
				} else if (segments[2]) {
					crumbs.push({ label: 'Édition', href: $page.url.pathname });
				}
			} else if (segments[1] === 'import') {
				crumbs.push({ label: 'Import JSON', href: '/admin/import' });
			}
		}
		return crumbs;
	});
</script>

<header
	class="flex h-16 shrink-0 items-center gap-2 px-4 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b border-[#122555]/10"
>
	<div class="flex items-center gap-2">
		<Sidebar.Trigger class="-ml-1" />
		<Separator orientation="vertical" class="mr-2 h-4" />
		<Breadcrumb.Root>
			<Breadcrumb.List>
				{#each breadcrumbs as crumb, i}
					<Breadcrumb.Item>
						{#if i === breadcrumbs.length - 1}
							<Breadcrumb.Page>{crumb.label}</Breadcrumb.Page>
						{:else}
							<Breadcrumb.Link href={crumb.href}>{crumb.label}</Breadcrumb.Link>
						{/if}
					</Breadcrumb.Item>
					{#if i < breadcrumbs.length - 1}
						<Breadcrumb.Separator />
					{/if}
				{/each}
			</Breadcrumb.List>
		</Breadcrumb.Root>
	</div>
</header>
